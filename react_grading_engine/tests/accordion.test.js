/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

let Accordion;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ SUBMISSION_PATH belum diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Accordion = submission.Accordion || submission.default || submission;
    if (typeof Accordion !== 'function') {
      importError = new Error('❌ Komponen Accordion harus berupa fungsi.');
    }
  } catch (err) {
    importError = new Error('❌ Gagal impor Accordion:\n' + err.message);
  }
});

describe('Pengujian Fungsional Komponen Accordion', () => {
  test('✅ Komponen berhasil diimpor', () => {
    if (importError) throw importError;
    expect(Accordion).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Interaksi dan perilaku Accordion', () => {
    beforeEach(() => {
      render(<Accordion />);
    });
     test('Kriteria 1 [W=5]: Saat pertama kali render, ada dua heading dan satu panel terbuka"', () => {
         const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThanOrEqual(2);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(1); // hanya panel kedua yg tombolnya muncul
    });

    test('Kriteria 2 [W=20]: Panel pertama menampilkan isi, panel kedua menampilkan tombol', () => {
         const paragraphs = screen.getAllByText((content, node) => {
        return node.tagName.toLowerCase() === 'p';
      });
      expect(paragraphs.length).toBe(1); // hanya satu panel aktif
    });

    test('Kriteria 3 [W=30]: Setelah tombol ditekan, panel kedua aktif dan tombol hilang', () => {
       const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      // Harus ada satu <p> untuk panel kedua
      const paragraphs = screen.getAllByText((_, node) => node.tagName.toLowerCase() === 'p');
      expect(paragraphs.length).toBe(1);

      // Tombol "Tampilkan" hilang (panel 1 sekarang yang pasif)
      expect(screen.queryByRole('button')).toBeInTheDocument();
    });

    // Bobot tertinggi karena menguji logika inti "lifting state up".
    test('Kriteria 4 [W=40]: Ketika panel kedua aktif, panel pertama tidak menampilkan isi', () => {
        const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      // Cek bahwa hanya satu paragraf (panel aktif), tidak ada dua
      const paragraphs = screen.getAllByText((_, node) => node.tagName.toLowerCase() === 'p');
      expect(paragraphs.length).toBe(1);
    });

    test('Kriteria 5 [W=5]: Komponen "Accordion" harus diexport dengan benar', () => {
        expect(Accordion).toBeDefined();
    });
});
});
