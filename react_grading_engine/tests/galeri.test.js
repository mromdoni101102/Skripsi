/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

jest.mock('@/data/article', () => ({
  sculptureList: [
    {
      name: 'Patung A',
      artist: 'Seniman A',
      description: 'Deskripsi A',
      url: 'https://example.com/a.jpg',
      alt: 'Gambar A',
    },
    {
      name: 'Patung B',
      artist: 'Seniman B',
      description: 'Deskripsi B',
      url: 'https://example.com/b.jpg',
      alt: 'Gambar B',
    },
    {
      name: 'Patung C',
      artist: 'Seniman C',
      description: 'Deskripsi C',
      url: 'https://example.com/c.jpg',
      alt: 'Gambar C',
    },
  ],
}), { virtual: true });

let Galeri;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: SUBMISSION_PATH belum diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Galeri = submission.Galeri || submission.default || submission;

    if (typeof Galeri !== 'function') {
      importError = new Error('❌ Komponen Galeri tidak diekspor sebagai fungsi.');
    }
  } catch (err) {
    importError = new Error('❌ Gagal mengimpor komponen Galeri:\n' + err.message);
  }
});

describe('Praktikum: Galeri Interaktif', () => {
  test('Validasi Impor', () => {
    if (importError) throw importError;
    expect(Galeri).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Fungsionalitas', () => {
    let prevBtn, nextBtn;

    beforeEach(() => {
      render(<Galeri />);
      const buttons = screen.getAllByRole('button');
      if (buttons.length < 2) {
        throw new Error('❌ Harus ada minimal 2 tombol navigasi.');
      }

      [prevBtn, nextBtn] = buttons;
    });

    test('Kriteria 1 [W=15]: Saat awal render, item pertama tampil dan tombol prev disabled', () => {
      const headings = screen.getAllByRole('heading');
      const image = screen.queryByRole('img');

      expect(headings.length).toBeGreaterThanOrEqual(2);
      expect(image).toBeInTheDocument();
      expect(prevBtn).toBeDisabled();
    });

    test('Kriteria 2 [W=15]: Klik tombol next, tampil item berikutnya', () => {
      const firstHeading = screen.getByRole('heading', { level: 2 });
      const initialText = firstHeading.textContent;

      fireEvent.click(nextBtn);

      const updatedHeading = screen.getByRole('heading', { level: 2 });
      expect(updatedHeading.textContent).not.toBe(initialText);
    });

    test('Kriteria 3 [W=25]: Setelah next, tombol prev menjadi aktif', () => {
      fireEvent.click(nextBtn);
      expect(prevBtn).not.toBeDisabled();
    });

    test('Kriteria 4 [W=20]: Navigasi ke item terakhir, tombol next jadi disabled', () => {
      fireEvent.click(nextBtn); // index = 1
      fireEvent.click(nextBtn); // index = 2
      expect(nextBtn).toBeDisabled();
    });

    test('Kriteria 5 [W=25]: Klik prev dari akhir, kembali ke item sebelumnya', () => {
      fireEvent.click(nextBtn);
      fireEvent.click(nextBtn);
      const lastHeading = screen.getByRole('heading', { level: 2 }).textContent;

      fireEvent.click(prevBtn);
      const newHeading = screen.getByRole('heading', { level: 2 }).textContent;

      expect(newHeading).not.toBe(lastHeading);
    });
  });
});
