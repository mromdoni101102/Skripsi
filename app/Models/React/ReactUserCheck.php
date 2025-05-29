<?php

namespace App\Models\React;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReactUserCheck extends Model
{
    protected $table    = 'react_user_submits'; // Sesuaikan dengan nama tabel di database
    protected $fillable = ['topic_id', 'user_id', 'score', 'flag', 'created_at', 'updated_at'];
}
