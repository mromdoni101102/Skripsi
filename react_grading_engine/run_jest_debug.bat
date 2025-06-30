@echo off

ECHO.
ECHO =========================================
ECHO MEMULAI PROSES DEBUGGING JEST...
ECHO =========================================

:: Menambahkan path ke Node.js
SET "PATH=%PATH%;C:\Program Files\nodejs"

:: Menampilkan argumen yang diterima dari PHP untuk verifikasi
ECHO.
ECHO [INFO] Path File Mahasiswa: %~1
ECHO [INFO] Path File Tes: %~2
ECHO [INFO] Path File Output JSON: %~3
ECHO.

:: Atur environment variable untuk Jest
SET SUBMISSION_PATH=%~1

:: Jalankan Jest dengan flag --debug dan rekam SEMUA output (baik & buruk) ke log
ECHO [INFO] Menjalankan Jest sekarang...
node "%~dp0\node_modules\jest\bin\jest.js" %~2 --debug --json --outputFile=%~3 --runInBand > jest_debug_log.txt 2>&1

ECHO [INFO] Proses Jest selesai.
ECHO =========================================
