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

     test('Kriteria 1 [W=15]: Harus menampilkan judul dan 3 menu item saat awal render', () => {
        expect(screen.getByRole('heading', { name: /Daftar Menu/i })).toBeInTheDocument();
        const menuItems = screen.getAllByTestId('menu-item');
        expect(menuItems).toHaveLength(3);
        expect(screen.getByText(/Nasi Goreng/i)).toBeInTheDocument();
        expect(screen.getByText(/Ayam Bakar/i)).toBeInTheDocument();
        expect(screen.getByText(/Es Teh Manis/i)).toBeInTheDocument();
    });

    // Bobot tinggi karena menguji logika state untuk menambah item dan total.
    test('Kriteria 2 [W=30]: Menambah item ke keranjang harus memperbarui total belanja', async () => {
        const addButtons = screen.getAllByRole('button', { name: /Tambah/i });
        await user.click(addButtons[0]);
        const totalElement = await screen.findByText(/Total: Rp 25,000/i);
        expect(totalElement).toBeInTheDocument();
        await user.click(addButtons[1]);
        const finalTotalElement = await screen.findByText(/Total: Rp 60,000/i);
        expect(finalTotalElement).toBeInTheDocument();
    });

    // Bobot tinggi karena menguji logika state untuk menghapus item dan mengurangi total.
    test('Kriteria 3 [W=30]: Menghapus item dari keranjang harus memperbarui total belanja', async () => {
        const addButtons = screen.getAllByRole('button', { name: /Tambah/i });
        await user.click(addButtons[0]);
        await user.click(addButtons[1]);
        await screen.findByTestId('cart');
        const removeButtons = screen.getAllByRole('button', { name: /Hapus/i });
        await user.click(removeButtons[0]);
        const totalElement = await screen.findByText(/Total: Rp 35,000/i);
        expect(totalElement).toBeInTheDocument();
    });

    // Bobot tinggi karena menguji logika untuk mereset state aplikasi.
    test('Kriteria 4 [W=20]: Tombol "Checkout" harus mengosongkan keranjang dan total', async () => {
        const addButtons = screen.getAllByRole('button', { name: /Tambah/i });
        await user.click(addButtons[0]);
        const checkoutButton = await screen.findByRole('button', { name: /Checkout/i });
        await user.click(checkoutButton);
        expect(global.alert).toHaveBeenCalledWith('Terima kasih! Pesanan Anda sedang diproses.');
        const totalElement = await screen.findByText(/Total: Rp 0/i);
        expect(totalElement).toBeInTheDocument();
    });

    test('Kriteria 5 [W=5]: Komponen "View" harus diexport dengan benar', () => {
        expect(View).toBeDefined();
    });
});
