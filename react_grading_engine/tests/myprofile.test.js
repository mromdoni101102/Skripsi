/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ======================================================================
// BAGIAN 1: PERSIAPAN LINGKUNGAN (MOCKING FUNGSI getImageUrlV2)
// ======================================================================

// Ini adalah bagian terpenting. Kita beritahu Jest untuk mencegat TEPAT
// alamat yang diminta oleh kode mahasiswa.
// jest.mock yang baru dan sudah benar
jest.mock('../../utils/utils.js', () => ({
  // Kita bungkus fungsi kita di dalam jest.fn() agar bisa dilacak
  getImageUrlV2: jest.fn((person, sizeCode) => `https://i.imgur.com/${person.imageId}${sizeCode}.jpg`),
}), { virtual: true });

// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen MyProfile dari file jawaban mahasiswa.
const MyProfile = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen MyProfile dan MyAvatar', () => {

    beforeEach(() => {
        // Render komponen mahasiswa sebelum setiap tes
        render(<MyProfile />);
    });

    test('Kriteria 1: Harus me-render DUA gambar avatar', () => {
        // Cari semua elemen dengan peran 'img'
        const avatars = screen.getAllByRole('img');
        expect(avatars).toHaveLength(2);
    });

    test('Kriteria 2: Avatar Gregorio Y. Zara harus memiliki atribut yang benar', () => {
        // Cari gambar berdasarkan teks alternatifnya
        const gregorioAvatar = screen.getByAltText('Gregorio Y. Zara');
        expect(gregorioAvatar).toBeInTheDocument();
        expect(gregorioAvatar).toHaveClass('avatar');
        // Verifikasi src berdasarkan hasil dari fungsi tiruan kita
        expect(gregorioAvatar).toHaveAttribute('src', 'https://i.imgur.com/7vQD0fPs.jpg');
        // Verifikasi ukuran
        expect(gregorioAvatar).toHaveAttribute('width', '40');
    });

    test('Kriteria 3: Avatar Ada Lovelace harus memiliki atribut yang benar', () => {
        // Cari gambar berdasarkan teks alternatifnya
        const adaAvatar = screen.getByAltText('Ada Lovelace');
        expect(adaAvatar).toBeInTheDocument();
        expect(adaAvatar).toHaveClass('avatar');
        // Verifikasi src berdasarkan hasil dari fungsi tiruan kita
        expect(adaAvatar).toHaveAttribute('src', 'https://i.imgur.com/rDE2SL3Lb.jpg');
        // Verifikasi ukuran
        expect(adaAvatar).toHaveAttribute('width', '100');
    });

    test('Kriteria 4: Logika untuk ukuran gambar harus benar (size < 90 vs size >= 90)', () => {
        // Kita butuh referensi ke fungsi tiruan kita untuk memeriksa panggilannya
        const { getImageUrlV2 } = require('../../utils/utils.js');

        // Panggil ulang render di sini agar kita bisa memastikan mock-nya bersih
        render(<MyProfile />);

        // Cek bahwa untuk Gregorio (size 40), size code yang dikirim adalah 's'
        expect(getImageUrlV2).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Gregorio Y. Zara' }),
            's'
        );

        // Cek bahwa untuk Ada (size 100), size code yang dikirim adalah 'b'
        expect(getImageUrlV2).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Ada Lovelace' }),
            'b'
        );
    });

    test('Kriteria 5: Komponen "MyProfile" harus diexport dengan benar', () => {
        expect(MyProfile).toBeDefined();
    });
});
