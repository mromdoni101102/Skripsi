/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const path = require('path'); // <-- WAJIB: Untuk memperbaiki masalah path
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

// Mock fungsi global
global.alert = jest.fn();

// ========================================================
// VALIDASI IMPORT - Disederhanakan
// ========================================================
let Project;
let importError = null;

beforeAll(() => {
  try {
    if (!process.env.SUBMISSION_PATH) {
      throw new Error('❌ ENV Error: SUBMISSION_PATH tidak disetel.');
    }
    // PERBAIKAN UTAMA: Normalisasi path untuk mengatasi error file tidak ditemukan di Windows
    const normalizedPath = path.normalize(process.env.SUBMISSION_PATH);
    const submission = require(normalizedPath);

    // Dapatkan komponen dari default export atau named export 'Project'
    Project = submission.default || submission.Project;

    if (typeof Project !== 'function') {
      throw new Error('❌ Komponen `Project` tidak ditemukan atau bukan sebuah fungsi. Pastikan ada `export default Project` atau `export { Project }`.');
    }
  } catch (err) {
    importError = err;
  }
});

// ========================================================
// PENGUJIAN FUNGSIONALITAS
// ========================================================
describe('Praktikum: Aplikasi Restoran (Studi Kasus)', () => {
  // Tes pertama dan paling penting: Apakah file bisa di-load?
  test('Validasi Impor: Komponen harus dapat diimpor dan merupakan fungsi', () => {
    if (importError) throw importError;
    expect(Project).toBeDefined();
    expect(typeof Project).toBe('function');
  });

  // Hanya jalankan tes fungsional jika impor berhasil
  const functionalDescribe = importError ? describe.skip : describe;

  functionalDescribe('Pengujian Fungsional', () => {
    beforeEach(() => {
      // Render komponen di setiap tes dan bersihkan mock
      render(<Project />);
      global.alert.mockClear();
    });

    // Kriteria 1: Menampilkan elemen UI utama
    test('Kriteria 1 [W=15]: Menampilkan heading dan beberapa item menu', () => {
      // Cari heading yang berisi kata "menu" atau "restoran" (lebih andal)
      const heading = screen.getByRole('heading', { name: /menu|restoran|makanan/i });
      expect(heading).toBeInTheDocument();

      // Cari tombol untuk menambah item (lebih andal dari teks saja)
      const addButtons = screen.getAllByRole('button', { name: /tambah|pesan|add|beli/i });
      expect(addButtons.length).toBeGreaterThanOrEqual(2);
    });

    // Kriteria 2: Menambah item ke keranjang
    test('Kriteria 2 [W=30]: Menambah item ke keranjang harus memperbarui total belanja', async () => {
      // Cari elemen yang menampilkan total. Asumsikan awalnya 0 jika tidak ada.
      const totalElement = screen.queryByText(/total/i);
      const initialTotal = totalElement ? parseInt(totalElement.textContent.match(/\d+/)[0]) : 0;

      const addButtons = screen.getAllByRole('button', { name: /tambah|pesan|add|beli/i });
      fireEvent.click(addButtons[0]);

      // Tunggu sampai total yang baru (lebih besar dari awal) muncul di layar
      const newTotalElement = await screen.findByText((content, element) => {
        const newTotal = parseInt(content.match(/\d+/)?.[0] || 0);
        return content.toLowerCase().includes('total') && newTotal > initialTotal;
      });
      expect(newTotalElement).toBeInTheDocument();
    });

    // Kriteria 3: Menghapus item dari keranjang
    test('Kriteria 3 [W=30]: Menghapus item dari keranjang harus memperbarui total belanja', async () => {
    // Tambah item dulu
    const addButtons = screen.getAllByRole('button', { name: /tambah|pesan|add|beli/i });
    fireEvent.click(addButtons[0]);
    if (addButtons.length > 1) fireEvent.click(addButtons[1]);

    // PERBAIKAN: Gunakan `findAllByRole` untuk menangani beberapa tombol "Hapus"
    const removeButtons = await screen.findAllByRole('button', { name: /hapus|remove|delete/i });
    expect(removeButtons.length).toBeGreaterThan(0); // Pastikan tombolnya ada

    // Ambil total sebelum menghapus
    const beforeTotal = parseInt(screen.getByText(/total/i).textContent.match(/\d+/)[0]);

    // Klik tombol hapus yang pertama
    fireEvent.click(removeButtons[0]);

    // Tunggu sampai total berkurang
    await waitFor(() => {
        const afterTotal = parseInt(screen.getByText(/total/i).textContent.match(/\d+/)[0]);
        expect(afterTotal).toBeLessThan(beforeTotal);
    });
    });

    // Kriteria 4: Proses Checkout
    test('Kriteria 4 [W=15]: Tombol checkout harus memanggil alert dan mereset keranjang', async () => {
    // Tambah item agar tombol checkout aktif
    const addButtons = screen.getAllByRole('button', { name: /tambah|pesan|add|beli/i });
    fireEvent.click(addButtons[0]);

    // Cari dan klik tombol checkout
    const checkoutButton = await screen.findByRole('button', { name: /checkout|bayar|selesai/i });
    fireEvent.click(checkoutButton);

    // Verifikasi alert dipanggil
    expect(global.alert).toHaveBeenCalled();

    // PERBAIKAN: Verifikasi keranjang dikosongkan dengan menunggu tombol checkout kembali nonaktif
    await waitFor(() => {
        expect(checkoutButton).toBeDisabled();
    });
    });
    // Kriteria 5: Keranjang Kosong
    test('Kriteria 5 [W=5]: Tombol checkout harus nonaktif saat keranjang kosong', () => {
      const checkoutButton = screen.queryByRole('button', { name: /checkout|bayar|selesai/i });
      // Jika tombolnya ada, harus nonaktif. Jika tidak ada, tes juga lolos.
      if (checkoutButton) {
        expect(checkoutButton).toBeDisabled();
      } else {
        expect(checkoutButton).not.toBeInTheDocument();
      }
    });
  });
});
