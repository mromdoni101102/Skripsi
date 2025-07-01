<?php

namespace App\Http\Controllers\React;

use Illuminate\Http\Request;
use App\Models\React\ReactTopic;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\React\ReactTopic_detail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\RedirectResponse;

class ReactDosenController extends Controller
{

    function topics()
    {
        $topics = ReactTopic::all();
        return view('react.teacher.topics', [
            'topics'  => $topics,
        ]);
    }

    function topic_detail_delete($id)
    {
        $topic_detail = ReactTopic_detail::where("id", $id)->first();

        Storage::delete($topic_detail->folder_path . '/' . $topic_detail->file_name);

        ReactTopic_detail::where('id', $id)->delete();
        return redirect()->back();
    }

    function delete($id)
    {
        $topik = ReactTopic::where("id", $id)->first();
        $directory_upload = "react/profile";

        if (!empty($topik->picturePath)) {

            unlink($directory_upload . '/' . $topik->picturePath);
        }

        ReactTopic::where('id', $id)->delete();
        return redirect('react/teacher/topics');
    }


    function add(Request $request)
    {

        $nama_file = "";
        $directory_upload = "react/profile";

        $direktori = 'react/document/' . $request->folder_path;
        if (!is_dir($direktori)) {

            mkdir($direktori);
        }


        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'folder_path' => 'required|string',
            'description' => 'nullable|string',
            'picturePath' => 'nullable|image|mimes:jpeg,jpg,png|max:4096',
            'status' => 'required|string|in:draft,publish',
        ]);


        if ($request->hasFile('picturePath')) {
            $file = $request->file('picturePath');
            $nama_file = time() . "_" . $file->getClientOriginalName();
            $file->storeAs($directory_upload, $nama_file, 'public');
        }

        $topic = new ReactTopic();
        $topic->title = $validatedData['title'];
        $topic->description = $validatedData['description'];
        $topic->folder_path = $validatedData['folder_path'];
        $topic->status = $validatedData['status'];

        $topic->picturePath = $nama_file;

        $topic->save();

        return redirect()->back()->with('message', 'Materi berhasil diperbarui.');
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'folder_path' => 'required|string|max:255',
            'description' => 'nullable|string',
            'picturePath' => 'nullable|image|mimes:jpeg,jpg,png|max:4096',
            'status' => 'required|string|in:draft,publish',
        ]);

        $topic = ReactTopic::findOrFail($id);
        $topic->title = $validatedData['title'];
        $topic->description = $validatedData['description'];
        $topic->folder_path = $validatedData['folder_path'];
        $topic->status = $validatedData['status'];

        $isSame = false;
        if ($request->hasFile('picturePath')) {
            $directory_upload = "react/profile";
            $existingFilePath = public_path($directory_upload . '/' . $topic->picturePath);
            if (file_exists($existingFilePath)) {
                $isSame = hash_file('sha256', $existingFilePath) === hash_file('sha256', $request->file('picturePath')->getRealPath());
                if (!$isSame) {
                    $file = $request->file('picturePath');
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs($directory_upload, $filename, 'public');
                    $topic->picturePath = $filename;
                }
            }
        }

        $topic->save();

        if ($isSame) {
            return redirect()->back()->with([
                'message' => 'Materi berhasil diperbarui.',
                'error' => 'Tidak bisa mengupload gambar yang sama!'
            ]);
        }
        return redirect()->back()->with('message', 'Materi berhasil diperbarui.');
    }


    public function add_topics(Request $request, $id)
    {
        $topic = \App\Models\React\ReactTopic::findOrFail($id)->load('details');

        $topicDetailIds = $topic->details->pluck('id');

        $submissions = DB::table('react_user_submits')
            ->join('users', 'react_user_submits.user_id', '=', 'users.id')
            ->join('react_topics_detail', 'react_user_submits.topics_id', '=', 'react_topics_detail.id')
            ->whereIn('react_user_submits.topics_id', $topicDetailIds)
            ->select(
                'react_user_submits.created_at as submission_time',
                'users.name as user_name',
                'react_topics_detail.title as topic_title',
                'react_user_submits.score'
            )
            ->orderBy('react_user_submits.created_at', 'desc')
            ->get();

        $topicFinished = DB::table('react_student_enroll')
            ->join('users', 'react_student_enroll.id_users', '=', 'users.id')
            ->join('react_topics_detail', 'react_student_enroll.php_topics_detail_id', '=', 'react_topics_detail.id')
            ->whereIn('react_student_enroll.php_topics_detail_id', $topicDetailIds)
            ->where('react_student_enroll.flag', true)
            ->select(
                'react_student_enroll.created_at as completion_date',
                'users.name as user_name',
                'react_topics_detail.title as topic_title'
            )
            ->orderBy('react_student_enroll.created_at', 'desc')
            ->get();

        $studentRanks = DB::table('react_student_rank')
            ->join('users', 'react_student_rank.id_user', '=', 'users.id')
            ->whereIn('react_student_rank.topics_id', $topicDetailIds)
            ->select(
                'users.name as user_name',
                'react_student_rank.best_score as perfect_scores'
            )
            ->orderBy('react_student_rank.best_score', 'desc')
            ->get();

        return view('react.teacher.topics_detail', [
            'hasil'         => $topic,
            'submissions'   => $submissions,
            'topicFinished' => $topicFinished,
            'studentRanks'  => $studentRanks,
        ]);
    }

    public function simpan(Request $request): RedirectResponse
    {

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'caption' => 'required|string|max:255',
            'editor' => 'required|string',
            'id' => 'required|int|max:11',
            'materials' => 'required|file|mimes:pdf|max:10240',
        ]);
        try {
            $topic = ReactTopic::findOrFail($validatedData['id']);

            $file = $request->file('materials');
            $originName = $file->getClientOriginalName();
            $fileNameWithoutExtension = pathinfo($originName, PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();

            $newFileName = str_replace(" ", '_', $fileNameWithoutExtension) . '_' . time() . '.' . $extension;

            $destinationPath = public_path('react/document/' . $topic->folder_path);

            $file->move($destinationPath, $newFileName);

            $filePathForDb = 'react/document/' . $topic->folder_path . '/' . $newFileName;

            ReactTopic_detail::create([
                'title' => $validatedData['title'],
                'react_topic_id' => $validatedData['id'],
                'controller' => $validatedData['caption'],
                'description' => $validatedData['editor'],
                'folder_path' => $filePathForDb,
                'file_name' => $newFileName,
                'status' => 'draft',
            ]);

            $id = $validatedData['id'];
            return redirect("/react/teacher/topics/add/{$id}")->with('message', 'Topik berhasil ditambahkan');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("ReactTopic with ID {$validatedData['id']} not found: " . $e->getMessage());
            return redirect()->back()->with('error', 'Topik tidak ditemukan.')->withInput();
        } catch (\Exception $e) {
            Log::error("Error saving ReactTopic_detail: " . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data.')->withInput();
        }
    }


    public function update_data(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'controller' => 'nullable|string|max:255',
                'status' => 'required|string|in:draft,publish',
            ]);
            $topicDetail = ReactTopic_detail::findOrFail($id);
            $topicDetail->title = $validatedData['title'];
            $topicDetail->description = $validatedData['description'];
            $topicDetail->controller = $validatedData['controller'];
            $topicDetail->status = $validatedData['status'];
            if ($request->filled('folder_path') && $request->input('folder_path') !== $topicDetail->folder_path) {
                $oldPath = public_path('react/document/' . $topicDetail->folder_path . '/' . $topicDetail->file_name);
                $newPathDir = public_path('react/document/' . $request->input('folder_path'));
                $newPath = public_path('react/document/' . $request->input('folder_path') . '/' . $topicDetail->file_name);

                if (Storage::exists(str_replace(public_path('/'), '', dirname($oldPath))) && !is_dir($newPathDir)) {
                    mkdir($newPathDir, 0755, true);
                }

                if (Storage::exists(str_replace(public_path('/'), '', $oldPath))) {
                    Storage::move(str_replace(public_path('/'), '', $oldPath), str_replace(public_path('/'), '', $newPath));
                    $topicDetail->folder_path = $request->input('folder_path');
                }
            }
            if ($request->hasFile('picturePath')) {
                $directory_upload = "react/profile";
                if (!empty($topicDetail->picturePath) && Storage::exists($directory_upload . '/' . $topicDetail->picturePath)) {
                    Storage::delete($directory_upload . '/' . $topicDetail->picturePath);
                }
                $file = $request->file('picturePath');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->storeAs($directory_upload, $filename, 'public');
                $topicDetail->picturePath = $filename;
            }
            $topicDetail->save();
            return Redirect::back()->with('message', 'Detail materi berhasil diperbarui!');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return Redirect::back()->with('error', 'Detail materi tidak ditemukan.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Redirect::back()->withErrors($e)->withInput();
        } catch (\Exception $e) {
            Log::error("Error updating ReactTopic_detail with ID {$id}: " . $e->getMessage());
            return Redirect::back()->with('error', 'Terjadi kesalahan saat memperbarui detail materi.');
        }
    }
}
