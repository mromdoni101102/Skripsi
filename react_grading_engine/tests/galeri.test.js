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
// Kita harus mencegat import ini dan menyediakan data tiruan.
jest.mock('@/data/article', () => ({
    sculptureList: [
        { name: 'Homenaje a la Neurocirugía', artist: 'Marta Colvin Andrade', description: 'Deskripsi pertama...', url: 'https://i.imgur.com/Mx7dA2Y.jpg', alt: 'Patung Perunggu A' },
        { name: 'Floralis Genérica', artist: 'Eduardo Catalano', description: 'Deskripsi kedua...', url: 'https://i.imgur.com/ZF6s192.jpg', alt: 'Patung Bunga Metalik' },
        { name: 'Eternal Presence', artist: 'John Woodrow Wilson', description: 'Deskripsi ketiga...', url: 'https://i.imgur.com/aTtVpES.jpg', alt: 'Patung Kepala Manusia' }
    ]
}), { virtual: true });


// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen Galeri dari file jawaban mahasiswa.
const submission = require(process.env.SUBMISSION_PATH);
const Galeri = submission.Galeri || submission.default || submission;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL
// ======================================================================
describe('Praktikum: Komponen Galeri Interaktif', () => {

    beforeEach(() => {
        render(<Galeri />);
    });

    test('Kriteria 1: Harus menampilkan data patung pertama saat awal render', () => {
        // Cek judul, artis, dan gambar dari data pertama
        expect(screen.getByRole('heading', { name: /Homenaje a la Neurocirugía/i })).toBeInTheDocument();
        expect(screen.getByText(/oleh Marta Colvin Andrade/i)).toBeInTheDocument();
        expect(screen.getByAltText('Patung Perunggu A')).toBeInTheDocument();
        expect(screen.getByText('(1 dari 3)')).toBeInTheDocument();
    });

    test('Kriteria 2: Tombol "Artikel Sebelumnya" harus nonaktif (disabled) saat awal render', () => {
        const prevButton = screen.getByRole('button', { name: /Artikel Sebelumnya/i });
        expect(prevButton).toBeDisabled();
    });

    test('Kriteria 3: Menekan tombol "Artikel Selanjutnya" akan menampilkan data patung kedua', () => {
        const nextButton = screen.getByRole('button', { name: /Artikel Selanjutnya/i });
        fireEvent.click(nextButton);

        // Cek apakah data patung kedua sekarang muncul
        expect(screen.getByRole('heading', { name: /Floralis Genérica/i })).toBeInTheDocument();
        expect(screen.getByAltText('Patung Bunga Metalik')).toBeInTheDocument();
        expect(screen.getByText('(2 dari 3)')).toBeInTheDocument();
    });

    test('Kriteria 4: Setelah menekan "Selanjutnya", tombol "Sebelumnya" harus aktif', () => {
        const nextButton = screen.getByRole('button', { name: /Artikel Selanjutnya/i });
        const prevButton = screen.getByRole('button', { name: /Artikel Sebelumnya/i });

        fireEvent.click(nextButton); // Pindah ke item kedua

        // Tombol "Sebelumnya" sekarang harus bisa diklik
        expect(prevButton).not.toBeDisabled();
    });

    test('Kriteria 5: Tombol "Selanjutnya" harus nonaktif saat di item terakhir', () => {
        const nextButton = screen.getByRole('button', { name: /Artikel Selanjutnya/i });

        // Klik dua kali untuk sampai ke item terakhir (item ke-3)
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);

        // Cek apakah data terakhir muncul
        expect(screen.getByRole('heading', { name: /Eternal Presence/i })).toBeInTheDocument();

        // Tombol "Selanjutnya" sekarang harus nonaktif
        expect(nextButton).toBeDisabled();
    });
});
