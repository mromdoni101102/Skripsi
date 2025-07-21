/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ========================================================
// SETUP & IMPORT
// ========================================================
let PackingList;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: SUBMISSION_PATH tidak disetel. Pastikan konfigurasi environment Anda benar.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    PackingList = submission.default || submission.PackingList || submission;

    if (typeof PackingList !== 'function') {
      importError = new Error('❌ Gagal pada Kriteria 6 [W=5]: Komponen "PackingList" tidak diekspor sebagai fungsi.');
    }
  } catch (err) {
    importError = new Error(`❌ Gagal memuat file mahasiswa:\n${err.message}`);
  }
});

// ========================================================
// PENGUJIAN FUNGSI UTAMA
// ========================================================
describe('Praktikum: Komponen PackingList (Fungsional)', () => {
  test('Kriteria 6 [W=5]: Komponen PackingList berhasil diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(typeof PackingList).toBe('function');
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Fungsional Detail', () => {
    beforeEach(() => {
      render(<PackingList />);
    });

    // Kriteria 1 [W=5]
    test('Kriteria 1 [W=5]: Harus menampilkan heading utama <h1>', () => {
      const heading = screen.queryByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    // Kriteria 2 [W=20]
    test('Kriteria 2 [W=20]: Memiliki struktur section > ul > li (dengan minimal 3 item)', () => {
      const list = screen.getByRole('list');
      const section = list.closest('section');
      expect(section).toBeInTheDocument();

      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    // Kriteria 3 [W=10]
    test('Kriteria 3 [W=10]: Setiap item list memiliki class "item"', () => {
      const items = screen.getAllByRole('listitem');
      items.forEach(item => {
        expect(item).toHaveClass('item');
      });
    });

  // Kriteria 4 [W=30]
    test('Kriteria 4 [W=30]: Item yang dikemas (isPacked=true) dirender dalam komponen ' + '&lt;del&gt;' + ' dan mengandung indikator status apapun seperti (✅, true, benar, sudah dikemas, ✓)', () => {
    const deletedItems = screen.getAllByRole('listitem').filter((li) => {
        const del = li.querySelector('del');
        if (!del) return false;

        // Cek isi del mengandung simbol atau teks yang menunjukkan "dikemas"
        const text = del.textContent.toLowerCase();
        return text.includes('✅') || text.includes('true') || text.includes('benar') || text.includes('sudah dikemas') || text.includes('✓');
    });

    expect(deletedItems.length).toBeGreaterThanOrEqual(1);
    });

    // Kriteria 5 [W=30]
    test('Kriteria 5 [W=30]: Item yang tidak dikemas (isPacked=false) tidak ada di dalam komponen ' + '&lt;del&gt;' + ' dan tidak mengandung indikator status apapun seperti (✅, true, benar, sudah dikemas, ✓)', () => {
    const plainItems = screen.getAllByRole('listitem').filter((li) => {
        const del = li.querySelector('del');
        const text = li.textContent.toLowerCase();

        const hasCheckSymbol = text.includes('✅');
        const hasTrueText = text.includes('true');
        const hasBenar = text.includes('benar');
        const hasDikemas = text.includes('sudah dikemas');
        const hasCheckMark = text.includes('✓');

        return !del && !(hasCheckSymbol || hasTrueText || hasBenar || hasDikemas || hasCheckMark);
    });

    expect(plainItems.length).toBeGreaterThanOrEqual(1);
    });

  });
});
