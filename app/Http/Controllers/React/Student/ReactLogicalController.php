<?php

namespace App\Http\Controllers\React\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\React\ReactTask;
use Illuminate\Support\Facades\Auth;
use App\Models\React\ReactSubmitUser;
use App\Models\React\ReactTaskSubmission;
use App\Models\React\ReactTopic_detail;
use App\Models\React\ReactUserCheck;
use App\Models\React\ReactUserEnroll;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

class ReactLogicalController extends Controller
{
    public function uploadFile(Request $request)
    {
        // 1. Validasi
        $request->validate([
            'uploadFile' => 'required|file|extensions:js,jsx|max:1024',
            'task_id'    => 'required|integer|exists:react_task,id'
        ]);


        $uploadedFile = $request->file('uploadFile');
        $taskId = $request->input('task_id');
        $task = ReactTask::find($taskId);

        if (!$task || !$task->test_filename) {
            throw new \Exception("Tidak ada tes praktik yang terdaftar untuk tugas ini (ID: {$taskId}).");
        }

        $testFileName = $task->test_filename;

        // 2. Persiapan semua path
        $gradingEnginePath = base_path('react_grading_engine');
        $submissionDir = $gradingEnginePath . '/submissions'; // ./react_grading_engine/submissions
        $dependenciesDir = $gradingEnginePath . '/dependencies'; // ./react_grading_engine/dependencies

        $uniqueFilename = Str::uuid()->toString(); // Menggunakan UUID untuk nama unik
        $submissionFilename = $uploadedFile->getClientOriginalName(); // Nama asli file yang diupload
        $resultsFilename = $uniqueFilename . '.json'; // Nama file hasil tes yang unik
        $fullSubmissionPath = $submissionDir . '/' . $submissionFilename; // Path lengkap untuk file yang diupload -> ./react_grading_engine/submissions/nama_file.js
        $fullResultsPath = $submissionDir . '/' . $resultsFilename; // Path lengkap untuk hasil tes -> ./react_grading_engine/submissions/uuid.json
        $testFile = "tests/{$testFileName}"; // Path relatif ke file tes yang akan dijalankan -> tests/nama_file.js

        // Daftar semua kemungkinan file dependensi
        $dependencies = ['Card.js', 'profile.js', 'utils.js'];
        $copiedDependencies = [];

        // Pindahkan file mahasiswa
        $uploadedFile->move($submissionDir, $submissionFilename);

        $processErrorOutput = null;

        try {
            // Salin file dependensi yang relevan ke folder submission
            foreach ($dependencies as $dep) {
                // HANYA salin jika nama file dependensi TIDAK SAMA dengan file yang diupload
                if ($dep !== $submissionFilename) {
                    $source = $dependenciesDir . '/' . $dep;
                    $destination = $submissionDir . '/' . $dep;
                    if (File::exists($source) && !File::exists($destination)) {
                        File::copy($source, $destination);
                        $copiedDependencies[] = $destination;
                    }
                }
            }

            // Jalankan proses tes melalui wrapper script
            $wrapperScriptPath = $gradingEnginePath . '/run_jest.bat';
            $process = new Process([
                $wrapperScriptPath,
                $fullSubmissionPath,
                $testFile,
                $fullResultsPath
            ], $gradingEnginePath);

            $process->setTimeout(120);
            $process->run();

            if (!$process->isSuccessful()) {
                $processErrorOutput = $process->getErrorOutput();
            }
        } catch (\Exception $e) {
            Log::error('Grading system failed: ' . $e->getMessage());
            // Bersihkan file jika terjadi error
            if (File::exists($fullSubmissionPath)) File::delete($fullSubmissionPath);
            foreach ($copiedDependencies as $depPath) {
                if (File::exists($depPath)) File::delete($depPath);
            }
            return redirect()->back()->with([
                'success' => false,
                'error' => 'Error Kritis Sistem',
                'message' => 'Terjadi kesalahan pada sistem.',
                'details' => $e->getMessage()
            ]);
        }

        // Logika untuk membaca hasil dan memberi skor
        $score = 0;
        $isSuccess = false;
        $feedbackDetails = [];
        $executionTime = 'N/A'; // Tambahkan variabel default untuk durasi

        if (File::exists($fullResultsPath)) {
            $jsonOutput = File::get($fullResultsPath);
            $gradingResult = json_decode($jsonOutput);

            // ==== AWAL PERUBAHAN ====
            // Hitung durasi eksekusi jika data tersedia
            if (isset($gradingResult->startTime, $gradingResult->testResults[0]->endTime)) {
                $durationMs = $gradingResult->testResults[0]->endTime - $gradingResult->startTime;
                $durationSeconds = $durationMs / 1000;
                // Format menjadi 3 angka desimal seperti di terminal Jest (misal: 2.529 s)
                $executionTime = number_format($durationSeconds, 3) . ' s';
            }
            // ==== AKHIR PERUBAHAN ====

            $numPassedTests = $gradingResult->numPassedTests ?? 0;
            $numTotalTests = $gradingResult->numTotalTests ?? 0;
            $score = ($numTotalTests > 0) ? ($numPassedTests / $numTotalTests) * 100 : 0;
            $isSuccess = $gradingResult->success ?? false;

            if (!empty($gradingResult->testResults[0]->assertionResults)) {
                foreach ($gradingResult->testResults[0]->assertionResults as $assertion) {
                    $feedbackDetails[] = [
                        'title' => $assertion->title,
                        'status' => $assertion->status,
                        'errorMessage' => !empty($assertion->failureMessages) ? $assertion->failureMessages[0] : null
                    ];
                }
            }
        }

        if (empty($feedbackDetails)) {
            $feedbackDetails = [[
                'title' => 'Pengecekan Kode Gagal (Error Sintaks/Dependensi)',
                'status' => 'failed',
                'errorMessage' => "Terdapat error fatal pada kode Anda atau file yang dibutuhkan tidak ditemukan.\n\nDETAIL TEKNIS:\n" . $processErrorOutput
            ]];
        }

        // Simpan file pengumpulan ke log
        $submitSubmission = [
            'task_id' => $taskId,
            'username' => Auth::user()->name,
            'php_topic_id' => $taskId,
            'tipe' => 'file',
            'userfile' => $fullSubmissionPath,
            'created_at' => now(),
        ];
        ReactTaskSubmission::create($submitSubmission);

        // Simpan hasil penilaian ke database
        $submitUser = new ReactSubmitUser();
        $submitUser->id_user = Auth::id();
        $submitUser->nama_user = Auth::user()->name;
        $submitUser->materi = 'React - ' . $task->task_name;
        $submitUser->nilai = round($score);
        $submitUser->task_id = $taskId;
        $submitUser->status = $isSuccess ? 'Benar' : 'Salah';
        $submitUser->save();

        // Hapus SEMUA file sementara
        if (File::exists($fullResultsPath)) File::delete($fullResultsPath);
        foreach ($copiedDependencies as $depPath) {
            if (File::exists($depPath)) File::delete($depPath);
        }

        // Count all completed tasks in the topic
        $countUserTasks = ReactSubmitUser::join('react_task', 'react_task.id', '=', 'react_submit_user.task_id')
            ->where('react_task.id_topics', $task->id_topics)
            ->where('react_submit_user.id_user', Auth::id())
            ->where('react_submit_user.status', 'Benar')
            ->distinct('task_id')
            ->count();

        // Count all tasks in the topic
        $countAllTasks = ReactTask::where('id_topics', $task->id_topics)->count();

        // Update enrollment status
        if ($countUserTasks == $countAllTasks) {
            ReactUserEnroll::withoutTimestamps(function () use ($task, $request) {
                return ReactUserEnroll::updateOrCreate(
                    [
                        'id_users' => Auth::id(),
                        'php_topics_detail_id' => $task->id_topics
                    ],
                    ['flag' => true]
                );
            });
        }

        // Data yang akan dikirim kembali sebagai respons
        $responseData = [
            'score'   => round($score),
            'feedback'  => $feedbackDetails,
            'is_success' => $isSuccess,
            'message'  => $isSuccess ? 'Selamat! Semua kriteria terpenuhi.' : 'Penilaian selesai, namun ditemukan beberapa kesalahan. Silakan perbaiki kode Anda.',
            'task_id'  => $taskId,
            'duration'   => $executionTime, // <-- TAMBAHKAN BARIS INI
        ];

        // PERUBAHAN UTAMA: Cek jika ini adalah request AJAX
        if ($request->ajax()) {
            // Jika ya, kirim respons dalam format JSON
            return response()->json($responseData);
        }

        // Jika tidak (fallback jika JS gagal), gunakan metode redirect lama
        return redirect()->back()->with($responseData);
    }

    public function getComparisonResults($userId)
    {
        $results = ReactSubmitUser::where('id_user', $userId)->get();
        return response()->json($results);
    }
}
