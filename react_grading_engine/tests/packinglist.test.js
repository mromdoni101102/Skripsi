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
// Mengambil komponen utama dari file jawaban mahasiswa
const PackingList = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// CHECKLIST PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen PackingList', () => {

    beforeEach(() => {
        // Render komponen sebelum setiap tes agar tidak perlu diulang
        render(<PackingList />);
    });

       test('Kriteria 1 [W=5]: Harus menampilkan judul utama dengan benar', () => {
        const heading = screen.getByRole('heading', { level: 1, name: /Sally Ride's Packing List/i });
        expect(heading).toBeInTheDocument();
    });

    test('Kriteria 2 [W=20]: Harus me-render struktur dasar (section > ul > li)', () => {
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

    // Bobot tertinggi karena menguji logika kondisional yang kompleks.
    test('Kriteria 4 [W=30]: Item yang sudah dikemas (isPacked=true) harus dirender dengan benar', () => {
        const spaceSuit = screen.getByText(/Space suit/i);
        const helmet = screen.getByText(/Helmet with a golden leaf/i);

        expect(spaceSuit).toHaveTextContent('✅');
        expect(helmet).toHaveTextContent('✅');

        expect(spaceSuit.closest('del')).toBeInTheDocument();
        expect(helmet.closest('del')).toBeInTheDocument();
    });

    // Bobot tertinggi karena menguji logika kondisional (kasus sebaliknya).
    test('Kriteria 5 [W=30]: Item yang belum dikemas (isPacked=false) harus dirender dengan benar', () => {
        const photo = screen.getByText(/Photo of Tam/i);

        expect(photo).not.toHaveTextContent('✅');
        expect(photo).not.toHaveTextContent('❌');

        expect(photo.closest('del')).toBeNull();
    });

    test('Kriteria 6 [W=5]: Komponen "PackingList" dan "Item" harus diexport dengan benar', () => {
        expect(PackingList).toBeDefined();
    });
});
