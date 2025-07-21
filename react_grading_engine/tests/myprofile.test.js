/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ======================================================================
// BAGIAN 1: MOCK fungsi getImageUrlV2 untuk pengujian logika internal
// ======================================================================
jest.mock('../../utils/utils.js', () => ({
  getImageUrlV2: jest.fn((person, sizeCode) => `https://i.imgur.com/${person.imageId}${sizeCode}.jpg`),
}), { virtual: true });

let MyProfile;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    MyProfile = submission.default || submission.MyProfile || submission;

    if (typeof MyProfile !== 'function') {
      importError = new Error(
        '❌ Gagal pada Kriteria 5:\n' +
        'Komponen "MyProfile" tidak diekspor sebagai fungsi.\n' +
        '💡 Gunakan: export default function MyProfile() { ... }'
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

// ======================================================================
// BAGIAN 2: PENGUJIAN FUNGSIONALITAS DENGAN BOBOT KRITERIA
// ======================================================================
describe('Praktikum: Komponen MyProfile dan MyAvatar', () => {
  test('Validasi Impor: Komponen harus bisa diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(MyProfile).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Detail Fungsional', () => {
    beforeEach(() => {
      try {
        render(<MyProfile />);
      } catch (err) {
        throw new Error([
          '❌ Gagal merender komponen "MyProfile".',
          `💥 Error: ${err.message}`,
          '💡 Pastikan JSX dan props ditulis dengan benar.'
        ].join('\n'));
      }
    });

    test('Kriteria 1 [W=10]: Harus merender DUA elemen gambar avatar', () => {
      const avatars = screen.queryAllByRole('img');
      if (!avatars || avatars.length !== 2) {
        throw new Error(`❌ Gagal pada Kriteria 1: Ditemukan ${avatars.length} gambar (seharusnya 2).`);
      }
      expect(avatars).toHaveLength(2);
    });

    test('Kriteria 2 [W=20]: Setiap avatar memiliki atribut alt dan src yang valid', () => {
      const avatars = screen.getAllByRole('img');
      avatars.forEach((img, i) => {
        const alt = img.getAttribute('alt');
        const src = img.getAttribute('src');

        if (!alt || alt.trim() === '') {
          throw new Error(`❌ Gagal pada Kriteria 2: Gambar ke-${i + 1} tidak memiliki alt yang valid.`);
        }
        if (!src || !/^https?:\/\/.+/.test(src)) {
          throw new Error(`❌ Gagal pada Kriteria 2: Gambar ke-${i + 1} memiliki src tidak valid: ${src}`);
        }

        expect(alt).not.toBe('');
        expect(src).toMatch(/^https?:\/\/.+/);
      });
    });

    test('Kriteria 3 [W=20]: Setiap avatar memiliki atribut width dan height sesuai', () => {
      const avatars = screen.getAllByRole('img');
      avatars.forEach((img, i) => {
        const width = img.getAttribute('width');
        const height = img.getAttribute('height');

        if (!width || !height || Number(width) <= 0 || Number(height) <= 0) {
          throw new Error(`❌ Gagal pada Kriteria 3: Avatar ke-${i + 1} memiliki width/height tidak valid.`);
        }

        expect(Number(width)).toBeGreaterThan(0);
        expect(Number(height)).toBeGreaterThan(0);
      });
    });

    test('Kriteria 4 [W=35]: Logika size < 90 → "s", size >= 90 → "b" diterapkan ke fungsi getImageUrlV2', () => {
      const { getImageUrlV2 } = require('../../utils/utils.js');

      // Pastikan dipanggil dengan argumen yang sesuai
      expect(getImageUrlV2).toHaveBeenCalledWith(
        expect.objectContaining({ imageId: expect.any(String) }),
        's'
      );
      expect(getImageUrlV2).toHaveBeenCalledWith(
        expect.objectContaining({ imageId: expect.any(String) }),
        'b'
      );
    });

    test('Kriteria 5 [W=15]: Komponen "MyProfile" harus diekspor sebagai fungsi', () => {
      expect(typeof MyProfile).toBe('function');
    });
  });
});
