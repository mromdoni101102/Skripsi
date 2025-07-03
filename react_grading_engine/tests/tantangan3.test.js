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
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen utama dari file jawaban mahasiswa.
const Tantangan3 = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL
// ======================================================================
describe('Praktikum: Komponen Drink (Tantangan 3)', () => {

    beforeEach(() => {
        render(<Tantangan3 />);
    });

     test('Kriteria 1 [W=15]: Harus me-render DUA komponen Drink, untuk "tea" dan "coffee"', () => {
        const teaHeading = screen.getByRole('heading', { name: /tea/i });
        const coffeeHeading = screen.getByRole('heading', { name: /coffee/i });

        expect(teaHeading).toBeInTheDocument();
        expect(coffeeHeading).toBeInTheDocument();
    });

    test('Kriteria 2 [W=25]: Data untuk "tea" harus ditampilkan dengan benar', () => {
        const teaPart = screen.getByText('leaf');
        expect(teaPart).toBeInTheDocument();
        expect(teaPart.tagName.toLowerCase()).toBe('dd');

        const teaCaffeine = screen.getByText(/15–70 mg\/cup/i);
        expect(teaCaffeine).toBeInTheDocument();
    });

    test('Kriteria 3 [W=25]: Data untuk "coffee" harus ditampilkan dengan benar', () => {
        const coffeePart = screen.getByText('bean');
        expect(coffeePart).toBeInTheDocument();
        expect(coffeePart.tagName.toLowerCase()).toBe('dd');

        const coffeeCaffeine = screen.getByText(/80–185 mg\/cup/i);
        expect(coffeeCaffeine).toBeInTheDocument();
    });

    // Bobot tertinggi karena menguji struktur HTML semantik yang spesifik.
    test('Kriteria 4 [W=30]: Struktur HTML untuk setiap minuman harus benar (section > h1 + dl)', () => {
        const sections = screen.getAllByRole('generic').filter(el => el.tagName.toLowerCase() === 'section');
        expect(sections).toHaveLength(2);

        sections.forEach(section => {
            const heading = section.querySelector('h1');
            const definitionList = section.querySelector('dl');
            expect(heading).toBeInTheDocument();
            expect(definitionList).toBeInTheDocument();
        });
    });

    test('Kriteria 5 [W=5]: Komponen "Tantangan3" harus diexport dengan benar', () => {
        expect(Tantangan3).toBeDefined();
    });
});
