<?php

namespace App\Http\Controllers\React;


use Illuminate\Http\Request;
use App\Models\React\ReactTask;
use App\Models\React\ReactTopic;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use App\Models\React\ReactSubmitUser;
use App\Models\React\ReactUserEnroll;
use App\Models\React\ReactTopic_detail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon; // <-- PASTIKAN INI ADA

class ReactController extends Controller
{

    public function submit_score_baru(Request $request)
    {
        $userId = Auth::id();
        $score = $request->input('score');
        $topicsId = $request->input('topics_id');

        DB::table('react_user_submits')->insert([
            'user_id' => $userId,
            'score' => $score,
            'topics_id' => $topicsId,
            'flag' => $score > 50 ? true : false,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $currentRank = DB::table('react_student_rank')
            ->where('id_user', $userId)
            ->where('topics_id', $topicsId)
            ->first();

        if (!$currentRank) {
            DB::table('react_student_rank')->insert([
                'id_user' => $userId,
                'best_score' => $score,
                'topics_id' => $topicsId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else if ($score > $currentRank->best_score) {
            DB::table('react_student_rank')
                ->where('id_user', $userId)
                ->where('topics_id', $topicsId)
                ->update([
                    'best_score' => $score,
                    'updated_at' => now()
                ]);
        }


        if ($score > 50) {
            $exists = DB::table('react_student_enroll')
                ->where('id_users', Auth::user()->id)
                ->where('php_topics_detail_id', $topicsId)
                ->exists();

            if (!$exists) {
                $flags = $results[0]->flag ?? 0;
                if ($flags == 0) {
                    DB::table('react_student_enroll')->insert([
                        'id_users' => Auth::user()->id,
                        'php_topics_detail_id' => $topicsId,
                        'created_at' => now()
                    ]);
                }
            }
        }


        return response()->json(['message' => 'Score submitted successfully']);
    }

    public function index()
    {

        $actual = "";
        $topics = ReactTopic::all();
        $topics_detail = [];
        if (isset($_GET['type'])) {
            $type = $_GET['type'];
            if ($type == 'basic') {
                $topics_detail = ReactTopic_detail::where('id', '<=', 39)->get();
            } else if ($type == 'advanced') {
                $topics_detail = ReactTopic_detail::where('id', '>', 39)->get();
            }
        } else {
            $actual = $this->html_start();
        }
        $topicsCount = count($topics);
        $topicsDetailCount = count($topics_detail);

        $idUser         = Auth::user()->id;
        $roleTeacher    = DB::select("select role from users where id = $idUser");

        if ($roleTeacher[0]->role == "student") {
            $completedTopics = DB::table('react_student_enroll')
                ->join('users', 'react_student_enroll.id_users', '=', 'users.id')
                ->join('react_topics_detail', 'react_student_enroll.php_topics_detail_id', '=', 'react_topics_detail.id')
                ->select('react_student_enroll.*', 'users.name as user_name', 'react_topics_detail.*')
                ->where('react_student_enroll.id_users', $idUser)
                ->where('react_student_enroll.flag', true)
                ->get();
        } else if ($roleTeacher[0]->role == "teacher") {
            $completedTopics = DB::table('react_student_enroll')
                ->join('users', 'react_student_enroll.id_users', '=', 'users.id')
                ->join('react_topics_detail', 'react_student_enroll.php_topics_detail_id', '=', 'react_topics_detail.id')
                ->select('react_student_enroll.*', 'users.name as user_name', 'react_topics_detail.*')
                ->get();
        } else {;
        }

        $progress = [];
        foreach ($completedTopics as $enrollment) {
            $userId = $enrollment->id_users;
            if (!isset($progress[$userId])) {
                $userCompletedCount = DB::table('react_student_enroll')
                    ->where('id_users', $userId)
                    ->where('flag', true)
                    ->count();

                $progress[$userId] = [
                    'name' => $enrollment->user_name,
                    'percent' => round(($userCompletedCount / $topicsDetailCount) * 100, 2)
                ];
            }
        }

        $studentSubmissions = [];
        if ($roleTeacher[0]->role == "teacher") {
            $studentSubmissions = ReactSubmitUser::whereHas('reactTask')
                ->join('users', 'users.id', '=', 'react_submit_user.id_user')
                ->join('react_task', 'react_task.id', '=', 'react_submit_user.task_id')
                ->select(
                    'react_submit_user.created_at as Time',
                    'users.name as UserName',
                    'react_task.task_name as TopicName',
                    'react_submit_user.nilai as Nilai',
                )
                ->get();
        } else {
            $studentSubmissions = ReactSubmitUser::where('id_user', Auth::id())
                ->whereHas('reactTask')
                ->join('users', 'users.id', '=', 'react_submit_user.id_user')
                ->join('react_task', 'react_task.id', '=', 'react_submit_user.task_id')
                ->select(
                    'react_submit_user.created_at as Time',
                    'users.name as UserName',
                    'react_task.task_name as TopicName',
                    'react_submit_user.nilai as Score',
                )
                ->get();
        }



        return view('react.student.material.index', [
            'result_up'     => $actual,
            'topics'        => $topics_detail,
            'topicsCount'   => $topicsDetailCount,
            'completedTopics' => $completedTopics,
            'role'       => $roleTeacher[0] ? $roleTeacher[0]->role : '',
            'progress' => $progress,
            'studentSubmissions' => $studentSubmissions,
        ]);
    }

    function php_material_detail()
    {
        // Bagian 1: Setup variabel dasar
        $phpid = request()->get('phpid') ? (int)request()->get('phpid') : 0;
        $start = request()->get('start') ? (int)request()->get('start') : 0;
        $output = request()->get('output', '');
        $userId = Auth::id();

        // ===================================================================
        // LOGIKA TIMER BARU YANG LEBIH KUAT
        // ===================================================================

        // Langkah A: "Bersihkan" Sesi Lama yang Menggantung
        // Cari sesi untuk materi ini yang belum ditutup dari kunjungan terakhir.
        $orphanedSession = DB::table('react_topics_detail_time')
            ->where('user_id', $userId)
            ->where('react_topics_detail_id', $phpid)
            ->whereNull('end_time')
            ->first();

        // Jika ada sesi yang menggantung, kita tutup sekarang.
        // Kita anggap waktu berakhirnya adalah sama dengan waktu pembuatannya,
        // agar waktu idle tidak ikut terhitung.
        if ($orphanedSession) {
            DB::table('react_topics_detail_time')
                ->where('id', $orphanedSession->id)
                ->update(['end_time' => $orphanedSession->created_at]);
        }

        // Langkah B: Hitung total waktu dari SEMUA sesi yang sudah selesai.
        // Karena sesi yang menggantung sudah kita "bersihkan", semua sesi sekarang sudah lengkap.
        $totalSeconds = 0;
        $allCompletedSessions = DB::table('react_topics_detail_time')
            ->where('user_id', $userId)
            ->where('react_topics_detail_id', $phpid)
            ->get();

        foreach ($allCompletedSessions as $session) {
            $startTime = new Carbon($session->start_time);
            $endTime = new Carbon($session->end_time);
            $totalSeconds += $startTime->diffInSeconds($endTime);
        }

        // Langkah C: Buat Sesi BARU untuk kunjungan saat ini
        // Cek dulu status enrollment
        $enrollment = \App\Models\React\ReactUserEnroll::firstOrCreate(
            ['id_users' => $userId, 'php_topics_detail_id' => $phpid]
        );

        // Jika materi belum selesai, buat sesi baru yang aktif.
        if ($enrollment->flag != 1) {
            DB::table('react_topics_detail_time')->insert([
                'user_id' => $userId,
                'react_topics_detail_id' => $phpid,
                'start_time' => now(),
                'end_time' => null, // Dibiarkan null karena ini sesi aktif
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // ===================================================================
        // AKHIR PERBAIKAN
        // ===================================================================

        // Bagian 3: Mengambil data untuk ditampilkan di view (kode Anda yang lain)
        $results = DB::table('react_topics_detail')->where('id', $phpid)->first();
        $html_start = '';
        $pdf_reader = 0;
        if ($results) {
            $html_start = empty($results->file_name) ? $results->description : $results->file_name;
            $pdf_reader = empty($results->file_name) ? 0 : 1;
        }

        $topics = \App\Models\React\ReactTopic::all();
        $detail = \App\Models\React\ReactTopic::find($start);
        $topic_tasks = \App\Models\React\ReactTask::where('id_topics', $phpid)->get();

        $completedTasksCount = \App\Models\React\ReactSubmitUser::where('id_user', $userId)
            ->whereHas('reactTask', function ($query) use ($phpid) {
                $query->where('id_topics', $phpid);
            })
            ->where('status', 'Benar')
            ->distinct('task_id')
            ->count('task_id');

        $progress = (count($topic_tasks) > 0) ? ($completedTasksCount / count($topic_tasks)) * 100 : 0;

        $uncompletedTasks = \App\Models\React\ReactTask::where('id_topics', $phpid)
            ->whereDoesntHave('react_submit_user', function ($query) use ($userId) {
                $query->where('id_user', $userId)->where('status', 'Benar');
            })->get();


        return view('react.student.material.topics_detail', [
            'row' => $detail,
            'tasks' => $uncompletedTasks,
            'topics' => $topics,
            'phpid' => $phpid,
            'html_start' => $html_start,
            'pdf_reader' => $pdf_reader,
            'topicsCount' => $topics->count(),
            'detailCount' => $topic_tasks->count(),
            'output' => $output,
            'flag' => $enrollment->flag,
            'role' => Auth::user()->role,
            'progress' => round($progress, 0),
            'total_time_in_seconds' => $totalSeconds,
        ]);
    }


    function html_start()
    {
        $html = "<div style='text-align:center;font-size:18px'><em>Modul kelas Belajar Pengembangan Aplikasi Android Intermediate dalam bentuk cetak (buku) maupun elektronik sudah didaftarkan ke Dirjen HKI, Kemenkumham RI. Segala bentuk penggandaan dan atau komersialisasi, sebagian atau seluruh bagian, baik cetak maupun elektronik terhadap modul kelas <em>Belajar Pengembangan Aplikasi Android Intermediate</em> tanpa izin formal tertulis kepada pemilik hak cipta akan diproses melalui jalur hukum.</em></div>";
        return $html;
    }
    function html_persyaratan($desc, $pdf_reader)
    {
        $html = $desc;
        return $html;
    }

    public function upload(Request $request)
    {
        if ($request->hasFile('upload')) {
            $originName = $request->file('upload')->getClientOriginalName();
            $fileName = pathinfo($originName, PATHINFO_FILENAME);
            $extension = $request->file('upload')->getClientOriginalExtension();
            $fileName = $fileName . '_' . time() . '.' . $extension;

            $request->file('upload')->move(public_path('media'), $fileName);

            $url = asset('media/' . $fileName);

            return response()->json(['fileName' => $fileName, 'uploaded' => 1, 'url' => $url]);
        }
    }

    function send_task()
    {
        $phpid  = isset($_GET['phpid']) ? $_GET['phpid'] : '';
        $task   = isset($_GET['task']) ? $_GET['task'] : '';
        $output = isset($_GET['output']) ? $_GET['output'] : '';

        $task_db = DB::table('php_task')
            ->where('react_topic_id', $phpid)
            ->where('id', $task)
            ->first();

        if ($task_db->id == $task) {
            $html_start = $this->html_task();
        } else {
            $html_start = "";
        }

        $pdf_reader = 0;
        $topics = Topic::all();
        $detail = Topic::findorfail($phpid);
        $topicsCount = count($topics);
        $persen = ($topicsCount / $topicsCount) * 10;
        session(['params' => $persen]);

        return view('php.student.material.topics_detail', [
            'row'        => $detail,
            'topics'     => $topics,
            'phpid'      => $phpid,
            'html_start' => $html_start,
            'pdf_reader' => $pdf_reader,
            'detailCount' => $persen,
            'output'     => $output,
        ]);
    }
    function html_task()
    {
        return view('php.student.task.form_submission_task', []);
    }
    function php_admin()
    {
        return view('php.admin.material.upload_materi', []);
    }

    function task_submission(Request $request)
    {
        $phpid = (int)$request->get('phpid');
        $start = (int)$request->get('start');

        $this->validate($request, [
            'file' => 'required',

        ]);

        $file = $request->file('file');

        $file_name = Auth::user()->name . '_' . $file->getClientOriginalName();

        Storage::disk('public')->makeDirectory('private/' . Auth::user()->name);
        Storage::disk('public')->put('/private/' . Auth::user()->name . '/' . $file_name, File::get($file));
        $userName = Auth::user()->name;
        Session::put('user_name', $userName);
        $user_name = Session::get('user_name');
        $name = Session::put('ori_file_name', $file_name);

        $path = storage_path("app/private/{$userName}/{$file_name}");
        Session::put('path', $path);

        $val = session('key');

        $phpunitExecutable  = base_path('vendor/bin/phpunit');

        Storage::disk('local')->put('/private/testingunit/testingunit.php', File::get($file));
        if ($start == 43) {
            $unitTest           = base_path('tests/CreateDatabase.php');
        } else if ($start == 42) {
            $unitTest           = base_path('tests/CheckConnection.php');
        } else if ($start == 44) {
            $unitTest           = base_path('tests/CreateTable.php');
        } else if ($start == 45) {
            $unitTest           = base_path('tests/CreateTableGuru.php');
        } else if ($start == 46) {
            $unitTest           = base_path('tests/CheckInsert.php');
        } else if ($start == 47) {
            $unitTest           = base_path('tests/CheckInsertGuru.php');
        } else if ($start == 48) {
            $unitTest           = base_path('tests/CheckInsertHtml.php');
        } else if ($start == 49) {
            $unitTest           = base_path('tests/CheckInsertHtmlGuru.php');
        } else if ($start == 50) {
            $unitTest           = base_path('tests/CheckSelectHtml.php');
        } else if ($start == 51) {
            $unitTest           = base_path('tests/CheckSelectHtmlGuru.php');
        } else if ($start == 52) {
            $unitTest           = base_path('tests/CheckUpdateHtml.php');
        } else if ($start == 53) {
            $unitTest           = base_path('tests/CheckUpdateHtmlGuru.php');
        } else if ($start == 54) {
            $unitTest           = base_path('tests/CheckDeleteHtml.php');
        } else if ($start == 55) {
            $unitTest           = base_path('tests/CheckDeleteHtmlGuru.php');
        }

        $output = [];
        $returnVar = 0;

        exec("$phpunitExecutable $unitTest", $output, $returnVar);
        Storage::deleteDirectory('/private/testingunit');

        $outputString  = "<br>PHPUnit Output: <br>";
        $outputString .= implode("<br>", $output) . "<br>";
        $outputString .= "Return Code: $returnVar<br>";

        $idUser     = Auth::user()->id;
        $pathuser   = 'storage/private/' . $userName . '/' . $file_name . '';

        $flag       = $returnVar == 0 ? 'true' : 'false';

        DB::insert("INSERT INTO php_user_submits(userid, path, flag, php_id, php_id_topic) values ('$idUser', '$pathuser', '$flag', $phpid, $start)");

        return redirect('/php/detail-topics?phpid=' . $phpid . '&start=' . $start . '&output=' . $outputString . '');
    }

    function unittesting2()
    {
        $val = session('key');
        DB::select("TRUNCATE TABLE php_user_submits");
        DB::insert("insert into php_user_submits(userid) values ('$val')");

        $path_test = base_path("phpunit.xml");
        $path = base_path("vendor\bin\phpunit -c $path_test");
        $output = shell_exec($path);

        $string  = htmlentities($output);
        $string = str_replace("\n", ' ', $string);

        $pattern = '/PHPUnit\s+(\d+\.\d+\.\d+).*Runtime:\s+PHP\s+(\d+\.\d+\.\d+).*Time:\s+(\d+:\d+\.\d+),\s+Memory:\s+(\d+\.\d+)\s+MB\s+OK\s+\((\d+)\stests,\s+(\d+)\sassertions\)/';

        if (preg_match($pattern, $string, $matches)) {
            $phpUnitVersion  = $matches[1];
            $phpVersion      = $matches[2];
            $executionTime   = $matches[3];
            $memoryUsage     = $matches[4];
            $numTests        = $matches[5];
            $numAssertions   = $matches[6];

            echo "PHPUnit version: $phpUnitVersion <br />";
            echo "PHP version: $phpVersion <br />";
            echo "Execution time: $executionTime <br />";
            echo "Memory usage: $memoryUsage MB <br />";
            echo "Number of tests: $numTests <br />";
            echo "Number of assertions: $numAssertions <br />";

            $ok_position = strpos($string, 'OK');
            if ($ok_position !== false) {
                $ok_part = substr($string, $ok_position);
                echo "Tests Run : " . $ok_part;
            }
        } else {

            $string = json_encode($output);
            $text = str_replace("\n", ' ', $output);
            $pattern_phpunit_version = '/PHPUnit\s+(\d+\.\d+\.\d+)/';
            $pattern_php_runtime = '/Runtime:\s+PHP\s+([\d.]+)/';
            $pattern_configuration = '/Configuration:\s+(.+)/';
            $pattern_failure_count = '/There was (\d+) failure/';
            $pattern_failure_test_case = '/Failed asserting that \'(.*?)\' contains \'(.*?)\'./';
            $pattern_failure_location = '/(C:\\\\.*?\\.php):(\d+)/';

            preg_match($pattern_phpunit_version, $text, $matches_phpunit_version);
            preg_match($pattern_php_runtime, $text, $matches_php_runtime);
            preg_match($pattern_configuration, $text, $matches_configuration);
            preg_match($pattern_failure_count, $text, $matches_failure_count);
            preg_match($pattern_failure_test_case, $text, $matches_failure_test_case);
            preg_match($pattern_failure_location, $text, $matches_failure_location);

            $phpunit_version = isset($matches_phpunit_version[1]) ? $matches_phpunit_version[1] : "Not found";
            $php_runtime = isset($matches_php_runtime[1]) ? $matches_php_runtime[1] : "Not found";
            $configuration_path = isset($matches_configuration[1]) ? $matches_configuration[1] : "Not found";
            $num_failures = isset($matches_failure_count[1]) ? $matches_failure_count[1] : "Not found";
            $failed_assertion = isset($matches_failure_test_case[1]) ? htmlspecialchars($matches_failure_test_case[1]) : "Not found";
            $expected_content = isset($matches_failure_test_case[2]) ? htmlspecialchars($matches_failure_test_case[2]) : "Not found";
            $failure_location = isset($matches_failure_location[1]) ? $matches_failure_location[1] : "Not found";
            $failure_line = isset($matches_failure_location[2]) ? $matches_failure_location[2] : "Not found";

            echo "PHPUnit version: $phpunit_version <br >";
            echo "PHP Runtime: $php_runtime <br >";
            echo "Configuration path: $configuration_path <br >";
            echo "Number of failures: $num_failures <br >";
            echo "Failed assertion: $failed_assertion <br >";
            echo "Expected content: $expected_content <br >";
            echo "Failure location: $failure_location <br >";
            echo "Failure line: $failure_line <br >";
        }
    }

    function unittesting()
    {
        $namaFile = 'febri syawaldi_CreateDB.php';
        $phpunitExecutable  = base_path('vendor/bin/phpunit');
        $unitTest           = base_path('tests/FileReadTest.php');

        $output = [];
        $returnVar = 0;
        exec("$phpunitExecutable $unitTest", $output, $returnVar);

        return response()->json($output);
    }

    function session_progress()
    {
        session(['params' => $_POST['params']]);
    }

    /**
     * Method baru untuk meng-update end_time saat user meninggalkan halaman.
     */
    public function pauseReactTimer(Request $request)
    {
        $userId = Auth::id();
        $topicId = $request->input('topic_id');

        // Cari sesi yang aktif (end_time is NULL) dan update
        DB::table('react_topics_detail_time') // <-- NAMA TABEL BARU
            ->where('user_id', $userId)
            ->where('react_topics_detail_id', $topicId)
            ->whereNull('end_time')
            ->update([
                'end_time' => now(),
                'updated_at' => now(),
            ]);

        return response()->json(['status' => 'success']);
    }
}
