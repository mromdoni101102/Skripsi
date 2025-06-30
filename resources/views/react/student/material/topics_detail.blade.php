<!DOCTYPE html>
<html lang="en">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    <title>iCLOP</title>
    <link rel="icon" href="./images/logo.png" type="image/png">
    {{-- Semua style Anda saya biarkan utuh --}}
    <style>
        .text {
            font-family: 'Poppins', sans-serif;
            color: #3F3F46;
            text-decoration: none
        }

        .text-list {
            font-family: 'Poppins', sans-serif;
            color: #3F3F46;
        }

        .footer {
            background-color: #EAEAEA;
            color: #636363;
            text-align: center;
            padding: 10px 0;
            position: fixed;
            bottom: 0;
            width: 100%;
        }

        .sidebar {
            width: 250px;
            background-color: #ffffff;
            height: 100%;
            position: fixed;
            top: 0;
            right: 0;
            overflow-x: hidden;
            padding-top: 20px;
        }

        .dropdown {
            padding: 6px 8px;
            display: inline-block;
            cursor: pointer;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            min-width: 160px;
            box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
            z-index: 1;
        }

        .dropdown:hover .dropdown-content {
            display: block;
        }

        .list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .list-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border: 1px solid #E4E4E7;
            cursor: pointer;
            margin-bottom: 10px;
            border: none;
        }

        .list-item:hover {
            background-color: #F5F5F8;
        }

        .list-item-title {
            font-size: 18px;
            margin-left: 10px;
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
            font-size: 16px;
            color: #3F3F46;
        }

        .list-item-icon {
            font-size: 20px;
        }

        .expandable-content {
            margin-top: 0px;
            display: none;
            padding: 10px;
            border-top: 1px solid #E4E4E7;
            border: none;
            margin-left: 32px;
        }

        .radio-label {
            font-weight: bold;
            color: #333;
            font-size: 18px;
        }

        .progress-container {
            width: 100%;
            background-color: #f1f1f1;
        }

        .progress-bar {
            width: 40;
            height: 30px;
            background-color: #4caf50;
            text-align: center;
            line-height: 30px;
            color: white;
        }

        .progress-text {
            margin-top: 10px;
            font-size: 18px;
            text-align: center;
        }

        .text:hover {
            color: black;
            text-decoration: underline;
        }

        #outputDiv {
            background-color: #f4f4f4;
            border: 1px solid #ddd;
            padding: 20px;
            margin-top: 20px;
        }

        #outputDiv p {
            font-size: 16px;
            color: #333;
        }

        #outputDiv h3 {
            color: #0056b3;
        }

        @media only screen and (max-width: 600px) {
            #sidebar {
                display: none;
            }

            div[style*="max-width: 800px"] {
                max-width: 90%;
            }
        }
    </style>
</head>

<body>
    <!-- Navbar -->
    <nav class="navbar navbar-light bg-light"
        style="padding: 15px 20px; border-bottom: 1px solid #E4E4E7; font-family: 'Poppins', sans-serif;">
        <a class="navbar-brand" href="{{ route('react_welcome') }}">
            <img src="{{ asset('images/left-arrow.png') }}" style="height: 24px; margin-right: 10px;">
            {{ $row->title }}
        </a>
    </nav>

    <!-- Sidebar -->
    <div id="sidebar" class="sidebar"
        style="border-left: 1px solid #E4E4E7; padding: 20px; width: 100%; max-width: 400px;">
        <p class="text-list" style="font-size: 18px; font-weight: 600; font-size: 20px"><img
                src="{{ asset('images/right.png') }}"
                style="height: 24px; margin-right: 10px; border:1px solid; border-radius:50%"> Task List</p>

        @if ($role == 'student')
            <div class="progress-container">
                <div id="progressbar"></div>
            </div>
            <div id="progress">
                @php echo $progress.'%'; @endphp
            </div>
        @endif {{-- PERBAIKAN 1: Menambahkan @endif untuk role student --}}

        <ul class="list" style="margin-top: 20px">
            @foreach ($topics as $topic)
                @php
                    if ($topic->id == $_GET['phpid']) {
                        $display = 'display:block !important';
                        $transform = 'transform: rotate(180deg); !important';
                    } else {
                        $display = '';
                        $transform = '';
                    }

                    $row = DB::table('react_topics')
                        ->leftJoin('react_topics_detail', 'react_topics.id', '=', 'react_topics_detail.react_topic_id')
                        ->select('*')
                        ->where('react_topics_detail.react_topic_id', '=', $topic->id)
                        ->get();
                    $no = 1;
                @endphp
                @foreach ($row as $r)
                    @php
                        $no++;
                        $count_ = ($no / $detailCount) * 10;
                        $phpdid = isset($_GET['start']) ? $_GET['start'] : '';
                        if ($r->id == $phpdid and $r->react_topic_id == $_GET['phpid']) {
                            $active = 'color:#000; font-weight:bold; text-decoration: underline;';
                        } else {
                            $active = '';
                        }
                    @endphp
                    <li class="list-item">
                        <img class="list-item-icon" src="{{ asset('images/book.png') }}"
                            style="height: 24px; margin: 20px; @php echo $transform; @endphp">
                        <a class="text" style="{{ $active }};"
                            href="{{ route('react_material_detail') }}?phpid={{ $r->id }}&start={{ $topic->id }}"
                            id="requirement" onclick="updateProgress(@php echo $count_ @endphp)">{{ $r->description }}
                        </a>
                    </li>
                @endforeach
                <div style="@php echo $display; @endphp">
                    <div style="display: flex; flex-direction: column; align-items: left;">
                        @php
                            $top = $topic->id;
                            $task = DB::table('php_task')->where('id_topics', $top)->first();
                        @endphp
                        @if ($task)
                            @php
                                $tsk = $task->id;
                                $task_get = isset($_GET['task']) ? $_GET['task'] : '';
                                if ($tsk == $task_get) {
                                    $active_task = 'color:#000; font-weight:bold; text-decoration: underline;';
                                } else {
                                    $active_task = '';
                                }
                            @endphp
                            <div class="row">
                                <div class="col-sm-1">
                                    <label class="radio-label">
                                        <svg width="16" height="16" class="" viewBox="0 0 32 32"
                                            fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M15.9993 2.6665C8.63555 2.6665 2.66602 8.63604 2.66602 15.9998C2.66602 23.3636 8.63555 29.3332 15.9993 29.3332C23.3631 29.3332 29.3327 23.3636 29.3327 15.9998C29.3327 8.63604 23.3631 2.6665 15.9993 2.6665ZM5.33268 15.9998C5.33268 10.1088 10.1083 5.33317 15.9993 5.33317C21.8904 5.33317 26.666 10.1088 26.666 15.9998C26.666 21.8909 21.8904 26.6665 15.9993 26.6665C10.1083 26.6665 5.33268 21.8909 5.33268 15.9998Z"
                                                fill="#71717A"></path>
                                        </svg>
                                    </label>
                                </div>
                                <div class="col" style="padding-bottom: 1rem;">
                                    <a class="text" onclick="updateProgress(@php echo $count_ @endphp)"
                                        style="{{ $active_task }}"
                                        href="{{ route('send_task') }}?phpid={{ $topic->id }}&task={{ $task->id }}"
                                        id="requirement">{{ $task->task_name }} </a>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
        </ul>
        <br><br>
    </div>

    <div style="padding: 20px; max-width: 68%; margin-left:5px;">
        <div style="border: 1px solid #ccc; padding: 20px 10px 10px 30px; border-radius: 5px;margin-bottom:40px">

            {{-- PERBAIKAN 2: Menggunakan Blade @if standar, bukan PHP --}}
            @if ($pdf_reader == 0)
                {!! $html_start !!}
            @else
                <iframe src="{{ asset('react/document/' . $html_start) }}" style="width: 100%; height: 510px"></iframe>
            @endif

        </div>
    </div>

    @if ($role == ' ')
        <div style="padding: 20px; max-width: 68%; margin-left:5px;">
            <div style="border: 1px solid #ccc; padding: 20px 10px 10px 30px; border-radius: 5px;margin-bottom:40px">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Download File</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($listTask as $item)
                            <tr>
                                <td>{{ $item->name }}</td>
                                <td>{{ $item->flag }}</td>
                                <td><a href="{{ asset($item->path) }}" download="" class="btn btn-primary">Download
                                        Faile</a></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    @else
    @endif

    @if (isset($flag) && $flag == 0)

        <div class="tasks-container" style="padding: 0px 20px; max-width: 68%; margin-left:5px;">

            {{--
            Use @forelse to handle the loop and the empty case cleanly.
            The loop will only run if $tasks is not null and not empty.
        --}}
            @forelse ($tasks as $task)
                {{-- This heading now only shows if there are actual tasks to display --}}
                @if ($loop->first)
                    <h3>Tugas Praktik untuk Materi Ini:</h3>
                @endif

                <div class="card mb-4">
                    <div class="card-body">
                        <h4 class="card-title">{{ $task->task_name }}</h4>
                        <hr>

                        {{--
                        The form correctly points to the upload route and has a unique ID.
                        This is essential for any JavaScript that might target a specific form.
                    --}}
                        <form id="form-task-{{ $task->id }}" class="task-form" method="POST"
                            action="{{ route('upload_file') }}" enctype="multipart/form-data">
                            @csrf
                            <input type="hidden" name="task_id" value="{{ $task->id }}">

                            <div class="d-flex align-items-center mt-3">
                                <div class="col-md-8">
                                    <div class="form-group">
                                        <label class="mb-2" for="file-{{ $task->id }}">Upload File Jawaban
                                            (.js)
                                        </label>

                                        {{-- The input 'id' matches the label 'for', which is correct. --}}
                                        <input type="file" name="uploadFile" id="file-{{ $task->id }}"
                                            class="form-control" required>
                                    </div>
                                </div>
                                <div class="col-md-4 ms-3">
                                    <button type="submit" class="btn btn-success mt-4">Kumpulkan dan Nilai</button>
                                </div>
                            </div>

                            {{-- A unique container for status messages for this specific task --}}
                            @if (session('score') && session('task_id') == $task->id)
                                <div class="alert {{ session('is_success') ? 'alert-success' : 'alert-warning' }}">
                                    <h4>{{ session('message') }}</h4>
                                    <p class="mb-1">Skor Anda: <strong>{{ session('score') }}</strong></p>
                                    <hr>
                                    <h5 class="mt-3">Rincian Penilaian:</h5>
                                    <ul class="list-group">
                                        @foreach (session('feedback') as $item)
                                            <li
                                                class="list-group-item {{ $item['status'] === 'passed' ? 'list-group-item-success' : 'list-group-item-danger' }}">
                                                <strong>{{ $item['status'] === 'passed' ? '✓' : '✗' }}</strong>
                                                {{ $item['title'] }}
                                            </li>
                                            @if ($item['status'] === 'failed' && isset($item['errorMessage']))
                                                <li class="list-group-item list-group-item-light small">
                                                    <pre class="mb-0">{{ $item['errorMessage'] }}</pre>
                                                </li>
                                            @endif
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                        </form>
                    </div>
                </div>
            @empty
                {{-- This block runs if $tasks is empty or not set --}}
                <div style="padding: 0px 20px; max-width: 68%; margin-left:5px; margin-bottom: 50px;">
                    <div class="alert alert-success">
                        <h4>Perhatian!</h4>
                        <p>Anda Sudah Menyelesaikan Semua Tugas untuk Materi ini.</p>
                    </div>
                </div>
            @endforelse
        </div>
    @else
        {{--
        This is the 'else' for the main "@if ($flag == 1)" check.
        It shows if the user does not have access to the assignments for this material.
        Note: You might want to hide this completely if the user shouldn't know that tasks exist.
    --}}
        <div style="padding: 0px 20px; max-width: 68%; margin-left:5px; margin-bottom: 50px;">
            <div class="alert alert-warning">
                <h4>Perhatian!</h4>
                <p>Anda tidak memiliki akses untuk mengerjakan tugas pada materi ini.</p>
                <p>Silakan hubungi instruktur Anda untuk informasi lebih lanjut.</p>
            </div>
        </div>

    @endif


    <!-- Footer -->
    <footer class="footer">
        © 2023 Your Website. All rights reserved.
    </footer>

    <script src="https://cdn.ckeditor.com/ckeditor5/34.2.0/classic/ckeditor.js"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

    <script>
        // Fungsi-fungsi ini untuk progress bar, sidebar, dll.
        // ======================================================================

        function updateProgress(params) {

            function updateProgress(params) {

                var csrfToken = $('meta[name="csrf-token"]').attr('content');

                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    }
                });
                type: "POST",
                    $.ajax({
                        type: "POST",
                        url: "{{ Route('session_progress') }}",
                        data: {
                            params: params
                        },
                        success: function(response) {
                            // Jika Anda punya progress bar visual, update di sini
                            // Contoh: $('#progressbar').css('width', params + '%');
                        }
                    });
            }
        });
        }

        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
            sidebar.classList.toggle("active");
        }
        }

        function toggleItem(item) {
            // Fungsi untuk membuka/menutup daftar materi di sidebar
            const content = item.nextElementSibling;
            const icon = item.querySelector('.list-item-icon');
            if (content) {
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
            if (icon) {
                icon.style.transform = content.style.display === 'block' ? 'rotate(180deg)' : 'none';
            }
        }


        // ======================================================================
        // BAGIAN 2: KODE BARU UNTUK MENANGANI SEMUA FORM TUGAS
        // ======================================================================
        document.addEventListener('DOMContentLoaded', function() {
            // Cari SEMUA form yang memiliki class 'task-form'
            const allTaskForms = document.querySelectorAll('.task-form');

            allTaskForms.forEach(form => {
                form.addEventListener('submit', function(event) {
                    // Mencegah halaman me-reload
                    event.preventDefault();

                    // Dapatkan elemen-elemen penting dari form SPESIFIK yang di-submit ini
                    const taskId = form.querySelector('input[name="task_id"]').value;
                    const notificationDiv = document.getElementById(`notification-${taskId}`);
                    const fileInput = form.querySelector('input[name="uploadFile"]');

                    // Tampilkan pesan "loading"
                    notificationDiv.innerHTML =
                        `<div class="alert alert-info">Sedang menilai, mohon tunggu...</div>`;

                    // Submit form
                    form.submit();
                    // Buat FormData secara manual untuk memastikan task_id terkirim
                    // const manualFormData = new FormData();
                    // manualFormData.append('task_id', taskId);

                    // if (fileInput.files.length > 0) {
                    //     manualFormData.append('uploadFile', fileInput.files[0]);
                    // } else {
                    //     notificationDiv.innerHTML =
                    //         `<div class="alert alert-danger"><h4>Validasi Gagal!</h4><p>Anda harus memilih file untuk di-upload.</p></div>`;
                    //     return;
                    // }

                    // Kirim data ke Controller
                    //     fetch('{{ route('upload_file') }}', {
                    //             method: 'POST',
                    //             body: manualFormData,
                    //             headers: {
                    //                 'X-CSRF-TOKEN': document.querySelector(
                    //                     'meta[name="csrf-token"]').getAttribute('content'),
                    //                 'X-Requested-With': 'XMLHttpRequest',
                    //             },
                    //         })
                    //         .then(response => response.json().then(data => ({
                    //             status: response.status,
                    //             body: data
                    //         })))
                    //         .then(({
                    //             status,
                    //             body
                    //         }) => {
                    //             let resultHTML = '';
                    //             if (status === 200 && body.success) {
                    //                 const alertClass = body.score === 100 ? 'alert-success' :
                    //                     'alert-warning';
                    //                 resultHTML =
                    //                     `<div class="alert ${alertClass}"><h4>${body.message}</h4><p class="mb-1">Skor Anda: <strong>${body.score}</strong></p><hr><h5 class="mt-3">Rincian Penilaian:</h5><ul class="list-group">`;
                    //                 body.feedback.forEach(item => {
                    //                     const statusIcon = item.status === 'passed' ? '✓' :
                    //                         '✗';
                    //                     const itemClass = item.status === 'passed' ?
                    //                         'list-group-item-success' :
                    //                         'list-group-item-danger';
                    //                     resultHTML +=
                    //                         `<li class="list-group-item ${itemClass}"><strong>${statusIcon}</strong> ${item.title}</li>`;
                    //                     if (item.status === 'failed' && item.errorMessage) {
                    //                         resultHTML +=
                    //                             `<li class="list-group-item list-group-item-light small" style="background-color: #f8f9fa;"><pre class="mb-0" style="white-space: pre-wrap; word-break: break-all;"><code>${item.errorMessage}</code></pre></li>`;
                    //                     }
                    //                 });
                    //                 resultHTML += `</ul></div>`;
                    //             } else {
                    //                 let errorTitle = body.error || 'Error';
                    //                 let errorMessage = body.message ||
                    //                     'Terjadi kesalahan tidak terduga.';
                    //                 if (status === 422 && body.errors) {
                    //                     errorTitle = 'Validasi Gagal!';
                    //                     errorMessage = '<ul class="mb-0">';
                    //                     for (const key in body.errors) {
                    //                         body.errors[key].forEach(message => {
                    //                             errorMessage += `<li>${message}</li>`;
                    //                         });
                    //                     }
                    //                     errorMessage += '</ul>';
                    //                 }
                    //                 resultHTML =
                    //                     `<div class="alert alert-danger"><h4>${errorTitle}</h4><div>${errorMessage}</div>`;
                    //                 if (body.details) {
                    //                     resultHTML +=
                    //                         `<hr><h6 class="mt-3">Detail Teknis (Petunjuk Error):</h6><pre class="mb-0" style="white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto;"><code>${body.details}</code></pre>`;
                    //                 }
                    //                 resultHTML += `</div>`;
                    //                 console.error('Server Response:', body);
                    //             }

                    //             notificationDiv.innerHTML = resultHTML;
                    //         })
                    //         .catch(error => {
                    //             notificationDiv.innerHTML =
                    //                 `<div class="alert alert-danger">Tidak bisa terhubung ke server. Periksa koneksi internet Anda.</div>`;
                    //             console.error('Fetch/Network Error:', error);
                    //         });
                });
            });
        }); <
        />
    </script>
</body>

</html>
