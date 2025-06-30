/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;

const Form = require(process.env.SUBMISSION_PATH).default;

describe('Praktikum: Komponen Form Interaktif', () => {
    const user = userEvent.setup();

    test('Kriteria 1: Harus menampilkan semua elemen form saat awal render', () => {
        render(<Form />);
        expect(screen.getByRole('heading', { name: /Tebak Nama Hewan/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });

    test('Kriteria 2: Tombol "Submit" harus nonaktif jika textarea kosong', () => {
        render(<Form />);
        expect(screen.getByRole('button', { name: /Submit/i })).toBeDisabled();
    });

    test('Kriteria 3: Menampilkan pesan error jika jawaban salah', async () => {
        render(<Form />);
        await user.type(screen.getByRole('textbox'), 'kucing');
        await user.click(screen.getByRole('button', { name: /Submit/i }));
        expect(await screen.findByText(/Tebakan yang bagus tetapi jawaban salah/i)).toBeInTheDocument();
    });

    test('Kriteria 4: Menampilkan pesan sukses jika jawaban benar', async () => {
        render(<Form />);
        await user.type(screen.getByRole('textbox'), 'tikus');
        await user.click(screen.getByRole('button', { name: /Submit/i }));
        expect(await screen.findByRole('heading', { name: /Yay... Jawaban Benar!/i })).toBeInTheDocument();
    });
});
