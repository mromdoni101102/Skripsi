/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');

// ======================================================================
// BAGIAN 1: PERSIAPAN LINGKUNGAN
// Untuk komponen Card ini, kita tidak perlu 'mocking' apa pun karena
// ia tidak memiliki ketergantungan pada file atau komponen lain.
// ======================================================================


// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Logika cerdas untuk mengambil komponen Card, apapun cara mahasiswa mengekspornya.
const submission = require(process.env.SUBMISSION_PATH);
const Card = submission.Card || submission.default || submission;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL UNTUK CARD
// ======================================================================
describe('Praktikum: Komponen Card', () => {

 test('Kriteria 1 [W=15]: Harus me-render sebuah div luar dengan class "card"', () => {
    const { container } = render(<Card>Konten Tes</Card>);
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass('card');
  });

  test('Kriteria 2 [W=15]: Harus me-render sebuah div dalam dengan class "card-content"', () => {
    const { container } = render(<Card>Konten Tes</Card>);
    const outerDiv = container.firstChild;
    const innerDiv = outerDiv.firstChild;
    expect(innerDiv).toHaveClass('card-content');
  });

  // Bobot tinggi karena menguji konsep utama props.children
  test('Kriteria 3 [W=30]: Harus bisa menampilkan konten teks sederhana (children)', () => {
    const teksAnak = "Ini adalah konten di dalam Card.";
    render(<Card>{teksAnak}</Card>);
    const renderedText = screen.getByText(teksAnak);
    expect(renderedText).toBeInTheDocument();
  });

  // Bobot tertinggi karena menguji props.children dengan konten kompleks (JSX).
  test('Kriteria 4 [W=35]: Harus bisa menampilkan konten JSX yang lebih kompleks (children)', () => {
    render(
      <Card>
        <h2>Judul di Dalam Card</h2>
        <p>Paragraf di dalam Card.</p>
      </Card>
    );
    const heading = screen.getByRole('heading', { name: /Judul di Dalam Card/i });
    const paragraph = screen.getByText(/Paragraf di dalam Card/i);
    expect(heading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });

  test('Kriteria 5 [W=5]: Komponen "Card" harus diexport dengan benar', () => {
      expect(Card).toBeDefined();
  });

});
