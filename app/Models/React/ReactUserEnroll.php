<?php

namespace App\Models\React;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReactUserEnroll extends Model
{
    use HasFactory;

    protected $table = 'react_student_enroll';

    protected $fillable = [
        'id_users',
        'php_topics_detail_id',
        'created_at',
        // this new field is used to track if the user has completed the topic
        'flag', // boolean, default false
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'id_users');
    }

    public function reactTopicDetail()
    {
        return $this->belongsTo(ReactTopic_detail::class, 'php_topics_detail_id');

    }
}
