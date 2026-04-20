import React from 'react';
import TaskListItem from './TaskListItem';
import { formatDate, getTaskEndDate } from '../../utils/date';

const TaskListPanel = ({
  tasks,
  editingTaskId,
  taskHeight,
  taskListRef,
  onScroll,
  onTaskClick,
  getWorkingDaysCount,
  rowDragState,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDrop,
  onTaskDragEnd,
}) => (
  <div className="w-80 bg-white border-r flex flex-col">
    <div className="px-4 py-3 border-b bg-gray-50">
      <h2 className="font-semibold text-gray-700 pb-2">Список задач</h2>
    </div>

    <div ref={taskListRef} className="flex-1 overflow-y-auto relative" onScroll={onScroll}>
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          isEditing={editingTaskId === task.id}
          taskHeight={taskHeight}
          dateRangeLabel={`${formatDate(task.startDate)} - ${formatDate(getTaskEndDate(task))}`}
          workingDaysCount={getWorkingDaysCount(task)}
          dropIndicator={rowDragState.overTaskId === task.id ? rowDragState.position : null}
          onClick={() => onTaskClick(task)}
          onDragStart={(event) => onTaskDragStart(event, task)}
          onDragOver={(event) => onTaskDragOver(event, task)}
          onDrop={(event) => onTaskDrop(event, task)}
          onDragEnd={onTaskDragEnd}
        />
      ))}
    </div>
  </div>
);

export default TaskListPanel;
