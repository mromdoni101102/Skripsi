/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;

// ======================================================================
// BAGIAN 1: PERSIAPAN LINGKUNGAN (MOCKING)
// ======================================================================
// Mock komponen MenuItem agar kita bisa mengontrolnya
jest.mock('../../components/studi_kasus/MenuItem', () => {
    return function MockedMenuItem({ name, price, onAdd }) {
        return (
            <div data-testid="menu-item">
                <span>{name} - Rp {price.toLocaleString()}</span>
                <button onClick={onAdd}>Tambah</button>
            </div>
        );
    };
}, { virtual: true });

// Mock komponen Cart agar kita bisa mengontrolnya
jest.mock('../../components/studi_kasus/Cart', () => {
    return function MockedCart({ total, items, onRemove, onCheckout }) {
        return (
            <div data-testid="cart">
                <span>Total: Rp {total.toLocaleString()}</span>
                {items.map((item, index) => (
                    <div key={index} data-testid="cart-item">
                        <span>{item.name}</span>
                        <button onClick={() => onRemove(index)}>Hapus</button>
                    </div>
                ))}
                {items.length > 0 && (
                    <button onClick={onCheckout}>Checkout</button>
                )}
            </div>
        );
    };
}, { virtual: true });

// Mock fungsi alert bawaan browser
global.alert = jest.fn();

// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
const View = require(process.env.SUBMISSION_PATH).default;


// ======================================================================
// BAGIAN 3: "CHECKLIST" PENILAIAN FUNGSIONAL
// ======================================================================
describe('Praktikum: Aplikasi Restoran (Studi Kasus)', () => {

    const user = userEvent.setup();

    beforeEach(() => {
        // Render komponen View sebelum setiap tes
        render(<View />);
        // Bersihkan mock alert
        global.alert.mockClear();
    });

    test('Kriteria 1: Harus menampilkan judul dan 3 menu item saat awal render', () => {
        expect(screen.getByRole('heading', { name: /Daftar Menu/i })).toBeInTheDocument();

        const menuItems = screen.getAllByTestId('menu-item');
        expect(menuItems).toHaveLength(3);

        expect(screen.getByText(/Nasi Goreng/i)).toBeInTheDocument();
        expect(screen.getByText(/Ayam Bakar/i)).toBeInTheDocument();
        expect(screen.getByText(/Es Teh Manis/i)).toBeInTheDocument();
    });

    test('Kriteria 2: Menambah item ke keranjang harus memperbarui total belanja', async () => {
        // Cari semua tombol "Tambah"
        const addButtons = screen.getAllByRole('button', { name: /Tambah/i });

        // Klik tombol tambah untuk Nasi Goreng (25000)
        await user.click(addButtons[0]);

        // Tunggu dan periksa apakah total berubah
        const totalElement = await screen.findByText(/Total: Rp 25,000/i);
        expect(totalElement).toBeInTheDocument();

        // Klik tombol tambah untuk Ayam Bakar (35000)
        await user.click(addButtons[1]);

        // Tunggu dan periksa apakah total terakumulasi dengan benar
        const finalTotalElement = await screen.findByText(/Total: Rp 60,000/i);
        expect(finalTotalElement).toBeInTheDocument();
    });

    test('Kriteria 3: Menghapus item dari keranjang harus memperbarui total belanja', async () => {
        const addButtons = screen.getAllByRole('button', { name: /Tambah/i });

        // Tambah 2 item dulu
        await user.click(addButtons[0]); // Nasi Goreng
        await user.click(addButtons[1]); // Ayam Bakar

        // Tunggu sampai item muncul di keranjang
        await screen.findByTestId('cart');

        // Cari tombol hapus dan klik yang pertama (untuk Nasi Goreng)
        const removeButtons = screen.getAllByRole('button', { name: /Hapus/i });
        await user.click(removeButtons[0]);

        // Tunggu dan periksa apakah total berkurang
        const totalElement = await screen.findByText(/Total: Rp 35,000/i);
        expect(totalElement).toBeInTheDocument();
    });

    test('Kriteria 4: Tombol "Checkout" harus mengosongkan keranjang dan total', async () => {
        const addButtons = screen.getAllByRole('button', { name: /Tambah/i });
        await user.click(addButtons[0]);

        // Tunggu sampai tombol checkout muncul
        const checkoutButton = await screen.findByRole('button', { name: /Checkout/i });
        await user.click(checkoutButton);

        // Periksa apakah alert dipanggil
        expect(global.alert).toHaveBeenCalledWith('Terima kasih! Pesanan Anda sedang diproses.');

        // Tunggu dan periksa apakah total kembali ke 0
        const totalElement = await screen.findByText(/Total: Rp 0/i);
        expect(totalElement).toBeInTheDocument();
    });

    test('Kriteria 5: Komponen "View" harus diexport dengan benar', () => {
        expect(View).toBeDefined();
    });
});
