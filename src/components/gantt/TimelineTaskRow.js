import React from 'react';
import TaskSegment from './TaskSegment';

const TimelineTaskRow = ({ task, rowIndex, taskHeight, dayWidth, isEditing, taskDays, onTaskMouseDown }) => (
  <div className="relative">
    <div
      className="absolute border-b border-gray-100 hover:bg-gray-50"
      style={{
        top: rowIndex * taskHeight,
        left: 0,
        right: 0,
        height: taskHeight,
      }}
    />

    {taskDays.map((day, dayIndex) => (
      <TaskSegment
        key={`${task.id}-${dayIndex}`}
        task={task}
        day={day}
        dayIndex={dayIndex}
        taskDaysLength={taskDays.length}
        dayWidth={dayWidth}
        taskHeight={taskHeight}
        rowIndex={rowIndex}
        isEditing={isEditing}
        onMouseDown={onTaskMouseDown}
      />
    ))}
  </div>
);

export default TimelineTaskRow;
