/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ========================================================
// TAHAP 1: MOCK dan Validasi Ekspor Komponen
// ========================================================

// Mock komponen Card agar tetap bisa diuji sebagai <div class="card">
jest.mock('../../components/props/Card.js', () => {
  return function MockedCard({ children }) {
    return <div className="card">{children}</div>;
  };
}, { virtual: true });

let MyProfileV2;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    MyProfileV2 = submission.default || submission.MyProfileV2 || submission;

    if (typeof MyProfileV2 !== 'function') {
      importError = new Error(
        '❌ Gagal pada Kriteria 6:\n' +
        'Komponen "MyProfileV2" tidak diekspor sebagai fungsi.\n' +
        '💡 Gunakan: export default function MyProfileV2() { ... }'
      );
    }
  } catch (err) {
    importError = new Error([
      '❌ Gagal membaca file tugas Anda.',
      '💥 Sepertinya ada kesalahan penulisan sintaks atau ekspor.',
      `DETAIL: ${err.message}`,
      '💡 Pastikan JSX ditulis dengan benar dan menggunakan ekspor yang valid.'
    ].join('\n'));
  }
});

// ========================================================
// TAHAP 2: Pengujian Detail Fungsional
// ========================================================
describe('Praktikum: Komponen MyProfileV2', () => {
  test('Validasi Impor: Komponen harus bisa diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(MyProfileV2).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Detail Pengujian Fungsional Komponen', () => {
    beforeEach(() => {
      try {
        render(<MyProfileV2 />);
      } catch (err) {
        throw new Error([
          '❌ Gagal merender komponen "MyProfileV2".',
          `💥 Error: ${err.message}`,
          '💡 Pastikan JSX dan props ditulis dengan benar.'
        ].join('\n'));
      }
    });

    test('Kriteria 1 [W=15]: Harus me-render DUA elemen dengan class "card"', () => {
      const cards = screen.getAllByRole('generic', { name: '' }).filter(el => el.classList.contains('card'));
      if (cards.length !== 2) {
        throw new Error(`❌ Gagal pada Kriteria 1: Ditemukan ${cards.length} elemen "card", seharusnya 2.`);
      }
      expect(cards).toHaveLength(2);
    });

    test('Kriteria 2 [W=30]: Card pertama harus berisi elemen <h1> dan gambar avatar', () => {
      const headings = screen.getAllByRole('heading', { level: 1 });
      const images = screen.getAllByRole('img');

      if (headings.length < 1 || images.length < 1) {
        throw new Error('❌ Gagal pada Kriteria 2: Elemen <h1> atau <img> tidak ditemukan dalam Card pertama.');
      }

      const heading1 = headings[0];
      const img1 = images[0];

      expect(heading1).toBeInTheDocument();
      expect(img1).toBeInTheDocument();
      expect(heading1.parentElement).toBe(img1.parentElement);
    });

    test('Kriteria 3 [W=15]: Gambar avatar harus memiliki atribut class, src, alt, width, dan height', () => {
      const image = screen.getByRole('img');

      expect(image).toHaveAttribute('alt');
      expect(image).toHaveAttribute('src');
      expect(image).toHaveAttribute('width');
      expect(image).toHaveAttribute('height');
      expect(image).toHaveClass('avatar');

      const width = Number(image.getAttribute('width'));
      const height = Number(image.getAttribute('height'));
      if (width <= 0 || height <= 0) {
        throw new Error('❌ Gagal pada Kriteria 3: Atribut width/height harus lebih besar dari 0.');
      }
    });

    test('Kriteria 4 [W=30]: Card kedua harus memiliki heading dan deskripsi di dalam tag <p>', () => {
      const headings = screen.getAllByRole('heading', { level: 1 });
      const paragraphs = screen.getAllByText((_, el) => el.tagName.toLowerCase() === 'p');

      if (headings.length < 2 || paragraphs.length < 1) {
        throw new Error('❌ Gagal pada Kriteria 4: Tidak ditemukan <h1> dan <p> dalam Card kedua.');
      }

      const heading2 = headings[1];
      const paragraph = paragraphs[0];
      expect(heading2).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
      expect(heading2.parentElement).toBe(paragraph.parentElement);
    });

    test('Kriteria 5 [W=5]: Kedua elemen heading harus menggunakan tag <h1>', () => {
      const headings = screen.getAllByRole('heading', { level: 1 });
      if (headings.length !== 2) {
        throw new Error(`❌ Gagal pada Kriteria 5: Ditemukan ${headings.length} elemen <h1>, seharusnya 2.`);
      }
      headings.forEach(h => expect(h.tagName.toLowerCase()).toBe('h1'));
    });

    test('Kriteria 6 [W=5]: Komponen MyProfileV2 harus diekspor dengan benar sebagai default', () => {
      expect(typeof MyProfileV2).toBe('function');
    });
  });
});
