<?php

namespace App\Models\React;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReactTaskSubmission extends Model
{
    use HasFactory;
    protected $table = 'react_submits_submission';
    protected $fillable = [
        'task_id',
        'username',
        'php_topic_id',
        'tipe',
        'userfile',
        'ket',
        'created_at',
        'updated_at',
    ];

    public function task()
    {
        return $this->belongsTo(ReactTask::class, 'task_id');
    }
}
