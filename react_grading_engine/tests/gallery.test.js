/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// TIDAK ADA MOCKING SAMA SEKALI.

if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Langsung require file mahasiswa. Node.js akan berhasil menemukan './profile.js'
// karena controller sudah menyiapkannya di folder yang sama.
const { Gallery } = require(process.env.SUBMISSION_PATH);

describe('Praktikum: Komponen Gallery', () => {
    beforeEach(() => {
        render(<Gallery />);
    });

    test('Kriteria 1: Harus me-render 3 gambar', () => {
        // Kita uji hasil akhir yang sebenarnya, yaitu munculnya 3 gambar.
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
    });

    test('Kriteria 2: Komponen "Gallery" harus diexport dengan benar', () => {
        expect(Gallery).toBeDefined();
    });
});
