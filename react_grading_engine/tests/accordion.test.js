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

     test('Kriteria 1 [W=5]: Harus menampilkan judul utama "Almaty, Kazakhstan"', () => {
        expect(screen.getByRole('heading', { name: 'Almaty, Kazakhstan' })).toBeInTheDocument();
    });

    test('Kriteria 2 [W=20]: Panel pertama ("About") harus aktif dan menampilkan isinya saat awal render', () => {
        const panelContent = screen.getByText(/Dengan populasi sekitar 2 juta orang/i);
        expect(panelContent).toBeInTheDocument();

        const showButtonForPanel2 = screen.getByRole('button', { name: 'Tampilkan' });
        expect(showButtonForPanel2).toBeInTheDocument();
    });

    test('Kriteria 3 [W=30]: Menekan tombol "Tampilkan" pada panel kedua akan menampilkan isinya', () => {
        const showButton = screen.getByRole('button', { name: /Tampilkan/i });
        fireEvent.click(showButton);

        const panel2Content = screen.getByText(/Nama "Almaty" berasal dari kata/i);
        expect(panel2Content).toBeInTheDocument();
    });

    // Bobot tertinggi karena menguji logika inti "lifting state up".
    test('Kriteria 4 [W=40]: Saat panel kedua aktif, konten panel pertama harus hilang', () => {
        const showButton = screen.getByRole('button', { name: /Tampilkan/i });
        fireEvent.click(showButton);

        const panel1Content = screen.queryByText(/Dengan populasi sekitar 2 juta orang/i);
        expect(panel1Content).not.toBeInTheDocument();
    });

    test('Kriteria 5 [W=5]: Komponen "Accordion" harus diexport dengan benar', () => {
        expect(Accordion).toBeDefined();
    });
});
