/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ======================================================================
// BAGIAN 1: PERSIAPAN LINGKUNGAN
// ======================================================================

// Mocking (membuat tiruan) dari komponen 'next/image'.
// Ini diperlukan karena kita menjalankan tes di luar lingkungan Next.js.
jest.mock('next/image', () => {
  // eslint-disable-next-line @next/next/no-img-element
  return (props) => <img {...props} />;
});

// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA (Satu-satunya yang di-import)
// ======================================================================

// PENTING: Kode ini secara dinamis mengimpor file mahasiswa yang di-upload.
// Path-nya dikirim oleh Controller Laravel melalui environment variable.
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
const submission = require(process.env.SUBMISSION_PATH);
const TodoList = submission.TodoList || submission.default || submission;

// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL
// ======================================================================

// Ini adalah inti dari "kunci jawaban" Anda.
// Setiap 'test' adalah satu kriteria penilaian yang akan menghasilkan LULUS atau GAGAL.
describe('Praktikum: Komponen TodoList', () => {

  // Fungsi ini akan dijalankan sebelum setiap 'test' di bawah ini.
  // Tujuannya agar kita tidak perlu menulis `render(<TodoList />)` berulang kali.
  beforeEach(() => {
    render(<TodoList />);
  });

// Tes yang baru (lebih andal)
    test('Kriteria 1: Harus menampilkan heading dengan nama person yang benar', () => {
    // Kita cari heading level 1 yang memiliki teks LENGKAP yang kita inginkan.
    // Ini akan memastikan ia menemukan satu heading utuh.
    const heading = screen.getByRole('heading', {
        level: 1,
        name: "Gregorio Y. Zara's Todos"
    });
    expect(heading).toBeInTheDocument();
    });

  test('Kriteria 2: Harus menampilkan sebuah elemen gambar (avatar)', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
  });

  test('Kriteria 3: Gambar avatar harus memiliki sumber (src) yang benar', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://i.imgur.com/7vQD0fPs.jpg');
  });

  test('Kriteria 4: Gambar avatar harus memiliki teks alternatif (alt) yang benar', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('alt', 'Gregorio Y. Zara');
  });

  test('Kriteria 5: Gambar avatar harus memiliki class "avatar"', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveClass('avatar');
  });

  test('Kriteria 6: Harus menampilkan daftar todo dengan struktur yang benar', () => {
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  test('Kriteria 7: Harus menampilkan semua item todo dengan teks yang benar', () => {
    const todoItems = [
      'Improve the videophone',
      'Prepare aeronautics lectures',
      'Work on the alcohol-fuelled engine'
    ];

    todoItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('Kriteria 8: Item todo harus ditampilkan dalam urutan yang benar', () => {
    const listItems = screen.getAllByRole('listitem');

    expect(listItems[0]).toHaveTextContent('Improve the videophone');
    expect(listItems[1]).toHaveTextContent('Prepare aeronautics lectures');
    expect(listItems[2]).toHaveTextContent('Work on the alcohol-fuelled engine');
  });

  test('Kriteria 9: Container harus menerapkan styling theme dengan benar', () => {
    const container = screen.getByRole('heading').parentElement;
    expect(container).toBeInTheDocument();

    // Periksa bahwa style backgroundColor dan color telah diaplikasikan
    expect(container.style.backgroundColor).not.toBe('');
    expect(container.style.color).not.toBe('');
  });

  test('Kriteria 10: URL gambar harus dikonstruksi dengan benar dari baseUrl dan data person', () => {
    const avatar = screen.getByRole('img');
    const src = avatar.getAttribute('src');

    // Memastikan URL mengandung komponen yang benar
    expect(src).toContain('https://i.imgur.com/');
    expect(src).toContain('7vQD0fP');
    expect(src).toContain('s.jpg');
  });

  // Tes yang baru (memperbaiki error)
test('Kriteria 11: Struktur layout komponen harus sesuai (div > heading + image + list)', () => {
     const { container } = render(<TodoList />);
     const mainDiv = container.firstChild;

     expect(mainDiv).toBeInTheDocument();
     expect(mainDiv.tagName.toLowerCase()).toBe('div');

     // Cari elemen-elemen secara spesifik di dalam mainDiv
     const heading = mainDiv.querySelector('h1');
     const image = mainDiv.querySelector('img.avatar');
     const list = mainDiv.querySelector('ul');

    // Pastikan ketiga elemen tersebut ada di dalam mainDiv
     expect(heading).toBeInTheDocument();
     expect(image).toBeInTheDocument();
     expect(list).toBeInTheDocument();
});

  test('Kriteria 12: Komponen "TodoList" harus diexport dengan benar', () => {
    // Tes ini memastikan mahasiswa tidak lupa mengekspor komponen mereka
    expect(TodoList).toBeDefined();
    expect(typeof TodoList).toBe('function');
  });

  test('Kriteria 13: Komponen harus dapat di-render tanpa error', () => {
    expect(() => render(<TodoList />)).not.toThrow();
  });

  test('Kriteria 14: Data person object harus digunakan dengan benar', () => {
    // Test penggunaan nama dari person object
    const heading = screen.getByText(/Gregorio Y. Zara/i);
    expect(heading).toBeInTheDocument();

    // Test penggunaan nama untuk alt attribute
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('alt', 'Gregorio Y. Zara');
  });

  test('Kriteria 15: Theme object properties harus diaplikasikan dengan benar', () => {
    const container = screen.getByRole('heading').parentElement;

    expect(container).toBeInTheDocument();

    // Memastikan theme backgroundColor dan color tidak kosong
    expect(container.style.backgroundColor).not.toBe('');
    expect(container.style.color).not.toBe('');
  });
});
