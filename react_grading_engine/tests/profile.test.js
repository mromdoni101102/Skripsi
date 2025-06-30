/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// Mock next/image hanya sebagai jaring pengaman
jest.mock('next/image', () => {
    return (props) => <img {...props} />;
}, { virtual: true });

// Mengambil kode mahasiswa
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
const Profile = require(process.env.SUBMISSION_PATH).default;


describe('Praktikum: Komponen Profile', () => {

    beforeEach(() => {
        render(<Profile />);
    });

    test('Kriteria 1: Harus menampilkan sebuah elemen gambar (image)', () => {
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
    });

    // ======================================================================
    // PERBAIKAN DI SINI: Sesuaikan ekspektasi tes dengan kode jawaban yang benar
    // ======================================================================
    test('Kriteria 2: Gambar harus memiliki teks alternatif (alt) yang benar', () => {
        // Cari gambar berdasarkan alt text yang BENAR, yaitu "Katherine Johnson"
        const image = screen.getByAltText('Katherine Johnson');
        expect(image).toBeInTheDocument();
    });

    test('Kriteria 3: Gambar harus memiliki sumber (src) yang benar', () => {
        // Cari berdasarkan alt text yang benar, lalu cek src-nya
        const image = screen.getByAltText('Katherine Johnson');
        expect(image).toHaveAttribute('src', 'https://i.imgur.com/MK3eW3Am.jpg');
    });

    test('Kriteria 4: Gambar harus memiliki ukuran width dan height yang benar', () => {
        const image = screen.getByAltText('Katherine Johnson');
        expect(image).toHaveAttribute('width', '100');
        expect(image).toHaveAttribute('height', '100');
    });

    test('Kriteria 5: Komponen "Profile" harus diexport dengan benar', () => {
        expect(Profile).toBeDefined();
    });
});
