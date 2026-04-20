import React from 'react';

const TaskSegment = ({ task, day, dayIndex, taskDaysLength, dayWidth, taskHeight, rowIndex, isEditing, onMouseDown }) => {
  const segmentLeft = day.index * dayWidth;
  const isFirstSegment = dayIndex === 0;
  const isLastSegment = dayIndex === taskDaysLength - 1;

  return (
    <div
      className={`absolute shadow-sm cursor-pointer flex items-center px-1 select-none ${
        day.isWorkingDay ? (isEditing ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-blue-500') : isEditing ? 'bg-gray-500 ring-2 ring-gray-300' : 'bg-gray-400'
      } ${isFirstSegment ? 'rounded-l' : ''} ${isLastSegment ? 'rounded-r' : ''}`}
      style={{
        top: rowIndex * taskHeight + 10,
        left: Math.max(0, segmentLeft),
        width: dayWidth,
        height: taskHeight - 20,
        zIndex: day.isWorkingDay ? 10 : 5,
      }}
      onMouseDown={(event) => onMouseDown(event, task, 'move')}>
      {isFirstSegment && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize ${day.isWorkingDay ? 'bg-blue-700' : 'bg-gray-600'}`}
          onMouseDown={(event) => {
            event.stopPropagation();
            onMouseDown(event, task, 'resize-left');
          }}
        />
      )}

      {isLastSegment && (
        <div
          className={`absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize ${day.isWorkingDay ? 'bg-blue-700' : 'bg-gray-600'}`}
          onMouseDown={(event) => {
            event.stopPropagation();
            onMouseDown(event, task, 'resize-right');
          }}
        />
      )}
    </div>
  );
};

export default TaskSegment;
