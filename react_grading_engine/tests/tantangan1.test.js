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
const Tantangan1 = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// CHECKLIST PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen PackingList (Tantangan 1)', () => {

    // Render komponen sebelum setiap tes agar tidak perlu diulang
    beforeEach(() => {
        render(<Tantangan1 />);
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

    // Bobot tinggi karena menguji satu cabang dari logika kondisional.
    test('Kriteria 4 [W=25]: Item yang dikemas (isPacked=true) harus menampilkan teks dan simbol ✅', () => {
        const spaceSuit = screen.getByText(/Space suit/i);
        expect(spaceSuit).toHaveTextContent('Space suit ✅');
        const helmet = screen.getByText(/Helmet with a golden leaf/i);
        expect(helmet).toHaveTextContent('Helmet with a golden leaf ✅');
    });

    // Bobot tinggi karena menguji cabang lain dari logika kondisional.
    test('Kriteria 5 [W=25]: Item yang belum dikemas (isPacked=false) harus menampilkan teks dan simbol ❌', () => {
        const photo = screen.getByText(/Photo of Tam/i);
        expect(photo).toHaveTextContent('Photo of Tam ❌');
    });

    test('Kriteria 6 [W=15]: Harus ada tepat 2 item yang dikemas (✅) dan 1 item yang tidak (❌)', () => {
        const listItems = screen.getAllByRole('listitem');
        const packedItems = listItems.filter(item => item.textContent.includes('✅'));
        expect(packedItems).toHaveLength(2);
        const unpackedItems = listItems.filter(item => item.textContent.includes('❌'));
        expect(unpackedItems).toHaveLength(1);
    });

    test('Kriteria 7 [W=5]: Komponen harus diexport sebagai default dengan benar', () => {
        expect(Tantangan1).toBeDefined();
    });
});
