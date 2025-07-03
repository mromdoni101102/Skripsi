/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ======================================================================
// TIDAK ADA MOCKING DEPENDENSI KARENA KODE INI MANDIRI
// ======================================================================


// ======================================================================
// MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen utama dari file jawaban mahasiswa.
const Tantangan2 = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// CHECKLIST PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen PackingList (Tantangan 2)', () => {

    beforeEach(() => {
        // Render komponen sebelum setiap tes agar tidak perlu diulang
        render(<Tantangan2 />);
    });

    test('Kriteria 1 [W=5]: Harus menampilkan judul utama "Sally Ride\'s Packing List"', () => {
        const heading = screen.getByRole('heading', { level: 1, name: /Sally Ride's Packing List/i });
        expect(heading).toBeInTheDocument();
    });

    test('Kriteria 2 [W=15]: Harus me-render struktur dasar (section > ul > 3 li)', () => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        const section = list.closest('section');
        expect(section).toBeInTheDocument();
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
    });

    test('Kriteria 3 [W=10]: Semua item list harus memiliki class "item"', () => {
        const listItems = screen.getAllByRole('listitem');
        listItems.forEach(item => {
            expect(item).toHaveClass('item');
        });
    });

    // Bobot tinggi karena menguji satu cabang dari logika kondisional (&&).
    test('Kriteria 4 [W=20]: Item dengan importance > 0 harus menampilkan teks "(Importance: ...)"', () => {
        const spaceSuit = screen.getByText(/Space suit/i);
        expect(spaceSuit.textContent).toContain('(Importance: 9)');
        const photo = screen.getByText(/Photo of Tam/i);
        expect(photo.textContent).toContain('(Importance: 6)');
    });

    // Bobot tinggi karena menguji cabang lain dari logika kondisional.
    test('Kriteria 5 [W=20]: Item dengan importance = 0 TIDAK boleh menampilkan teks "(Importance: ...)"', () => {
        const helmet = screen.getByText(/Helmet with a golden leaf/i);
        expect(helmet.textContent).not.toContain('Importance');
    });

    // Bobot tertinggi karena menguji kombinasi logika kondisional dan elemen HTML spesifik.
    test('Kriteria 6 [W=25]: Teks importance harus berada di dalam tag <i> (italic)', () => {
        const italicElements = document.querySelectorAll('i');
        expect(italicElements).toHaveLength(2);
        expect(italicElements[0]).toHaveTextContent('(Importance: 9)');
        expect(italicElements[1]).toHaveTextContent('(Importance: 6)');
    });

    test('Kriteria 7 [W=5]: Komponen harus diexport sebagai default dengan benar', () => {
        expect(Tantangan2).toBeDefined();
    });
});
