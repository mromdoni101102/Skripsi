<?php

namespace App\Models\React;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReactTopic_detail extends Model
{
    use SoftDeletes;

    protected $table = 'react_topics_detail'; // Sesuaikan dengan nama tabel di database
    protected $fillable = ['title', 'react_topic_id', 'controller', 'description', 'folder_path', 'file_name', 'status', 'picturePath', 'created_at', 'updated_at', 'deleted_at','flag'];


    // Relasi ke ReactTopic menggunakan belongsTo

    public function topic()
    {
        return $this->belongsTo(ReactTopic::class, 'react_topic_id');
    }

    public function user_enroll()
    {
        return $this->hasMany(ReactUserEnroll::class);
    }
}
