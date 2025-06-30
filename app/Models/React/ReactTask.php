<?php

namespace App\Models\React;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReactTask extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'react_task';

    protected $guarded = [];

    public function react_submit_user()
    {
        return $this->hasMany(ReactSubmitUser::class, 'task_id', 'id');
    }
}
