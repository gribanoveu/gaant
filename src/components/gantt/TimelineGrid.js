import React from 'react';
import TimelineTaskRow from './TimelineTaskRow';

const TimelineGrid = ({
  dates,
  tasks,
  dayWidth,
  taskHeight,
  timelineContentRef,
  onScroll,
  isNonWorkingDay,
  editingTaskId,
  getWorkingDaysForTask,
  onTaskMouseDown,
}) => (
  <div ref={timelineContentRef} className="flex-1 overflow-auto" onScroll={onScroll}>
    <div
      className="gantt-timeline relative"
      style={{
        width: dates.length * dayWidth,
        height: tasks.length * taskHeight,
        minHeight: '100%',
      }}>
      {dates.map((date, index) => (
        <div
          key={index}
          className={`absolute border-r ${
            isNonWorkingDay(date) ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
          }`}
          style={{
            left: index * dayWidth,
            width: dayWidth,
            top: 0,
            height: tasks.length * taskHeight,
          }}
        />
      ))}

      {tasks.map((task, index) => (
        <TimelineTaskRow
          key={task.id}
          task={task}
          rowIndex={index}
          taskHeight={taskHeight}
          dayWidth={dayWidth}
          isEditing={editingTaskId === task.id}
          taskDays={getWorkingDaysForTask(task)}
          onTaskMouseDown={onTaskMouseDown}
        />
      ))}
    </div>
  </div>
);

export default TimelineGrid;
