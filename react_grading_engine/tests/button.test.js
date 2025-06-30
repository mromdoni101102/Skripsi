/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

// ======================================================================
// TIDAK ADA MOCKING DEPENDENSI KARENA KODE INI MANDIRI
// TAPI KITA PERLU MOCK 'window.alert' AGAR BISA DILACAK OLEH JEST
// ======================================================================
global.alert = jest.fn();


// ======================================================================
// BAGIAN 2: MENGAMBIL KODE MAHASISWA
// ======================================================================
if (!process.env.SUBMISSION_PATH) {
  throw new Error('SUBMISSION_PATH environment variable not set.');
}
// Mengambil semua komponen yang diexport dari file jawaban mahasiswa
const submission = require(process.env.SUBMISSION_PATH);
const Tombol_1 = submission.default;
const Tombol_2 = submission.Tombol_2;
const Tombol_3 = submission.Tombol_3;


// ======================================================================
// BAGIAN 3: CHECKLIST PENILAIAN FUNGSIONAL
// ======================================================================
describe('Praktikum: Komponen Tombol dan Event Handler', () => {

    // Membersihkan semua mock (termasuk alert) sebelum setiap tes
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Menguji Tombol_1 ---
    describe('Tombol_1 (Default Export)', () => {
        test('Kriteria 1: Harus menampilkan tombol dengan teks "ini tombol"', () => {
            render(<Tombol_1 />);
            const button = screen.getByRole('button', { name: /ini tombol/i });
            expect(button).toBeInTheDocument();
        });

        test('Kriteria 2: Harus memanggil alert "Tombol telah ditekan!!!" saat diklik', () => {
            render(<Tombol_1 />);
            const button = screen.getByRole('button', { name: /ini tombol/i });
            fireEvent.click(button);
            expect(global.alert).toHaveBeenCalledWith('Tombol telah ditekan!!!');
        });

        test('Kriteria 3: Harus memanggil alert "Loh, kok sudah pergi?" saat mouse meninggalkan tombol', () => {
            render(<Tombol_1 />);
            const button = screen.getByRole('button', { name: /ini tombol/i });
            fireEvent.mouseLeave(button);
            expect(global.alert).toHaveBeenCalledWith('Loh, kok sudah pergi?');
        });
    });

    // --- Menguji Tombol_2 ---
    describe('Tombol_2 (Named Export)', () => {
        const props = { isipesan: 'Memutar Film!', namaTombol: 'Putar Film' };

        test('Kriteria 4: Harus menampilkan tombol dengan teks dari props', () => {
            render(<Tombol_2 {...props} />);
            const button = screen.getByRole('button', { name: props.namaTombol });
            expect(button).toBeInTheDocument();
        });

        test('Kriteria 5: Harus memanggil alert dengan pesan dari props saat diklik', () => {
            render(<Tombol_2 {...props} />);
            const button = screen.getByRole('button', { name: props.namaTombol });
            fireEvent.click(button);
            expect(global.alert).toHaveBeenCalledWith(props.isipesan);
        });
    });

    // --- Menguji Tombol_3 ---
    describe('Tombol_3 (Named Export)', () => {
        const props = { isipesan: 'Mengunggah Gambar!', namaTombol: 'Unggah Gambar' };

        test('Kriteria 6: Harus menampilkan tombol dengan teks dari props', () => {
            render(<Tombol_3 {...props} />);
            const button = screen.getByRole('button', { name: props.namaTombol });
            expect(button).toBeInTheDocument();
        });

        test('Kriteria 7: Harus memanggil alert dengan pesan dari props saat diklik', () => {
            render(<Tombol_3 {...props} />);
            const button = screen.getByRole('button', { name: props.namaTombol });
            fireEvent.click(button);
            expect(global.alert).toHaveBeenCalledWith(props.isipesan);
        });
    });
});
