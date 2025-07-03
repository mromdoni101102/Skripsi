/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ======================================================================
// BAGIAN 1: "MENCEGAT" IMPORT YANG BERMASALAH
// ======================================================================
// Ini adalah bagian terpenting. Kita beritahu Jest untuk mencegat TEPAT
// alamat yang diminta oleh kode mahasiswa.
jest.mock('../../components/props/Card.js', () => {
    // Sebagai gantinya, berikan komponen Card tiruan yang simpel ini.
    return function MockedCard({ children }) {
        // Kita beri class "card" agar tes struktur tetap bisa berjalan
        return <div className="card">{children}</div>;
    };
}, { virtual: true }); // virtual: true membuatnya tidak perlu file fisik sama sekali.


// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen utama dari file jawaban mahasiswa
const MyProfileV2 = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen MyProfileV2', () => {

    // Render komponen sebelum setiap tes agar tidak perlu diulang
    beforeEach(() => {
        render(<MyProfileV2 />);
    });

 test('Kriteria 1 [W=15]: Harus me-render DUA komponen Card (tiruan)', () => {
        const cardElements = screen.getAllByRole('generic', { name: '' }).filter(el => el.classList.contains('card'));
        expect(cardElements).toHaveLength(2);
    });

    // Bobot tinggi karena menguji komposisi dan props children yang benar untuk card pertama.
    test('Kriteria 2 [W=30]: Card pertama harus berisi judul "Foto" dan gambar avatar', () => {
        const photoHeading = screen.getByRole('heading', { name: /Foto/i, level: 1 });
        expect(photoHeading).toBeInTheDocument();

        const avatarImage = screen.getByAltText('Aklilu Lemma');
        expect(avatarImage).toBeInTheDocument();

        expect(photoHeading.parentElement).toBe(avatarImage.parentElement);
    });

    test('Kriteria 3 [W=15]: Gambar avatar harus memiliki atribut yang benar', () => {
        const avatarImage = screen.getByAltText('Aklilu Lemma');
        expect(avatarImage).toHaveClass('avatar');
        expect(avatarImage).toHaveAttribute('src', 'https://i.imgur.com/OKS67lhm.jpg');
        expect(avatarImage).toHaveAttribute('width', '70');
        expect(avatarImage).toHaveAttribute('height', '70');
    });

    // Bobot tinggi karena menguji komposisi dan props children yang benar untuk card kedua.
    test('Kriteria 4 [W=30]: Card kedua harus berisi judul "Tentang" dan paragraf deskripsi', () => {
        const aboutHeading = screen.getByRole('heading', { name: /Tentang/i, level: 1 });
        expect(aboutHeading).toBeInTheDocument();

        const description = screen.getByText(/Aklilu Lemma adalah seorang ilmuwan terkemuka/i);
        expect(description).toBeInTheDocument();
        expect(description.tagName.toLowerCase()).toBe('p');

        expect(aboutHeading.parentElement).toBe(description.parentElement);
    });

    test('Kriteria 5 [W=5]: Kedua judul ("Foto" & "Tentang") harus berada di dalam tag <h1>', () => {
        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings).toHaveLength(2);

        expect(screen.getByRole('heading', { name: /Foto/i, level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Tentang/i, level: 1 })).toBeInTheDocument();
    });

    test('Kriteria 6 [W=5]: Komponen "MyProfileV2" harus diexport sebagai default dengan benar', () => {
        expect(MyProfileV2).toBeDefined();
    });
});
