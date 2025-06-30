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

    test('Kriteria 1: Harus menampilkan judul utama "Sally Ride\'s Packing List"', () => {
        const heading = screen.getByRole('heading', { level: 1, name: /Sally Ride's Packing List/i });
        expect(heading).toBeInTheDocument();
    });

    test('Kriteria 2: Harus me-render struktur dasar (section > ul > 3 li)', () => {
        const list = screen.getByRole('list'); // Mencari <ul>
        expect(list).toBeInTheDocument();

        // Memastikan list berada di dalam section
        const section = list.closest('section');
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

    test('Kriteria 4: Item yang dikemas (isPacked=true) harus menampilkan teks dan simbol ✅', () => {
        // Cari item berdasarkan teksnya dan pastikan ada tanda centang
        const spaceSuit = screen.getByText(/Space suit/i);
        expect(spaceSuit).toHaveTextContent('Space suit ✅');

        const helmet = screen.getByText(/Helmet with a golden leaf/i);
        expect(helmet).toHaveTextContent('Helmet with a golden leaf ✅');
    });

    test('Kriteria 5: Item yang belum dikemas (isPacked=false) harus menampilkan teks dan simbol ❌', () => {
        // Cari item berdasarkan teksnya dan pastikan ada tanda silang
        const photo = screen.getByText(/Photo of Tam/i);
        expect(photo).toHaveTextContent('Photo of Tam ❌');
    });

    // Tes yang baru (lebih andal)
    test('Kriteria 6: Harus ada tepat 2 item yang dikemas (✅) dan 1 item yang tidak (❌)', () => {
        // 1. Ambil semua elemen <li>
        const listItems = screen.getAllByRole('listitem');

        // 2. Saring item yang teksnya mengandung simbol ✅
        const packedItems = listItems.filter(item => item.textContent.includes('✅'));
        expect(packedItems).toHaveLength(2);

        // 3. Saring item yang teksnya mengandung simbol ❌
        const unpackedItems = listItems.filter(item => item.textContent.includes('❌'));
        expect(unpackedItems).toHaveLength(1);
    });

    test('Kriteria 7: Komponen harus diexport sebagai default dengan benar', () => {
        expect(Tantangan1).toBeDefined();
    });
});
