/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ================================================
// TAHAP 1: Import & Validasi Ekspor Komponen Card
// ================================================

let Card;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error(
      '❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.'
    );
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Card = submission.default || submission.Card || submission;

    if (typeof Card !== 'function') {
      importError = new Error(
        '❌ Gagal pada Kriteria 5 [W=5]:\n' +
        'Komponen "Card" tidak diekspor sebagai fungsi.\n' +
        '💡 Gunakan: export default function Card() { ... }'
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

// ================================================
// TAHAP 2: Pengujian Fungsional Komponen Card
// ================================================

describe('Praktikum: Komponen Card', () => {
  test('Validasi Impor: Komponen harus bisa diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(Card).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Detail Pengujian Fungsional Komponen', () => {

    test('Kriteria 1 [W=15]: Harus me-render elemen <div> luar dengan class "card"', () => {
      const { container } = render(<Card>Test</Card>);
      const outerDiv = container.firstChild;

      if (!outerDiv || outerDiv.nodeName !== 'DIV') {
        throw new Error('❌ Gagal pada Kriteria 1: Elemen luar tidak ditemukan atau bukan <div>.');
      }

      expect(outerDiv).toHaveClass('card');
    });

    test('Kriteria 2 [W=15]: Harus memiliki elemen <div> dalam dengan class "card-content"', () => {
      const { container } = render(<Card>Test</Card>);
      const outerDiv = container.firstChild;
      const innerDiv = outerDiv?.firstChild;

      if (!innerDiv || innerDiv.nodeName !== 'DIV') {
        throw new Error('❌ Gagal pada Kriteria 2: Elemen <div> dalam tidak ditemukan.');
      }

      expect(innerDiv).toHaveClass('card-content');
    });

    test('Kriteria 3 [W=30]: Harus me-render children berupa teks sederhana', () => {
      const text = 'Ini konten teks biasa';
      render(<Card>{text}</Card>);
      const foundText = screen.queryByText(text);

      if (!foundText) {
        throw new Error('❌ Gagal pada Kriteria 3: Konten teks tidak dirender.');
      }

      expect(foundText).toBeInTheDocument();
    });

    test('Kriteria 4 [W=35]: Harus mendukung children berupa konten kompleks (JSX)', () => {
      render(
        <Card>
          <article data-testid="custom">
            <header>Ini Judul</header>
            <section>Ini Deskripsi</section>
          </article>
        </Card>
      );

      const article = screen.getByTestId('custom');
      expect(article).toBeInTheDocument();
    });

    test('Kriteria 5 [W=5]: Komponen harus diekspor sebagai fungsi', () => {
      expect(typeof Card).toBe('function');
    });
  });
});
