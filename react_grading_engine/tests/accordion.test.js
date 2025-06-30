/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

// ======================================================================
// BAGIAN 1: MENYIAPKAN "DATA PALSU" (MOCKING)
// ======================================================================
// Kode mahasiswa membutuhkan data `sculptureList` dari path '@data/article'.
// Kita harus mencegat import ini dan menyediakan data tiruan yang bisa kita kontrol.
jest.mock('@/data/article', () => ({
    sculptureList: [
        { artist: 'Marta Colvin Andrade', title: 'About', description: 'Dengan populasi sekitar 2 juta orang...' },
        { artist: 'Eduardo Catalano', title: 'Etymology', description: 'Nama "Almaty" berasal dari kata...' }
    ]
}), { virtual: true });


// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen Accordion dari file jawaban mahasiswa.
const Accordion = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL
// ======================================================================
describe('Praktikum: Komponen Accordion', () => {

    beforeEach(() => {
        // Render komponen utama sebelum setiap tes
        render(<Accordion />);
    });

    test('Kriteria 1: Harus menampilkan judul utama "Almaty, Kazakhstan"', () => {
        expect(screen.getByRole('heading', { name: 'Almaty, Kazakhstan' })).toBeInTheDocument();
    });

    test('Kriteria 2: Panel pertama ("About") harus aktif dan menampilkan isinya saat awal render', () => {
        // Cari konten dari panel pertama
        const panelContent = screen.getByText(/Dengan populasi sekitar 2 juta orang/i);
        expect(panelContent).toBeInTheDocument();

        // Pastikan tombol "Tampilkan" untuk panel kedua ADA
        const showButtonForPanel2 = screen.getByRole('button', { name: 'Tampilkan' });
        expect(showButtonForPanel2).toBeInTheDocument();
    });

    test('Kriteria 3: Menekan tombol "Tampilkan" pada panel kedua akan menampilkan isinya', () => {
        const showButton = screen.getByRole('button', { name: /Tampilkan/i });

        // Klik tombol "Tampilkan" pada panel kedua
        fireEvent.click(showButton);

        // Cari konten dari panel kedua, sekarang seharusnya muncul
        const panel2Content = screen.getByText(/Nama "Almaty" berasal dari kata/i);
        expect(panel2Content).toBeInTheDocument();
    });

    test('Kriteria 4: Saat panel kedua aktif, konten panel pertama harus hilang', () => {
        const showButton = screen.getByRole('button', { name: /Tampilkan/i });
        fireEvent.click(showButton);

        // Konten panel pertama seharusnya sudah tidak ada lagi di dokumen
        const panel1Content = screen.queryByText(/Dengan populasi sekitar 2 juta orang/i);
        expect(panel1Content).not.toBeInTheDocument();
    });

    test('Kriteria 5: Komponen "Accordion" harus diexport dengan benar', () => {
        expect(Accordion).toBeDefined();
    });
});
