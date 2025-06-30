// File: react_grading_engine/jest.config.js

module.exports = {
  // Menentukan lingkungan tes agar bisa mensimulasikan browser
  testEnvironment: 'jsdom',

  // BAGIAN PALING PENTING: AKTIFKAN "PENERJEMAH" (BABEL)
  transform: {
    // Gunakan babel-jest untuk mengubah semua file .js atau .jsx menjadi
    // bahasa yang dimengerti oleh lingkungan tes Node.js.
    '^.+\\.[jt]sx?$': 'babel-jest',
  },

  // Memberitahu Jest untuk tidak mencoba mengubah file di dalam node_modules
  transformIgnorePatterns: [
    '/node_modules/',
  ],
};
