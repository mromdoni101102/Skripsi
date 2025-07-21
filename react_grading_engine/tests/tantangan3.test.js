/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, within } = require('@testing-library/react');

// ========================================================
// VALIDASI IMPORT DAN EKSPOR
// ========================================================
let Tantangan3;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: SUBMISSION_PATH tidak disetel.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Tantangan3 = submission.default || submission.Tantangan3 || submission;

    if (typeof Tantangan3 !== 'function') {
      importError = new Error('❌ Komponen Tantangan3 tidak diekspor sebagai fungsi.');
    }
  } catch (err) {
    importError = new Error(`❌ Gagal memuat file:\n${err.message}`);
  }
});

// ========================================================
// PENGUJIAN STRUKTUR & FUNGSI — FUNGSIONAL
// ========================================================
describe('Praktikum: Komponen Drink (Tantangan3)', () => {
  test('Validasi Impor: Komponen harus dapat diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(typeof Tantangan3).toBe('function');
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Fungsional', () => {
    let container;
    beforeEach(() => {
    const renderResult = render(<Tantangan3 />);
    container = renderResult.container;
    });


    // Kriteria 1 [W=15]
    test('Kriteria 1 [W=15]: Harus merender tepat dua elemen <section>', () => {
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(2);
    });

    // Kriteria 2 [W=25]
    test('Kriteria 2 [W=25]: Tiap section mengandung heading dan minimal 3 <dt>/<dd> berpasangan', () => {
     const sections = container.querySelectorAll('section');

      sections.forEach((section) => {
        const heading = within(section).getByRole('heading');
        expect(heading).toBeInTheDocument();

        const dl = section.querySelector('dl');
        expect(dl).toBeInTheDocument();

        const dtItems = dl.querySelectorAll('dt');
        const ddItems = dl.querySelectorAll('dd');
        expect(dtItems.length).toBeGreaterThanOrEqual(3);
        expect(ddItems.length).toBeGreaterThanOrEqual(3);
      });
    });

    // Kriteria 3 [W=30]
    test('Kriteria 3 [W=30]: Struktur semantik harus section > heading + dl > dt/dd', () => {
      const sections = container.querySelectorAll('section');


      sections.forEach(section => {
        expect(section.tagName.toLowerCase()).toBe('section');

        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        expect(heading).toBeInTheDocument();

        const dl = section.querySelector('dl');
        expect(dl).toBeInTheDocument();

        const dtItems = dl.querySelectorAll('dt');
        const ddItems = dl.querySelectorAll('dd');
        expect(dtItems.length).toBeGreaterThanOrEqual(3);
        expect(ddItems.length).toBeGreaterThanOrEqual(3);
      });
    });

    // Kriteria 4 [W=5]
    test('Kriteria 4 [W=5]: Komponen Tantangan3 diekspor dengan benar', () => {
      expect(Tantangan3).toBeDefined();
    });
  });
});
