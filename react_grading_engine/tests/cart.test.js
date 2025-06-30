/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

// ======================================================================
// PERSIAPAN LINGKUNGAN: MOCK FUNGSI 'confirm'
// ======================================================================
// Ini penting agar kita bisa menguji tombol 'Hapus' tanpa pop-up muncul
global.confirm = jest.fn();


// ======================================================================
// MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil komponen utama dari file jawaban mahasiswa.
const Cart = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// CHECKLIST PENILAIAN FUNGSIONAL (VERSI LENGKAP ANDA)
// ======================================================================
describe('Praktikum: Komponen Cart (Studi Kasus)', () => {

    // Siapkan data dummy dan fungsi mock untuk digunakan di semua tes
    const mockOnRemove = jest.fn();
    const mockOnCheckout = jest.fn();
    const mockItems = [
      { name: 'Nasi Goreng', price: 25000 },
      { name: 'Mie Ayam', price: 20000 }
    ];

    // Bersihkan semua mock sebelum setiap tes
    beforeEach(() => {
        mockOnRemove.mockClear();
        mockOnCheckout.mockClear();
        global.confirm.mockClear();
    });

    test('Kriteria 1: Harus menampilkan pesan "Belum ada pesanan" saat keranjang kosong', () => {
        render(<Cart total={0} items={[]} onRemove={mockOnRemove} onCheckout={mockOnCheckout} />);
        expect(screen.getByText(/Belum ada pesanan/i)).toBeInTheDocument();
        // Tombol checkout tidak boleh ada
        expect(screen.queryByRole('button', { name: /Checkout/i })).not.toBeInTheDocument();
    });

    test('Kriteria 2: Harus menampilkan semua item dan total belanja dengan benar', () => {
        render(<Cart total={45000} items={mockItems} onRemove={mockOnRemove} onCheckout={mockOnCheckout} />);

        // Cek apakah item muncul
        expect(screen.getByText(/Nasi Goreng - Rp 25,000/i)).toBeInTheDocument();
        expect(screen.getByText(/Mie Ayam - Rp 20,000/i)).toBeInTheDocument();

        // Cek apakah total muncul
        expect(screen.getByText(/Total Belanja: Rp 45,000/i)).toBeInTheDocument();
    });

    test('Kriteria 3: Tombol "Hapus" harus memanggil fungsi onRemove jika dikonfirmasi', () => {
        // Atur agar 'confirm' mengembalikan 'true' (seolah-olah pengguna mengklik "OK")
        global.confirm.mockReturnValue(true);

        render(<Cart total={45000} items={mockItems} onRemove={mockOnRemove} onCheckout={mockOnCheckout} />);

        // Cari semua tombol hapus dan klik yang pertama
        const removeButtons = screen.getAllByRole('button', { name: /Hapus/i });
        fireEvent.click(removeButtons[0]);

        // Pastikan onRemove dipanggil dengan index yang benar (0)
        expect(mockOnRemove).toHaveBeenCalledWith(0);
    });

    test('Kriteria 4: Tombol "Hapus" TIDAK memanggil onRemove jika tidak dikonfirmasi', () => {
        // Atur agar 'confirm' mengembalikan 'false' (seolah-olah pengguna mengklik "Cancel")
        global.confirm.mockReturnValue(false);

        render(<Cart total={45000} items={mockItems} onRemove={mockOnRemove} onCheckout={mockOnCheckout} />);

        const removeButtons = screen.getAllByRole('button', { name: /Hapus/i });
        fireEvent.click(removeButtons[0]);

        // Pastikan onRemove TIDAK dipanggil sama sekali
        expect(mockOnRemove).not.toHaveBeenCalled();
    });

    test('Kriteria 5: Harus menampilkan "Gratis ongkir!" jika total > 100000', () => {
        render(<Cart total={150000} items={mockItems} onRemove={mockOnRemove} onCheckout={mockOnCheckout} />);
        expect(screen.getByText(/Gratis ongkir!/i)).toBeInTheDocument();
        expect(screen.queryByText(/Tidak Dapat Gratis Ongkir/i)).not.toBeInTheDocument();
    });

    test('Kriteria 6: Harus menampilkan "Tidak Dapat Gratis Ongkir" jika total <= 100000', () => {
        render(<Cart total={90000} items={mockItems} onRemove={mockOnRemove} onCheckout={mockOnCheckout} />);
        expect(screen.getByText(/Tidak Dapat Gratis Ongkir/i)).toBeInTheDocument();
        expect(screen.queryByText(/Gratis ongkir!/i)).not.toBeInTheDocument();
    });

    test('Kriteria 7: Tombol "Checkout" harus memanggil fungsi onCheckout saat diklik', () => {
        render(<Cart total={45000} items={mockItems} onRemove={mockOnRemove} onCheckout={mockOnCheckout} />);

        const checkoutButton = screen.getByRole('button', { name: /Checkout/i });
        fireEvent.click(checkoutButton);

        expect(mockOnCheckout).toHaveBeenCalledTimes(1);
    });
});
