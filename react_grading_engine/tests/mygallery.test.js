/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ======================================================================
// BAGIAN 1: PERSIAPAN LINGKUNGAN (MOCKING YANG TEPAT SASARAN)
// ======================================================================
// Kode mahasiswa membutuhkan 'getImageUrl' dari path ini.
// Kita harus membuat mock yang ALAMATNYA SAMA PERSIS.
// jest.mock yang baru
jest.mock('../../utils/utils.js', () => ({
  // Terima argumen sebagai 'imageId' (sebuah string), bukan 'person' (objek)
  getImageUrl: (imageId) => `https://i.imgur.com/${imageId}s.jpg`,
}), { virtual: true });


// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Kita ambil komponen MyGallery dari file mahasiswa
const submission = require(process.env.SUBMISSION_PATH);
const MyGallery = submission.MyGallery || submission.default || submission;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen MyGallery dan Profile', () => {

    // Render komponen mahasiswa sebelum setiap tes
    beforeEach(() => {
        render(<MyGallery />);
    });

   test('Kriteria 1 [W=10]: Harus menampilkan judul utama "Notable Scientists"', () => {
        const mainHeading = screen.getByRole('heading', { level: 1, name: /Notable Scientists/i });
        expect(mainHeading).toBeInTheDocument();
    });

    test('Kriteria 2 [W=20]: Harus menampilkan DUA nama ilmuwan sebagai sub-judul (di dalam tag <h2>)', () => {
        const mariaHeading = screen.getByRole('heading', { level: 2, name: /Maria Skłodowska-Curie/i });
        const katsukoHeading = screen.getByRole('heading', { level: 2, name: /Katsuko Saruhashi/i });

        expect(mariaHeading).toBeInTheDocument();
        expect(katsukoHeading).toBeInTheDocument();
    });

    test('Kriteria 3 [W=25]: Harus menampilkan gambar avatar dengan SUMBER (src) dan TULISAN ALT yang benar', () => {
        const mariaAvatar = screen.getByAltText('Maria Skłodowska-Curie');
        expect(mariaAvatar).toBeInTheDocument();
        expect(mariaAvatar).toHaveAttribute('src', 'https://i.imgur.com/szV5sdGs.jpg');

        const katsukoAvatar = screen.getByAltText('Katsuko Saruhashi');
        expect(katsukoAvatar).toBeInTheDocument();
        expect(katsukoAvatar).toHaveAttribute('src', 'https://i.imgur.com/YfeOqp2s.jpg');
    });

    test('Kriteria 4 [W=15]: Harus menampilkan detail profesi untuk kedua ilmuwan', () => {
        expect(screen.getByText(/Fisikawan dan kimiawan/i)).toBeInTheDocument();
        expect(screen.getByText(/Ahli Geokimia/i)).toBeInTheDocument();
    });

    test('Kriteria 5 [W=10]: Harus menampilkan jumlah penghargaan yang benar', () => {
        expect(screen.getByText(/Penghargaan: 4/)).toBeInTheDocument();
        expect(screen.getByText(/Penghargaan: 2/)).toBeInTheDocument();
    });

    test('Kriteria 6 [W=15]: Harus menampilkan daftar penghargaan yang benar', () => {
        expect(screen.getByText(/Penghargaan Nobel Fisika, Penghargaan Nobel Kimia/)).toBeInTheDocument();
        expect(screen.getByText(/Penghargaan Miyake Geokimia, Penghargaan Tanaka/)).toBeInTheDocument();
    });

    test('Kriteria 7 [W=5]: Komponen "MyGallery" harus diexport dengan benar', () => {
        expect(MyGallery).toBeDefined();
    });
});
