<?php

namespace App\Http\Controllers\React\Student;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\React\ReactTask;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use App\Models\React\ReactSubmitUser;
use App\Models\React\ReactUserEnroll;
use Symfony\Component\Process\Process;
use App\Models\React\ReactTaskSubmission;

class ReactLogicalController extends Controller
{
    public function uploadFile(Request $request)
    {
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

        $gradingEnginePath = base_path('react_grading_engine');
        $submissionDir = $gradingEnginePath . '/submissions';
        $dependenciesDir = $gradingEnginePath . '/dependencies';

        $uniqueFilename = Str::uuid()->toString();
        $submissionFilename = $uploadedFile->getClientOriginalName();
        $resultsFilename = $uniqueFilename . '.json';
        $fullSubmissionPath = $submissionDir . '/' . $submissionFilename;
        $fullResultsPath = $submissionDir . '/' . $resultsFilename;
        $testFile = "tests/{$testFileName}";
        $dependencies = ['Card.js', 'profile.js', 'utils.js'];
        $copiedDependencies = [];

        $uploadedFile->move($submissionDir, $submissionFilename);

        $processErrorOutput = null;

        try {
            foreach ($dependencies as $dep) {
                if ($dep !== $submissionFilename) {
                    $source = $dependenciesDir . '/' . $dep;
                    $destination = $submissionDir . '/' . $dep;
                    if (File::exists($source) && !File::exists($destination)) {
                        File::copy($source, $destination);
                        $copiedDependencies[] = $destination;
                    }
                }
            }

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

        $score = 0;
        $isSuccess = false;
        $feedbackDetails = [];
        $executionTime = 'N/A';

        if (File::exists($fullResultsPath)) {
            $jsonOutput = File::get($fullResultsPath);
            $gradingResult = json_decode($jsonOutput);

            if (isset($gradingResult->startTime, $gradingResult->testResults[0]->endTime)) {
                $durationMs = $gradingResult->testResults[0]->endTime - $gradingResult->startTime;
                $durationSeconds = $durationMs / 1000;
                $executionTime = number_format($durationSeconds, 3) . ' s';
            }

            $totalWeightedScore = 0; // Ini adalah Σ(Si * Wi)
            $totalWeights = 0;       // Ini adalah Σ(Wi)



            if (!empty($gradingResult->testResults[0]->assertionResults)) {
                foreach ($gradingResult->testResults[0]->assertionResults as $assertion) {
                    $weight = 0;
                    // Ekstrak bobot dari judul tes menggunakan regular expression
                    if (preg_match('/\[\s*W\s*=\s*(\d+)\s*\]/i', $assertion->title, $matches)) {
                        $weight = (int)$matches[1];
                    }

                    $totalWeights += $weight;

                    // S_i adalah 1 jika lulus, 0 jika gagal
                    if ($assertion->status === 'passed') {
                        $totalWeightedScore += $weight; // Sama dengan (1 * weight)
                    }

                    // (Mengambil feedback tetap sama)
                    $rawErrorMessage = !empty($assertion->failureMessages) ? $assertion->failureMessages[0] : null;
                    $feedbackDetails[] = [
                        'title' => $assertion->title,
                        'status' => $assertion->status,
                        'errorMessage' => $this->formatJestError($rawErrorMessage)
                    ];
                }
            }
            // Hitung skor akhir sesuai rumus
            $score = ($totalWeights > 0) ? ($totalWeightedScore / $totalWeights) * 100 : 0;
            // Anggap sukses jika semua tes lulus (skor 100)
            $isSuccess = abs($score - 100) < 0.01;
            // ===================================================================
            // === PERUBAHAN SELESAI ===
            // ===================================================================
        } else {
            // Jika file hasil JSON tidak ada (kemungkinan error fatal)
            // (Logika ini sudah ada di kode Anda, biarkan saja)
            if (empty($feedbackDetails)) {
                $feedbackDetails = [[
                    'title' => 'Pengecekan Kode Gagal (Error Sintaks/Dependensi)',
                    'status' => 'failed',
                    'errorMessage' => "Terdapat error fatal pada kode Anda atau file yang dibutuhkan tidak ditemukan.\n\nDETAIL TEKNIS:\n" . $processErrorOutput
                ]];
            }
        }

        if (empty($feedbackDetails)) {
            $feedbackDetails = [[
                'title' => 'Pengecekan Kode Gagal (Error Sintaks/Dependensi)',
                'status' => 'failed',
                'errorMessage' => "Terdapat error fatal pada kode Anda atau file yang dibutuhkan tidak ditemukan.\n\nDETAIL TEKNIS:\n" . $processErrorOutput
            ]];
        }

        $submitSubmission = [
            'task_id' => $taskId,
            'username' => Auth::user()->name,
            'php_topic_id' => $taskId,
            'tipe' => 'file',
            'userfile' => $fullSubmissionPath,
            'created_at' => now(),
        ];
        ReactTaskSubmission::create($submitSubmission);

        $submitUser = new ReactSubmitUser();
        $submitUser->id_user = Auth::id();
        $submitUser->nama_user = Auth::user()->name;
        $submitUser->materi = 'React - ' . $task->task_name;
        $submitUser->nilai = round($score);
        $submitUser->task_id = $taskId;
        $submitUser->status = $isSuccess ? 'Benar' : 'Salah';
        $submitUser->save();

        if (File::exists($fullResultsPath)) File::delete($fullResultsPath);
        foreach ($copiedDependencies as $depPath) {
            if (File::exists($depPath)) File::delete($depPath);
        }

        $countUserTasks = ReactSubmitUser::join('react_task', 'react_task.id', '=', 'react_submit_user.task_id')
            ->where('react_task.id_topics', $task->id_topics)
            ->where('react_submit_user.id_user', Auth::id())
            ->where('react_submit_user.status', 'Benar')
            ->distinct('task_id')
            ->count();

        $countAllTasks = ReactTask::where('id_topics', $task->id_topics)->count();
        $topicIsNowComplete = false;

        if ($countUserTasks == $countAllTasks) {
            $topicIsNowComplete = true;
            ReactUserEnroll::withoutTimestamps(function () use ($task, $request) {
                ReactUserEnroll::updateOrCreate(
                    ['id_users' => Auth::id(), 'php_topics_detail_id' => $task->id_topics],
                    ['flag' => true]
                );
            });

            DB::table('react_topics_detail_time')
                ->where('user_id', Auth::id())
                ->where('react_topics_detail_id', $task->id_topics)
                ->whereNull('end_time')
                ->update(['end_time' => now()]);
        }

        $responseData = [
            'score'   => round($score),
            'feedback'  => $feedbackDetails,
            'is_success' => $isSuccess,
            'message'  => $isSuccess ? 'Selamat! Semua kriteria terpenuhi.' : 'Penilaian selesai, namun ditemukan beberapa kesalahan. Silakan perbaiki kode Anda.',
            'task_id'  => $taskId,
            'duration'   => $executionTime,
            'topic_completed' => $topicIsNowComplete,
        ];

        if ($request->ajax()) {
            return response()->json($responseData);
        }

        return redirect()->back()->with($responseData);
    }


    /**
     * Menerjemahkan dan menyederhanakan pesan error mentah dari Jest
     * menjadi umpan balik yang ramah bagi mahasiswa.
     *
     * @param string|null $rawError Pesan error mentah dari Jest.
     * @return string|null Pesan umpan balik yang sudah diterjemahkan dan disederhanakan.
     */
    private function formatJestError(?string $rawError): ?string
    {
        if (empty($rawError)) {
            return null;
        }


        if (preg_match('/Unable to find an element with the text: (.*?)\./', $rawError, $matches)) {
            $missingText = trim($matches[1]);
            return "💡 Gagal: Teks '{$missingText}' yang diharapkan tidak dapat ditemukan. Pastikan komponen Anda sudah menampilkan (me-render) teks ini dengan benar.";
        }

        if (preg_match('/Found multiple elements with the text: (.*)/', $rawError, $matches)) {
            $duplicateText = trim($matches[1]);
            return "💡 Gagal: Ditemukan lebih dari satu elemen dengan teks '{$duplicateText}'. Pengujian mengharapkan hanya ada satu. Periksa apakah ada duplikasi data atau komponen.";
        }

        if (preg_match('/expect\(received\)\.([^)]+)\(([^)]+)\)/', $rawError, $matches)) {
            $expected = 'N/A';
            $received = 'N/A';

            if (preg_match('/Expected: (.*)/', $rawError, $expectedMatch)) {
                $expected = trim($expectedMatch[1]);
            }
            if (preg_match('/Received: (.*)/', $rawError, $receivedMatch)) {
                $received = trim($receivedMatch[1]);
            }

            return "💡 Gagal: Hasil tidak sesuai dengan yang diharapkan.\n- Diharapkan: {$expected}\n- Diterima:   {$received}";
        }

        if (preg_match('/(TypeError|ReferenceError): (.*)/', $rawError, $matches)) {
            $errorType = $matches[1];
            $errorMessage = $matches[2];
            $suggestion = '';
            if ($errorType === 'TypeError') {
                $suggestion = 'Ini bisa terjadi jika Anda mencoba mengakses properti dari variabel yang `null` atau `undefined`.';
            }
            if ($errorType === 'ReferenceError') {
                $suggestion = 'Ini biasanya terjadi karena ada variabel yang digunakan sebelum dideklarasikan.';
            }
            return "💡 Terjadi error pada kode Anda: `{$errorMessage}`.\n{$suggestion}";
        }

        $cleanError = preg_replace('/\x1B\[[0-9;]*[mGKF]/', '', $rawError);
        $lines = explode("\n", $cleanError);
        $errorSummary = [];
        foreach ($lines as $line) {
            if (preg_match('/^\s+at\s/', $line)) break;
            $errorSummary[] = $line;
        }
        return "Terjadi kesalahan teknis yang tidak terduga:\n" . trim(implode("\n", $errorSummary));
    }
    public function getComparisonResults($userId)
    {
        $results = ReactSubmitUser::where('id_user', $userId)->get();
        return response()->json($results);
    }
}
