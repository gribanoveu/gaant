import React from 'react';
import { Edit2, GripVertical } from 'lucide-react';

const TaskListItem = ({
  task,
  isEditing,
  taskHeight,
  dateRangeLabel,
  workingDaysCount,
  dropIndicator,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => (
  <div
    className={`border-b hover:bg-gray-50 flex items-center px-4 cursor-pointer relative group ${
      isEditing ? 'bg-blue-50 border-blue-200' : ''
    }`}
    style={{ height: taskHeight, minHeight: taskHeight }}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onDragEnd={onDragEnd}
    onClick={onClick}>
    {dropIndicator === 'before' && (
      <div className="absolute left-0 right-0 top-0 h-1 bg-blue-500 rounded-full pointer-events-none" />
    )}
    {dropIndicator === 'after' && (
      <div className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 rounded-full pointer-events-none" />
    )}

    <div
      draggable
      aria-label={`Перетащить задачу ${task.name}`}
      className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDragStart={onDragStart}>
      <GripVertical size={18} />
    </div>

    <div className="flex-1 min-w-0 pr-8">
      <div className="font-medium text-gray-800 mb-1 truncate" title={task.name}>
        {task.name}
      </div>
      <div className="text-sm text-gray-600 mb-1 truncate" title={`Исполнитель: ${task.assignee}`}>
        Исполнитель: {task.assignee}
      </div>
      <div className="text-xs text-gray-500 truncate" title={`${dateRangeLabel} (${task.duration} дн., ${workingDaysCount} рб.)`}>
        {dateRangeLabel}
        <span className="ml-2">
          ({task.duration} дн., {workingDaysCount} рб.)
        </span>
      </div>
    </div>

    <div className="opacity-0 group-hover:opacity-100 absolute right-4 flex items-center">
      <Edit2 size={16} className="text-blue-500" />
    </div>
  </div>
);

export default TaskListItem;
