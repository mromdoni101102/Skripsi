/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ========================================================
// VALIDASI IMPORT DAN EKSPOR
// ========================================================
let Tantangan2;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: SUBMISSION_PATH tidak disetel.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Tantangan2 = submission.default || submission.Tantangan2 || submission;

    if (typeof Tantangan2 !== 'function') {
      importError = new Error('❌ Komponen Tantangan2 tidak diekspor sebagai fungsi.');
    }
  } catch (err) {
    importError = new Error(`❌ Gagal memuat file:\n${err.message}`);
  }
});

// ========================================================
// PENGUJIAN STRUKTUR & FUNGSI — FUNGSIONAL
// ========================================================
describe('Praktikum: Komponen PackingList (Tantangan2)', () => {
  test('Validasi Impor: Komponen harus dapat diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(typeof Tantangan2).toBe('function');
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Fungsional', () => {
    beforeEach(() => {
      render(<Tantangan2 />);
    });

    // Kriteria 1 [W=10]
    test('Kriteria 1 [W=10]: Komponen dapat dirender tanpa error', () => {
      expect(() => render(<Tantangan2 />)).not.toThrow();
    });

    // Kriteria 2 [W=20]
    test('Kriteria 2 [W=20]: Semua elemen item dirender dalam elemen <li>', () => {
      const listItems = screen.getAllByRole('listitem');
      listItems.forEach(item => {
        expect(item).toBeInTheDocument();
        expect(item.tagName.toLowerCase()).toBe('li');
        expect(item.textContent).not.toBe('');
      });
    });

    // Kriteria 3 [W=20]
    test('Kriteria 3 [W=20]: Item dengan importance > 0 memiliki elemen <i> yang menampilkan tingkat importance', () => {
      const listItems = screen.getAllByRole('listitem');
      const itemsWithI = listItems.filter(li =>
        li.querySelector('i') && /Importance:\s*\d+/.test(li.textContent)
      );
      expect(itemsWithI.length).toBe(2); // hanya yang importance > 0
    });

    // Kriteria 4 [W=30]
    test('Kriteria 4 [W=30]: Item dengan importance = 0 tidak memiliki elemen <i>', () => {
      const listItems = screen.getAllByRole('listitem');
      const itemsWithoutI = listItems.filter(li =>
        !li.querySelector('i')
      );
      expect(itemsWithoutI.length).toBe(1); // hanya satu dengan importance = 0
    });

    // Kriteria 5 [W=5]
    test('Kriteria 5 [W=5]: Komponen Tantangan2 diekspor dengan benar', () => {
      expect(Tantangan2).toBeDefined();
    });
  });
});
