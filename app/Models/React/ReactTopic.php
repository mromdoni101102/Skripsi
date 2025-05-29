<?php

namespace App\Models\React;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReactTopic extends Model
{
    use SoftDeletes;

    protected $table = 'react_topics'; // Sesuaikan dengan nama tabel di database

    protected $fillable = [
        'title',
        'description',
        'folder_path',
        'picturePath',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime', // optional but explicit
    ];

    public $timestamps = true;

    // Relasi untuk one-to-many ke file ReactTopic_detail

    public function details()
    {
        return $this->hasMany(ReactTopic_detail::class, 'react_topic_id');
    }
}
