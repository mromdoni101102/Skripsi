<?php

namespace App\Models\React;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\React\ReactTopic_detail;

class ReactSubmitUser extends Model
{
    use HasFactory;

    protected $table = 'react_submit_user';

    protected $fillable = [
        'id_user',
        'nama_user',
        'materi',
        'task_id',
        'nilai',
        'status',
        'created_at',
        'updated_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function topicDetail()
    {
        return $this->belongsTo(ReactTopic_detail::class, 'topic_id');
    }

    public function reactTask()
    {
        return $this->belongsTo(ReactTask::class, 'task_id', 'id');
    }
}
