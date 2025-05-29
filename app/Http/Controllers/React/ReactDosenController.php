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
            'picturePath' => 'nullable|image|mimes:jpeg,jpg,png|max:4096', // max 4MB
            'status' => 'required|string|in:draft,publish', // draff
        ]);


        if ($request->hasFile('picturePath')) { // cek apakah ada gambar yang diupload waktu add materi baru
            // kalo ada, maka simpan di storage react/profile
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
            'picturePath' => 'nullable|image|mimes:jpeg,jpg,png|max:4096', // max 4MB
            'status' => 'required|string|in:draft,publish',
        ]);

        $topic = ReactTopic::findOrFail($id);
        $topic->title = $validatedData['title'];
        $topic->description = $validatedData['description'];
        $topic->folder_path = $validatedData['folder_path'];
        $topic->status = $validatedData['status'];

        $isSame = false;
        if ($request->hasFile('picturePath')) {  // cek apakah ada gambar baru yang diupload waktu update
            // kalo ada, cek apakah sama dengan yang ada di filesystem
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


    function add_topics(Request $request, $id)
    {
        $topic = ReactTopic::findOrFail($id)->load('details');
        return view('react.teacher.topics_detail', [
            'hasil'   => $topic,
        ]);
    }

    public function simpan(Request $request): RedirectResponse
    {
        // 1. Validasi Data Masukan
        // Menggunakan method validate() dari objek Request yang akan otomatis
        // mengembalikan error jika validasi gagal.
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'caption' => 'required|string|max:255',
            'editor' => 'required|string',
            'id' => 'required|int|max:11',
            'materials' => 'required|file|mimes:pdf|max:10240', // Menggunakan 'mimes:pdf' untuk validasi tipe file
        ]);

        // Catatan: Pengecekan 'if ($request->file('materials')->getClientOriginalExtension() !== 'pdf')'
        // bisa dihapus karena sudah dicover oleh 'mimes:pdf' di validasi.
        // Jika validasi 'mimes:pdf' gagal, Laravel akan otomatis mengarahkan kembali
        // dengan error yang sesuai.

        try {
            // 2. Mengambil informasi topik berdasarkan ID
            // Menggunakan find() karena 'id' adalah primary key.
            // findOrFail() akan melempar ModelNotFoundException jika tidak ditemukan.
            $topic = ReactTopic::findOrFail($validatedData['id']);

            // 3. Pengolahan Nama File dan Penyimpanan
            $file = $request->file('materials');
            $originName = $file->getClientOriginalName();
            $fileNameWithoutExtension = pathinfo($originName, PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();

            // Membuat nama file unik dengan timestamp dan mengganti spasi dengan underscore
            $newFileName = str_replace(" ", '_', $fileNameWithoutExtension) . '_' . time() . '.' . $extension;

            // Menentukan path penyimpanan di dalam direktori public
            // Pastikan direktori 'react/document/' dan sub-direktori '$topic->folder_path' sudah ada atau dibuat.
            $destinationPath = public_path('react/document/' . $topic->folder_path);

            // Memindahkan file ke lokasi tujuan
            $file->move($destinationPath, $newFileName);

            // Path lengkap file yang disimpan (relatif terhadap public_path)
            // Ini akan disimpan di database.
            $filePathForDb = 'react/document/' . $topic->folder_path . '/' . $newFileName;

            // 4. Membuat Record Detail Topik Baru
            ReactTopic_detail::create([
                'title' => $validatedData['title'],
                'react_topic_id' => $validatedData['id'],
                'controller' => $validatedData['caption'], // Pastikan nama kolom ini benar di DB
                'description' => $validatedData['editor'],
                'folder_path' => $filePathForDb, // Simpan path relatif untuk kemudahan akses
                'file_name' => $newFileName,
                'status' => 'draft',
            ]);

            // 5. Redirect dan Pemberitahuan Sukses
            $id = $validatedData['id'];
            // Disarankan menggunakan named routes untuk redirect agar lebih fleksibel
            // Contoh: return redirect()->route('teacher.topics.add', ['id' => $id])->with('message', 'Data Berhasil Diinputkan');
            // Jika belum ada named route, penggunaan helper global redirect() lebih umum:
            return redirect("/react/teacher/topics/add/{$id}")->with('message', 'Topik berhasil ditambahkan');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Tangani jika ReactTopic dengan ID yang diberikan tidak ditemukan
            Log::error("ReactTopic with ID {$validatedData['id']} not found: " . $e->getMessage());
            return redirect()->back()->with('error', 'Topik tidak ditemukan.')->withInput();
        } catch (\Exception $e) {
            // Tangani error umum lainnya (misalnya gagal move file, error database)
            Log::error("Error saving ReactTopic_detail: " . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data.')->withInput();
        }
    }


public function update_data(Request $request, $id)
{
    try {
        // 1. Validasi data yang masuk dari request
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'controller' => 'nullable|string|max:255', // Sesuai nama kolom di DB
            'status' => 'required|string|in:draft,publish',
            // 'folder_path' => 'required|string|max:255', // Mungkin tidak perlu diupdate di sini
            // 'picturePath' => 'nullable|image|mimes:jpeg,jpg,png|max:4096', // Jika ingin mengizinkan update gambar
            // 'file_name' => 'nullable|string|max:255', // Jika ingin mengizinkan update nama file
        ]);

        // 2. Temukan detail topik berdasarkan ID
        $topicDetail = ReactTopic_detail::findOrFail($id);

        // 3. Update atribut detail topik
        $topicDetail->title = $validatedData['title'];
        $topicDetail->description = $validatedData['description'];
        $topicDetail->controller = $validatedData['controller'];
        $topicDetail->status = $validatedData['status'];

        // 4. Penanganan perubahan folder_path (jika diperlukan)
        if ($request->filled('folder_path') && $request->input('folder_path') !== $topicDetail->folder_path) {
            // Lakukan logika pemindahan file jika diperlukan
            // Contoh sederhana (mungkin perlu penyesuaian):
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

        // 5. Penanganan update gambar (jika diperlukan)
        if ($request->hasFile('picturePath')) {
            $directory_upload = "react/profile";
            // Hapus gambar lama jika ada
            if (!empty($topicDetail->picturePath) && Storage::exists($directory_upload . '/' . $topicDetail->picturePath)) {
                Storage::delete($directory_upload . '/' . $topicDetail->picturePath);
            }
            // Simpan gambar baru
            $file = $request->file('picturePath');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs($directory_upload, $filename, 'public');
            $topicDetail->picturePath = $filename;
        }

        // 6. Penanganan update file (jika diperlukan)
        // Anda bisa menambahkan logika serupa untuk mengupdate file_name jika diperlukan
        // dengan menghapus file lama dan menyimpan file baru.

        // 7. Simpan perubahan ke database
        $topicDetail->save();

        // 8. Berikan respon sukses
        return response()->json([
            'message' => 'Detail materi berhasil diperbarui!',
            'data' => $topicDetail,
        ], 200);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'message' => 'Detail materi tidak ditemukan.',
        ], 404);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validasi data gagal.',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        Log::error("Error updating ReactTopic_detail with ID {$id}: " . $e->getMessage());
        return response()->json([
            'message' => 'Terjadi kesalahan saat memperbarui detail materi.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

}
