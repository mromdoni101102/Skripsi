
/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const path = require('path');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

global.alert = jest.fn();

let Project;
let importError = null;

beforeAll(() => {
  try {
    if (!process.env.SUBMISSION_PATH) {
      throw new Error('❌ ENV Error: SUBMISSION_PATH tidak disetel.');
    }
    const normalizedPath = path.normalize(process.env.SUBMISSION_PATH);
    const submission = require(normalizedPath);
    Project = submission.default || submission.Project;

    if (typeof Project !== 'function') {
      throw new Error('❌ Komponen `Project` tidak ditemukan atau bukan sebuah fungsi.');
    }
  } catch (err) {
    importError = err;
  }
});

describe('Praktikum: Aplikasi Restoran (dengan data-testid)', () => {
  test('Validasi Impor: Komponen harus dapat diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(Project).toBeDefined();
    expect(typeof Project).toBe('function');
  });

  const functionalDescribe = importError ? describe.skip : describe;

  functionalDescribe('Pengujian Fungsional', () => {
    beforeEach(() => {
      render(<Project />);
      global.alert.mockClear();
    });

    test('Kriteria 1 [W=15]: Menampilkan heading dan beberapa item menu', () => {
      expect(screen.getByTestId('menu-heading')).toBeInTheDocument();
      expect(screen.getByTestId('menu-section')).toBeInTheDocument();
    });

    test('Kriteria 2 [W=30]: Menambah item ke keranjang harus memperbarui total belanja', async () => {
      const totalBefore = parseInt(screen.getByTestId('total-amount').textContent.match(/\d+/)[0]);
      fireEvent.click(screen.getByTestId('add-button-1'));

      await waitFor(() => {
        const totalAfter = parseInt(screen.getByTestId('total-amount').textContent.match(/\d+/)[0]);
        expect(totalAfter).toBeGreaterThan(totalBefore);
      });
    });

    test('Kriteria 3 [W=30]: Menghapus item dari keranjang harus memperbarui total belanja', async () => {
      fireEvent.click(screen.getByTestId('add-button-1'));
      fireEvent.click(screen.getByTestId('add-button-2'));

      const totalBefore = parseInt(screen.getByTestId('total-amount').textContent.match(/\d+/)[0]);
      fireEvent.click(screen.getByTestId('remove-button-1'));

      await waitFor(() => {
        const totalAfter = parseInt(screen.getByTestId('total-amount').textContent.match(/\d+/)[0]);
        expect(totalAfter).toBeLessThan(totalBefore);
      });
    });

    test('Kriteria 4 [W=15]: Tombol checkout harus memanggil alert dan mereset keranjang', async () => {
      fireEvent.click(screen.getByTestId('add-button-1'));
      const checkoutButton = screen.getByTestId('checkout-button');
      fireEvent.click(checkoutButton);

      expect(global.alert).toHaveBeenCalled();
      await waitFor(() => {
        expect(checkoutButton).toBeDisabled();
      });
    });

    test('Kriteria 5 [W=5]: Tombol checkout harus nonaktif saat keranjang kosong', () => {
      const checkoutButton = screen.getByTestId('checkout-button');
      expect(checkoutButton).toBeDisabled();
    });
  });
});
