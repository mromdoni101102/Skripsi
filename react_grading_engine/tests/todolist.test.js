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

 test('Kriteria 1 [W=8]: Harus menampilkan heading dengan nama person yang benar', () => {
    const heading = screen.getByRole('heading', { level: 1, name: "Gregorio Y. Zara's Todos" });
    expect(heading).toBeInTheDocument();
  });

  test('Kriteria 2 [W=4]: Harus menampilkan sebuah elemen gambar (avatar)', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
  });

  test('Kriteria 3 [W=8]: Gambar avatar harus memiliki sumber (src) yang benar', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://i.imgur.com/7vQD0fPs.jpg');
  });

  test('Kriteria 4 [W=8]: Gambar avatar harus memiliki teks alternatif (alt) yang benar', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('alt', 'Gregorio Y. Zara');
  });

  test('Kriteria 5 [W=4]: Gambar avatar harus memiliki class "avatar"', () => {
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveClass('avatar');
  });

  test('Kriteria 6 [W=8]: Harus menampilkan daftar todo dengan struktur yang benar', () => {
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  // Bobot lebih tinggi karena membutuhkan proses mapping/looping data.
  test('Kriteria 7 [W=10]: Harus menampilkan semua item todo dengan teks yang benar', () => {
    ['Improve the videophone', 'Prepare aeronautics lectures', 'Work on the alcohol-fuelled engine']
      .forEach(item => expect(screen.getByText(item)).toBeInTheDocument());
  });

  test('Kriteria 8 [W=5]: Item todo harus ditampilkan dalam urutan yang benar', () => {
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent('Improve the videophone');
    expect(listItems[1]).toHaveTextContent('Prepare aeronautics lectures');
    expect(listItems[2]).toHaveTextContent('Work on the alcohol-fuelled engine');
  });

  test('Kriteria 9 [W=5]: Container harus menerapkan styling theme dengan benar', () => {
    const container = screen.getByRole('heading').parentElement;
    expect(container.style.backgroundColor).not.toBe('');
    expect(container.style.color).not.toBe('');
  });

  // Bobot lebih tinggi karena membutuhkan konstruksi URL dari beberapa variabel.
  test('Kriteria 10 [W=10]: URL gambar harus dikonstruksi dengan benar dari baseUrl dan data person', () => {
    const avatar = screen.getByRole('img');
    const src = avatar.getAttribute('src');
    expect(src).toContain('https://i.imgur.com/');
    expect(src).toContain('7vQD0fP');
  });

  test('Kriteria 11 [W=5]: Struktur layout komponen harus sesuai (div > heading + image + list)', () => {
    const { container } = render(<TodoList />);
    const mainDiv = container.firstChild;
    expect(mainDiv.tagName.toLowerCase()).toBe('div');
    expect(mainDiv.querySelector('h1')).toBeInTheDocument();
    expect(mainDiv.querySelector('img.avatar')).toBeInTheDocument();
    expect(mainDiv.querySelector('ul')).toBeInTheDocument();
  });

  test('Kriteria 12 [W=2]: Komponen "TodoList" harus diexport dengan benar', () => {
    expect(TodoList).toBeDefined();
    expect(typeof TodoList).toBe('function');
  });

  test('Kriteria 13 [W=3]: Komponen harus dapat di-render tanpa error', () => {
    expect(() => render(<TodoList />)).not.toThrow();
  });

  // Bobot lebih tinggi karena menguji penggunaan data dari sebuah objek (konsep props/state).
  test('Kriteria 14 [W=10]: Data person object harus digunakan dengan benar', () => {
    const heading = screen.getByText(/Gregorio Y. Zara/i);
    expect(heading).toBeInTheDocument();
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('alt', 'Gregorio Y. Zara');
  });

  // Bobot lebih tinggi karena menguji penggunaan data dari sebuah objek untuk styling.
  test('Kriteria 15 [W=10]: Theme object properties harus diaplikasikan dengan benar', () => {
    const container = screen.getByRole('heading').parentElement;
    expect(container.style.backgroundColor).not.toBe('');
    expect(container.style.color).not.toBe('');
  });
});
