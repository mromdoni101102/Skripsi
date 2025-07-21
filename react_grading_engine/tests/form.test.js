/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;

let Form;
let importError = null;

// Validasi Impor Awal
beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: SUBMISSION_PATH belum diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Form = submission.Form || submission.default || submission;

    if (typeof Form !== 'function') {
      importError = new Error('❌ Komponen Form tidak diekspor sebagai fungsi.');
    }
  } catch (err) {
    importError = new Error('❌ Gagal mengimpor komponen Form:\n' + err.message);
  }
});

describe('Praktikum: Komponen Form Interaktif', () => {
  test('Validasi Impor Komponen', () => {
    if (importError) throw importError;
    expect(Form).toBeDefined();
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Pengujian Fungsionalitas Form', () => {
    let user;

    beforeEach(() => {
      user = userEvent.setup();
      render(<Form />);
    });

    test('Kriteria 1 [W=10]: Harus menampilkan elemen-elemen dasar form', () => {
      const heading = screen.queryByRole('heading');
      const textbox = screen.queryByRole('textbox');
      const button = screen.queryByRole('button');

      if (!heading || !textbox || !button) {
        throw new Error('❌ Form tidak memuat semua elemen penting: heading, textbox, atau button.');
      }

      expect(heading).toBeInTheDocument();
      expect(textbox).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    test('Kriteria 2 [W=20]: Tombol submit harus nonaktif saat input kosong', () => {
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('Kriteria 3 [W=35]: Menampilkan error jika jawaban salah', async () => {
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'kucing');
      await user.click(button);

      const errorMessage = await screen.findByText(/jawaban salah/i);
      expect(errorMessage).toBeInTheDocument();
    });

    test('Kriteria 4 [W=35]: Menampilkan pesan sukses jika jawaban benar', async () => {
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'tikus');
      await user.click(button);

      try {
        const successMessage = await screen.findByText(/jawaban benar/i);
        expect(successMessage).toBeInTheDocument();
      } catch (e) {
        throw new Error('❌ Pesan "jawaban benar" tidak ditemukan. Pastikan Anda menampilkannya setelah jawaban benar.');
      }
    });
  });
});
