/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ========================================================
// TAHAP 1: MOCK dan Validasi Ekspor Komponen
// ========================================================

// Mock komponen next/image agar bisa diuji sebagai <img>
jest.mock('next/image', () => {
  return (props) => <img {...props} />;
}, { virtual: true });

let Profile;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Profile = submission.default || submission.Profile || submission;

    if (typeof Profile !== 'function') {
      importError = new Error(
        '❌ Gagal pada Kriteria 5:\n' +
        'Komponen "Profile" tidak diekspor sebagai fungsi.\n' +
        '💡 Gunakan: export default function Profile() { ... }'
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
describe('Praktikum: Komponen Profile', () => {
  test('Validasi Impor: Komponen harus bisa diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(Profile).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Detail Pengujian Fungsional Komponen', () => {
    beforeEach(() => {
      try {
        render(<Profile />);
      } catch (err) {
        throw new Error([
          '❌ Gagal merender komponen "Profile".',
          `💥 Error: ${err.message}`,
          '💡 Pastikan JSX dan props ditulis dengan benar.'
        ].join('\n'));
      }
    });

    test('Kriteria 1 [W=10]: Harus menampilkan elemen gambar (<img>)', () => {
      const image = screen.queryByRole('img');
      if (!image) {
        throw new Error('❌ Gagal pada Kriteria 1: Elemen <img> tidak ditemukan.');
      }
      expect(image).toBeInTheDocument();
    });

    test('Kriteria 2 [W=15]: Gambar memiliki atribut alt (teks alternatif)', () => {
      const image = screen.getByRole('img');
      const alt = image.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        throw new Error('❌ Gagal pada Kriteria 2: Atribut alt kosong atau tidak ada.');
      }
      expect(alt).not.toBe('');
    });

    test('Kriteria 3 [W=15]: Gambar memiliki atribut src yang valid (URL)', () => {
      const image = screen.getByRole('img');
      const src = image.getAttribute('src');
      if (!src || !/^https?:\/\/.+/.test(src)) {
        throw new Error(`❌ Gagal pada Kriteria 3: src tidak valid atau kosong. Ditemukan: ${src}`);
      }
      expect(src).toMatch(/^https?:\/\/.+/);
    });

    test('Kriteria 4 [W=25]: Gambar memiliki atribut width dan height yang tidak kosong', () => {
      const image = screen.getByRole('img');
      const width = image.getAttribute('width');
      const height = image.getAttribute('height');

      if (!width || !height) {
        throw new Error('❌ Gagal pada Kriteria 4: Atribut width atau height tidak ditemukan.');
      }

      expect(Number(width)).toBeGreaterThan(0);
      expect(Number(height)).toBeGreaterThan(0);
    });

    test('Kriteria 5 [W=20]: Komponen "Profile" harus diekspor dengan benar', () => {
      expect(typeof Profile).toBe('function');
    });
  });
});
