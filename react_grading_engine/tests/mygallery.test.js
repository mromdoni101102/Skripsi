/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, within } = require('@testing-library/react');

// ========================================================
// TAHAP 1: MOCK dan Validasi Ekspor Komponen
// ========================================================

// Mock fungsi getImageUrl agar tidak gagal saat pemanggilan
jest.mock('../../utils/utils.js', () => ({
  getImageUrl: (id) => `https://mocked.url/${id}.jpg`,
}), { virtual: true });

let MyGallery;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    MyGallery = submission.default || submission.MyGallery || submission;

    if (typeof MyGallery !== 'function') {
      importError = new Error(
        '❌ Gagal pada Kriteria 7:\n' +
        'Komponen "MyGallery" tidak diekspor sebagai fungsi.\n' +
        '💡 Gunakan: export default function MyGallery() { ... }'
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
// TAHAP 2: Pengujian Fungsional (Tidak Bergantung Konten)
// ========================================================
describe('Praktikum: Komponen MyGallery dan MyProfile', () => {
  test('Validasi Impor: Komponen harus bisa diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(typeof MyGallery).toBe('function');
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Fungsional Detail', () => {
    beforeEach(() => {
      render(<MyGallery />);
    });

    // Kriteria 1 [W=10]
    test('Kriteria 1 [W=10]: Menampilkan tepat satu heading level 1 (<h1>)', () => {
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
    });

    // Kriteria 2 [W=20]
    test('Kriteria 2 [W=20]: Menampilkan setidaknya dua heading level 2 (<h2>)', () => {
      const subheadings = screen.getAllByRole('heading', { level: 2 });
      expect(subheadings.length).toBeGreaterThanOrEqual(2);
    });

    // Kriteria 3 [W=25]
    test('Kriteria 3 [W=25]: Setiap profil memiliki gambar dengan alt dan src', () => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(2);

      images.forEach(img => {
        expect(img).toHaveAttribute('src');
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('src')).toMatch(/^https?:\/\//);
      });
    });

    // Kriteria 4 [W=15]
    test('Kriteria 4 [W=15]: Menampilkan deskripsi atau profesi dalam tag teks seperti paragraf atau list item', () => {
      const textNodes = screen.getAllByText((content, node) => {
        const tag = node.tagName.toLowerCase();
        return ['p', 'li', 'span', 'div'].includes(tag) && content.length > 5;
      });
      expect(textNodes.length).toBeGreaterThanOrEqual(2);
    });

    // Kriteria 5 [W=10]
    test('Kriteria 5 [W=10]: Setiap profil menampilkan jumlah penghargaan (jumlah numerik tertera)', () => {
      const listItems = screen.getAllByRole('listitem');
      const hasAwardCount = listItems.some(li => /\d+/.test(li.textContent));
      expect(hasAwardCount).toBe(true);
    });

    // Kriteria 6 [W=15]
    test('Kriteria 6 [W=15]: Terdapat daftar penghargaan dalam bentuk <ul>/<li>, dengan minimal 2 item total', () => {
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThanOrEqual(2);

      listItems.forEach(item => {
        expect(item.textContent).not.toBe('');
      });
    });

    // Kriteria 7 [W=5]
    test('Kriteria 7 [W=5]: Komponen MyGallery diekspor sebagai fungsi', () => {
      expect(typeof MyGallery).toBe('function');
    });
  });
});
