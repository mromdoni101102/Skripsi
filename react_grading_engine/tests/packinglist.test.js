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

    test('Kriteria 1: Harus menampilkan judul utama dengan benar', () => {
        const heading = screen.getByRole('heading', { level: 1, name: /Sally Ride's Packing List/i });
        expect(heading).toBeInTheDocument();
    });

    test('Kriteria 2: Harus me-render struktur dasar (section > ul > li)', () => {
        const list = screen.getByRole('list'); // Mencari <ul>
        expect(list).toBeInTheDocument();

        const section = list.closest('section'); // Mencari parent <section> dari <ul>
        expect(section).toBeInTheDocument();

        const listItems = screen.getAllByRole('listitem'); // Mencari semua <li>
        expect(listItems).toHaveLength(3);
    });

    test('Kriteria 3: Semua item list harus memiliki class "item"', () => {
        const listItems = screen.getAllByRole('listitem');
        listItems.forEach(item => {
            expect(item).toHaveClass('item');
        });
    });

    test('Kriteria 4: Item yang sudah dikemas (isPacked=true) harus dirender dengan benar', () => {
        const spaceSuit = screen.getByText(/Space suit/i);
        const helmet = screen.getByText(/Helmet with a golden leaf/i);

        // Memeriksa apakah teks mengandung centang
        expect(spaceSuit).toHaveTextContent('✅');
        expect(helmet).toHaveTextContent('✅');

        // Memeriksa apakah teks tersebut berada di dalam tag <del>
        // .closest('del') akan mencari elemen <del> terdekat dari elemen teks tersebut
        expect(spaceSuit.closest('del')).toBeInTheDocument();
        expect(helmet.closest('del')).toBeInTheDocument();
    });

    test('Kriteria 5: Item yang belum dikemas (isPacked=false) harus dirender dengan benar', () => {
        const photo = screen.getByText(/Photo of Tam/i);

        // Memeriksa apakah teks TIDAK mengandung centang atau silang dari contoh sebelumnya
        expect(photo).not.toHaveTextContent('✅');
        expect(photo).not.toHaveTextContent('❌');

        // Memeriksa apakah teks tersebut TIDAK berada di dalam tag <del>
        expect(photo.closest('del')).toBeNull();
    });

    test('Kriteria 6: Komponen "PackingList" dan "Item" harus diexport dengan benar', () => {
        expect(PackingList).toBeDefined();
    });
});
