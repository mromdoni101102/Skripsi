/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ========================================================
// TAHAP 1: MOCK dan Validasi Ekspor Komponen
// ========================================================

// Mock untuk next/image agar bisa diuji sebagai <img>
jest.mock('next/image', () => {
  return (props) => <img {...props} />;
}, { virtual: true });

let Gallery;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Gallery = submission.default || submission.Gallery || submission;

    if (typeof Gallery !== 'function') {
      importError = new Error(
        '❌ Gagal pada Kriteria 2:\n' +
        'Komponen "Gallery" tidak diekspor sebagai fungsi.\n' +
        '💡 Gunakan: export function Gallery() { ... }'
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
describe('Praktikum: Komponen Gallery', () => {
  test('Validasi Impor: Komponen harus bisa diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(Gallery).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Detail Pengujian Fungsional Komponen', () => {
    beforeEach(() => {
      try {
        render(<Gallery />);
      } catch (err) {
        throw new Error([
          '❌ Gagal merender komponen "Gallery".',
          `💥 Error: ${err.message}`,
          '💡 Pastikan JSX dan komponen digunakan dengan benar.'
        ].join('\n'));
      }
    });

    test('Kriteria 1 [W=50]: Harus me-render 3 elemen gambar <img>', () => {
      const images = screen.queryAllByRole('img');
      if (images.length !== 3) {
        throw new Error(`❌ Gagal pada Kriteria 1: Ditemukan ${images.length} gambar, seharusnya 3.`);
      }
      expect(images).toHaveLength(3);
    });

    test('Kriteria 2 [W=50]: Komponen "Gallery" harus diekspor dengan benar', () => {
      expect(typeof Gallery).toBe('function');
    });
  });
});
