/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');

// ========================================================
// MOCK ALERT UNTUK MEMANTAU PEMANGGILAN
// ========================================================
global.alert = jest.fn();

let Tombol_1, Tombol_2, Tombol_3;
let importError = null;

beforeAll(() => {
  if (!process.env.SUBMISSION_PATH) {
    importError = new Error('❌ ENV Error: File tugas tidak ditemukan. Pastikan SUBMISSION_PATH sudah diatur.');
    return;
  }

  try {
    const submission = require(process.env.SUBMISSION_PATH);
    Tombol_1 = submission.default || submission.Tombol_1;
    Tombol_2 = submission.Tombol_2;
    Tombol_3 = submission.Tombol_3;

    if (typeof Tombol_1 !== 'function' || typeof Tombol_2 !== 'function' || typeof Tombol_3 !== 'function') {
      importError = new Error(
        '❌ Gagal pada Validasi Ekspor:\n' +
        'Pastikan komponen Tombol_1, Tombol_2, dan Tombol_3 diekspor sebagai fungsi.'
      );
    }
  } catch (err) {
    importError = new Error([
      '❌ Gagal membaca file tugas Anda.',
      `💥 Error: ${err.message}`,
      '💡 Periksa kembali sintaks dan ekspor komponen Anda.'
    ].join('\n'));
  }
});

describe('Praktikum: Komponen Tombol dan Event Handler', () => {
  test('Validasi Impor: Semua komponen harus berhasil diimpor dan berupa fungsi', () => {
    if (importError) throw importError;
    expect(typeof Tombol_1).toBe('function');
    expect(typeof Tombol_2).toBe('function');
    expect(typeof Tombol_3).toBe('function');
  });

  const conditionalDescribe = importError ? describe.skip : describe;

  conditionalDescribe('Detail Pengujian Fungsional Komponen', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // =============================
    // Tombol_1: Default Export
    // =============================
    describe('Tombol_1', () => {
      test('Kriteria 1 [W=5]: Menampilkan tombol dengan teks "ini tombol"', () => {
        render(<Tombol_1 />);
        const btn = screen.queryByRole('button', { name: /ini tombol/i });
        if (!btn) throw new Error('❌ Gagal pada Kriteria 1: Teks tombol "ini tombol" tidak ditemukan.');
        expect(btn).toBeInTheDocument();
      });

      test('Kriteria 2 [W=10]: Memanggil alert dengan pesan "Tombol telah ditekan!!!" saat diklik', () => {
        render(<Tombol_1 />);
        const btn = screen.getByRole('button', { name: /ini tombol/i });
        fireEvent.click(btn);
        expect(global.alert).toHaveBeenCalledWith('Tombol telah ditekan!!!');
      });

      test('Kriteria 3 [W=20]: Memanggil alert "Loh, kok sudah pergi?" saat mouse meninggalkan tombol', () => {
        render(<Tombol_1 />);
        const btn = screen.getByRole('button', { name: /ini tombol/i });
        fireEvent.mouseLeave(btn);
        expect(global.alert).toHaveBeenCalledWith('Loh, kok sudah pergi?');
      });
    });

    // =============================
    // Tombol_2: Named Export
    // =============================
    describe('Tombol_2', () => {
      const props = {
        isipesan: 'Memutar Film!',
        namaTombol: 'Putar Film'
      };

      test('Kriteria 4 [W=15]: Menampilkan tombol dengan teks ', () => {
        render(<Tombol_2 {...props} />);
        const btn = screen.queryByRole('button', { name: props.namaTombol });
        if (!btn) throw new Error('❌ Gagal pada Kriteria 4: Tombol dengan nama tidak ditemukan.');
        expect(btn).toBeInTheDocument();
      });

      test('Kriteria 5 [W=25]: Memanggil alert dengan isi pesan saat tombol diklik', () => {
        render(<Tombol_2 {...props} />);
        const btn = screen.getByRole('button', { name: props.namaTombol });
        fireEvent.click(btn);
        expect(global.alert).toHaveBeenCalledWith(props.isipesan);
      });
    });

    // =============================
    // Tombol_3: Named Export
    // =============================
    describe('Tombol_3', () => {
      const props = {
        isipesan: 'Mengunggah Gambar!',
        namaTombol: 'Unggah Gambar'
      };

      test('Kriteria 6 [W=10]: Menampilkan tombol dengan teks', () => {
        render(<Tombol_3 {...props} />);
        const btn = screen.queryByRole('button', { name: props.namaTombol });
        if (!btn) throw new Error('❌ Gagal pada Kriteria 6: Tombol tidak ditemukan.');
        expect(btn).toBeInTheDocument();
      });

      test('Kriteria 7 [W=15]: Memanggil alert dengan isi pesan saat tombol diklik', () => {
        render(<Tombol_3 {...props} />);
        const btn = screen.getByRole('button', { name: props.namaTombol });
        fireEvent.click(btn);
        expect(global.alert).toHaveBeenCalledWith(props.isipesan);
      });
    });
  });
});
