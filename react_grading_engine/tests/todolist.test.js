/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ========================================================
// TAHAP 1: MOCK dan Validasi Ekspor Komponen
// ========================================================

// Mock next/image jika digunakan, supaya <img> dapat diuji
jest.mock('next/image', () => {
  return (props) => <img {...props} />;
}, { virtual: true });

let TodoList;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    TodoList = submission.default || submission.TodoList || submission;

    if (typeof TodoList !== 'function') {
      importError = new Error(
        '❌ Gagal pada Kriteria 12:\n' +
        'Komponen "TodoList" tidak diekspor sebagai fungsi.\n' +
        '💡 Gunakan: export default function TodoList() { ... }'
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
describe('Praktikum: Komponen TodoList', () => {
  test('Validasi Impor: Komponen harus bisa diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(TodoList).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Detail Pengujian Fungsional Komponen', () => {
    beforeEach(() => {
      try {
        render(<TodoList />);
      } catch (err) {
        throw new Error([
          '❌ Gagal merender komponen "TodoList".',
          `💥 Error: ${err.message}`,
          '💡 Pastikan JSX dan props ditulis dengan benar.'
        ].join('\n'));
      }
    });

    test('Kriteria 1 [W=10]: Harus menampilkan <h1> dengan teks dinamis', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/todos/i);
    });

    test('Kriteria 2 [W=10]: Harus menampilkan elemen <img> dengan atribut src dan alt', () => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src');
      expect(img).toHaveAttribute('alt');
    });

    test('Kriteria 3 [W=10]: Gambar memiliki class "avatar"', () => {
      const img = screen.getByRole('img');
      expect(img.className).toMatch(/avatar/);
    });

    test('Kriteria 4 [W=10]: Menampilkan list (<ul> atau <ol>) dengan 3 item atau lebih', () => {
      const list = screen.getByRole('list');
      const items = screen.getAllByRole('listitem');
      expect(list).toBeInTheDocument();
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    test('Kriteria 5 [W=10]: Setiap item todo memiliki teks tidak kosong', () => {
      const items = screen.getAllByRole('listitem');
      for (const item of items) {
        expect(item.textContent.trim()).not.toBe('');
      }
    });

    test('Kriteria 6 [W=17]: URL gambar berasal dari domain imgur', () => {
      const img = screen.getByRole('img');
      const src = img.getAttribute('src');
      expect(src).toMatch(/^https:\/\/i\.imgur\.com\/.+\.jpg$/);
    });

    test('Kriteria 7 [W=17]: Komponen menggunakan properti style inline (theme)', () => {
      const wrapper = screen.getByRole('heading').parentElement;
      const styles = wrapper.style;
      expect(styles.backgroundColor).not.toBe('');
      expect(styles.color).not.toBe('');
    });

    test('Kriteria 8 [W=16]: Komponen dapat dirender tanpa error', () => {
       expect(() => render(<TodoList />)).not.toThrow();
    });
  });
});
