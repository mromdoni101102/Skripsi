/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ========================================================
// VALIDASI IMPORT DAN EKSPOR
// ========================================================
let Tantangan1;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: SUBMISSION_PATH tidak disetel.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Tantangan1 = submission.default || submission.Tantangan1 || submission;

    if (typeof Tantangan1 !== 'function') {
      importError = new Error('❌ Komponen Tantangan1 tidak diekspor sebagai fungsi.');
    }
  } catch (err) {
    importError = new Error(`❌ Gagal memuat file:\n${err.message}`);
  }
});

// ========================================================
// PENGUJIAN STRUKTUR & FUNGSI — TIDAK LITERAL
// ========================================================
describe('Praktikum: Komponen PackingList (Tantangan1)', () => {
  test('Validasi Impor: Komponen harus dapat diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(typeof Tantangan1).toBe('function');
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Fungsional', () => {
    beforeEach(() => {
      render(<Tantangan1 />);
    });

    // Kriteria 1
    test('Kriteria 1 [W=5]: Harus menampilkan satu heading level 1', () => {
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
    });

    // Kriteria 2
    test('Kriteria 2 [W=15]: Harus memiliki struktur section > ul > 3 li', () => {
      const list = screen.getByRole('list');
      const section = list.closest('section');
      expect(section).toBeInTheDocument();
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    // Kriteria 3
    test('Kriteria 3 [W=10]: Semua list item memiliki class "item"', () => {
      const items = screen.getAllByRole('listitem');
      items.forEach(item => {
        expect(item).toHaveClass('item');
      });
    });

    // Kriteria 4
    test('Kriteria 4 [W=25]: Setidaknya ada satu item yang dikemas (berisi ' + '&lt;del&gt;' + '  atau simbol atau tanda)', () => {
      const packedCandidates = screen.getAllByRole('listitem').filter(item => {
        const text = item.textContent;
        const hasPositiveMark = /(✅|✓|true|benar|sudah dikemas)/i.test(text);
        return hasPositiveMark;
      });
      expect(packedCandidates.length).toBeGreaterThanOrEqual(1);
    });

    // Kriteria 5
    test('Kriteria 5 [W=25]: Setidaknya ada satu item yang belum dikemas (tidak mengandung simbol dikemas)', () => {
      const unpackedCandidates = screen.getAllByRole('listitem').filter(item => {
        const text = item.textContent;
        const hasNegativeMark = /(❌|✗|false|belum|tidak)/i.test(text);
        return hasNegativeMark;
      });
      expect(unpackedCandidates.length).toBeGreaterThanOrEqual(1);
    });

    // Kriteria 6
    test('Kriteria 6 [W=15]: Total item dikemas dan belum dikemas saling melengkapi dengan jumlah 3 item', () => {
      const listItems = screen.getAllByRole('listitem');
      const packed = listItems.filter(item =>
        /(✅|✓|true|benar|sudah dikemas)/i.test(item.textContent)
      );
      const unpacked = listItems.filter(item =>
        /(❌|✗|false|belum|tidak)/i.test(item.textContent)
      );
      expect(packed.length + unpacked.length).toBe(3);
      expect(packed.length).toBeGreaterThanOrEqual(1);
      expect(unpacked.length).toBeGreaterThanOrEqual(1);
    });

    // Kriteria 7
    test('Kriteria 7 [W=5]: Komponen Tantangan1 harus diekspor dengan benar', () => {
      expect(Tantangan1).toBeDefined();
    });
  });
});
