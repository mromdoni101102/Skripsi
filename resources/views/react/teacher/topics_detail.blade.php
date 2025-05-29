@extends('php/teacher/home')
@section('content')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">

                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="#">Home</a></li>
                        <li class="breadcrumb-item active">Dashboard v1</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>


    <section class="content">
        <div class="container-fluid">
            <div class="row">

                <div class="col-md-12">
                    <div class="card card-body">

                        <div class="row">
                            <div class="col-md-9">
                                <p style="margin: 0px; font-size:13px"><b>Learning Topik yang diubah</b></p>
                                <h2>{{ $hasil->title }}</h2>
                            </div>
                            <div class="col-md-3">
                                <a class="btn btn-primary btn-sm pulse" data-toggle="modal" data-target="#exampleModal"
                                    style="color:#fff">
                                    <i class="fas fa-key" style="margin-right: 5px;color:#fff"></i> <!-- Ikon kunci -->
                                    Tambah Materi
                                </a>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <hr>

                            </div>


                            <div class="col-md-12">
                                @if (session('message'))
                                    <div class="alert alert-success">
                                        {{ session('message') }}
                                    </div>
                                @endif
                                @if (session('error'))
                                    <div class="alert alert-danger">
                                        {{ session('error') }}
                                    </div>
                                @endif
                                <table class="table" style="width: 100%; font-size: 14px" id="myTable">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Judul Materi</th>
                                            <th>Status</th>
                                            <th class="text-center">Caption</th>
                                            <th>File</th>
                                            <th>Opsi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($hasil->details as $key => $topic)
                                            <tr>
                                                <td>{{ $key }}</td>
                                                <td>{{ $topic->title }}</td>
                                                <td>
                                                    <span class="badge badge-secondary">{{ $topic->status }}</span>
                                                </td>
                                                <td class="text-center">
                                                    {{ $topic->description }} {{-- // Tambahan --}}
                                                </td>

                                                <td>
                                                    @if ($topic->file_name)
                                                        <a href="{{ asset('storage/' . $topic->file_name) }}" download>
                                                            {{ $topic->file_name }}
                                                        </a>
                                                    @else
                                                        Tidak ada file
                                                    @endif
                                                </td>




                                                <td class="text-left" style="white-space: nowrap;">
                                                    {{-- Button edit --}}
                                                    <a href="#" class="btn btn-sm btn-outline-primary me-2"
                                                        data-toggle="modal" data-target="#modal-update-{{ $topic->id }}">
                                                        <i class="fas fa-edit"></i>
                                                    </a>

                                                    {{-- Button delete --}}
                                                    <form method="post"
                                                        action="/react/teacher/topic-detail/delete/{{ $topic->id }}"
                                                        style="display: inline;">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button style="font-size: 10px"
                                                            onclick="event.preventDefault(); if(confirm('Apakah anda ingin menghapus topik ini?')) { this.closest('form').submit(); }"
                                                            class="btn btn-sm btn-outline-danger">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </form>
                                                </td>

                                            </tr>

                                            {{-- <!-- Modal Edit --> --}}

                                            <div class="modal fade" id="modal-update-{{ $topic->id }}" tabindex="-1"
                                                role="dialog" aria-labelledby="modalUpdateLabel-{{ $topic->id }}"
                                                aria-hidden="true">
                                                <div class="modal-dialog" role="document" style="max-width: 80%;">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title">Edit Materi</h5>
                                                            <button type="button" class="close" data-dismiss="modal"
                                                                aria-label="Close">
                                                                <span aria-hidden="true">&times;</span>
                                                            </button>
                                                        </div>
                                                        <form method="POST"
                                                            action="{{ route('react_teacher_update_data_topic', $topic->id) }}"
                                                            enctype="multipart/form-data">
                                                            @csrf
                                                            <div class="modal-body">
                                                                <div class="form-group">
                                                                    <label>Judul Materi</label>
                                                                    <input type="text" name="title"
                                                                        class="form-control" value="{{ $topic->title }}"
                                                                        required>
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Caption</label>
                                                                    <input type="text" name="controller"
                                                                        class="form-control"
                                                                        value="{{ $topic->controller }}">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Keterangan Materi</label>
                                                                    <textarea id="editor-{{ $topic->id }}" name="description" class="form-control">{{ $topic->description }}</textarea>
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Status</label>
                                                                    <select name="status" class="form-control" required>
                                                                        <option value="draft"
                                                                            {{ $topic->status === 'draft' ? 'selected' : '' }}>
                                                                            Draft
                                                                        </option>
                                                                        <option value="publish"
                                                                            {{ $topic->status === 'publish' ? 'selected' : '' }}>
                                                                            Publish</option>
                                                                    </select>
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Path Folder (Jika ingin diubah)</label>
                                                                    <input type="text" name="folder_path"
                                                                        class="form-control"
                                                                        value="{{ $topic->folder_path }}">
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Upload Gambar Baru (jika ingin mengganti)</label>
                                                                    <input type="file" name="picturePath"
                                                                        class="form-control">
                                                                    @if ($topic->picturePath)
                                                                        <small class="form-text text-muted">Gambar saat
                                                                            ini:
                                                                            {{ basename($topic->picturePath) }}</small>
                                                                    @endif
                                                                </div>
                                                                <div class="form-group">
                                                                    <label>Upload Materi Baru (jika ingin mengganti)</label>
                                                                    <input type="file" name="materials"
                                                                        class="form-control">
                                                                    @if ($topic->file_name)
                                                                        <small class="form-text text-muted">File saat ini:
                                                                            {{ basename($topic->file_name) }}</small>
                                                                    @endif
                                                                </div>
                                                            </div>
                                                            <div class="modal-footer">
                                                                <button type="submit" class="btn btn-primary">
                                                                    <i class="fas fa-save"
                                                                        style="margin-right: 5px;"></i>Simpan Perubahan
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {{-- modal tambah data baru --}}

        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
            aria-hidden="true">
            <div class="modal-dialog" role="document" style="max-width: 80%;" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Tambah Materi Baru</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form method="POST" action="{{ url('react/teacher/topics/simpan') }}"
                        enctype="multipart/form-data">
                        @csrf

                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-12">

                                    <div class="form-group" style="margin-bottom: 20px;">
                                        <input type="hidden" name="id" class='form-control'
                                            value='{{ $hasil->id }}' placeholder="Tittle" />
                                        <input type="text" name="title" class='form-control'
                                            placeholder="Tittle" />
                                    </div>
                                    <div class="form-group" style="margin-bottom: 20px;">
                                        <input type="text" name="caption" class='form-control'
                                            placeholder="Caption" />
                                    </div>
                                    <div class="form-group">
                                        <textarea id="myeditorinstance" name="editor" placeholder="Keterangan Materi"></textarea>

                                        <!-- <textarea id="myeditorinstance" name="editor"></textarea> -->
                                    </div>
                                    <div class="form-group" style="margin-bottom: 20px;">
                                        <label>Upload Materi</label>
                                        <input type="file" name="materials" class='form-control' />
                                    </div>


                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary" style="margin-left: 10px; width: 160px;">
                                    <i class="fas fa-key" style="margin-right: 5px;"></i>Simpan Materi
                                </button>
                            </div>
                        </div>
                    </form>


                </div>
            </div>



    </section>
@endsection
