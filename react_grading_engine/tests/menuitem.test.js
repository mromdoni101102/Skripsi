/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

// ======================================================================
// TIDAK ADA MOCKING DEPENDENSI KARENA KODE INI MANDIRI
// ======================================================================


// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen utama dari file jawaban mahasiswa.
const MenuItem = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen MenuItem', () => {

    // Siapkan fungsi 'mock' untuk prop onAdd agar bisa kita lacak panggilannya
    const mockOnAdd = jest.fn();

    // Data properti (props) dummy untuk digunakan dalam tes
    const itemProps = {
        name: 'Nasi Goreng Spesial',
        price: 35000,
        onAdd: mockOnAdd
    };

    // Membersihkan mock sebelum setiap tes dijalankan
    beforeEach(() => {
        mockOnAdd.mockClear();
        // Render komponen dengan props dummy sebelum setiap tes
        render(<MenuItem {...itemProps} />);
    });

    test('Kriteria 1: Harus menampilkan nama dan harga item dengan benar', () => {
        // Cari elemen nama berdasarkan perannya sebagai heading
        const nameElement = screen.getByRole('heading', { name: /Nasi Goreng Spesial/i });
        expect(nameElement).toBeInTheDocument();

        // Cari elemen harga. Menggunakan regex agar lebih fleksibel dengan format (Rp 35.000 atau Rp 35,000)
        const priceElement = screen.getByText(/Rp 35[.,]000/);
        expect(priceElement).toBeInTheDocument();
    });

    test('Kriteria 2: Harus menampilkan tombol "Tambah"', () => {
        const addButton = screen.getByRole('button', { name: /Tambah/i });
        expect(addButton).toBeInTheDocument();
    });

    test('Kriteria 3: Fungsi "onAdd" harus terpanggil saat tombol "Tambah" diklik', () => {
        const addButton = screen.getByRole('button', { name: /Tambah/i });

        // Simulasikan klik pada tombol
        fireEvent.click(addButton);

        // Periksa apakah fungsi onAdd (yang sudah kita mock) dipanggil
        expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    test('Kriteria 4: Struktur komponen harus benar (div > div > h2 + p dan button)', () => {
        // Ambil container utama yang dirender
        const { container } = render(<MenuItem {...itemProps} />);
        const mainDiv = container.firstChild;

        // Pastikan pembungkus utamanya adalah div
        expect(mainDiv.tagName.toLowerCase()).toBe('div');

        // Pastikan di dalamnya ada div untuk teks dan ada button
        const contentDiv = mainDiv.querySelector('div');
        const button = mainDiv.querySelector('button');

        expect(contentDiv).toBeInTheDocument();
        expect(button).toBeInTheDocument();

        // Pastikan di dalam contentDiv ada h2 dan p
        expect(contentDiv.querySelector('h2')).toBeInTheDocument();
        expect(contentDiv.querySelector('p')).toBeInTheDocument();
    });

    test('Kriteria 5: Komponen "MenuItem" harus diexport dengan benar', () => {
        expect(MenuItem).toBeDefined();
    });
});
