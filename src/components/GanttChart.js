import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GanttHeader from './gantt/GanttHeader';
import TaskListPanel from './gantt/TaskListPanel';
import TimelineHeader from './gantt/TimelineHeader';
import TimelineGrid from './gantt/TimelineGrid';
import InstructionsPanel from './gantt/InstructionsPanel';
import EditTaskModal from './gantt/EditTaskModal';
import EditTitleModal from './gantt/EditTitleModal';
import { usePersistentTasks } from '../hooks/usePersistentTasks';
import {
  generateMarkdown,
  getWorkingDaysCount,
  getWorkingDaysForTask,
  reorderTasks,
} from '../utils/gantt';
import { getDateRange, getDateString, isNonWorkingDay } from '../utils/date';

const createEmptyEditingTask = () => ({
  name: '',
  assignee: '',
  startDate: new Date(),
  duration: 1,
});

const MONTH_VIEW_DAY_WIDTH = 72;

const GanttChart = () => {
  const [tasks, setTasks] = usePersistentTasks();
  const [newTask, setNewTask] = useState({ name: '', assignee: '' });
  const [errors, setErrors] = useState({ name: '', assignee: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(createEmptyEditingTask());
  const [dragState, setDragState] = useState(null);
  const [rowDragState, setRowDragState] = useState({
    draggedTaskId: null,
    overTaskId: null,
    position: null,
  });
  const [nonWorkingDays, setNonWorkingDays] = useState(new Set());
  const [period, setPeriod] = useState('sprint');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [documentTitle, setDocumentTitle] = useState('Диаграмма Ганта');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [dayWidth, setDayWidth] = useState(40);

  const ganttContainerRef = useRef(null);
  const timelineHeaderRef = useRef(null);
  const timelineContentRef = useRef(null);
  const taskListRef = useRef(null);

  const taskHeight = 80;
  const dates = useMemo(() => getDateRange(startDate, period), [startDate, period]);

  const isMarkedNonWorkingDay = useCallback(
    (date) => isNonWorkingDay(date, nonWorkingDays),
    [nonWorkingDays],
  );

  const getTaskWorkingDays = useCallback(
    (task) => getWorkingDaysForTask(task, dates, isMarkedNonWorkingDay),
    [dates, isMarkedNonWorkingDay],
  );

  const getTaskWorkingDaysCount = useCallback(
    (task) => getWorkingDaysCount(task, dates, isMarkedNonWorkingDay),
    [dates, isMarkedNonWorkingDay],
  );

  useEffect(() => {
    const updateDayWidth = () => {
      if (period === 'month') {
        setDayWidth(MONTH_VIEW_DAY_WIDTH);
        return;
      }

      if (!ganttContainerRef.current) {
        return;
      }

      const containerWidth = ganttContainerRef.current.offsetWidth;
      setDayWidth(containerWidth / dates.length);
    };

    updateDayWidth();
    window.addEventListener('resize', updateDayWidth);

    return () => {
      window.removeEventListener('resize', updateDayWidth);
    };
  }, [dates.length, period]);

  const resetEditingTask = useCallback(() => {
    setEditingTaskId(null);
    setEditingTask(createEmptyEditingTask());
  }, []);

  const toggleWorkingDay = useCallback((date) => {
    const dateString = getDateString(date);

    setNonWorkingDays((previousDays) => {
      const nextDays = new Set(previousDays);

      if (nextDays.has(dateString)) {
        nextDays.delete(dateString);
      } else {
        nextDays.add(dateString);
      }

      return nextDays;
    });
  }, []);

  const handleTimelineScroll = useCallback((event) => {
    if (timelineHeaderRef.current && event.target === timelineContentRef.current) {
      timelineHeaderRef.current.scrollLeft = event.target.scrollLeft;
    }

    if (taskListRef.current) {
      taskListRef.current.scrollTop = event.target.scrollTop;
    }
  }, []);

  const handleTaskListScroll = useCallback((event) => {
    if (timelineContentRef.current) {
      timelineContentRef.current.scrollTop = event.target.scrollTop;
    }
  }, []);

  const validateTask = useCallback(() => {
    let isValid = true;
    const nextErrors = { name: '', assignee: '' };

    if (!newTask.name.trim()) {
      nextErrors.name = 'Название задачи обязательно';
      isValid = false;
    }

    if (!newTask.assignee.trim()) {
      nextErrors.assignee = 'Исполнитель обязателен';
      isValid = false;
    }

    setErrors(nextErrors);

    return isValid;
  }, [newTask]);

  const handleNewTaskChange = useCallback((field, value) => {
    setNewTask((previousTask) => ({ ...previousTask, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: '' }));
  }, []);

  const addTask = useCallback(() => {
    if (!validateTask()) {
      return;
    }

    const newTaskObject = {
      id: Date.now(),
      name: newTask.name,
      assignee: newTask.assignee,
      startDate: new Date(),
      duration: 1,
    };

    setTasks((previousTasks) => [...previousTasks, newTaskObject]);
    setNewTask({ name: '', assignee: '' });
    setErrors({ name: '', assignee: '' });
  }, [newTask, setTasks, validateTask]);

  const handleTaskMouseDown = useCallback((event, task, action) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = event.currentTarget.closest('.gantt-timeline').getBoundingClientRect();

    setDragState({
      taskId: task.id,
      action,
      startX: event.clientX,
      initialLeft: rect.left - containerRect.left,
      initialWidth: rect.width,
      initialStartDate: new Date(task.startDate),
      initialDuration: task.duration,
    });
  }, []);

  const resetRowDragState = useCallback(() => {
    setRowDragState({
      draggedTaskId: null,
      overTaskId: null,
      position: null,
    });
  }, []);

  const handleTaskRowDragStart = useCallback((event, task) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(task.id));

    setRowDragState({
      draggedTaskId: task.id,
      overTaskId: null,
      position: null,
    });
  }, []);

  const handleTaskRowDragOver = useCallback(
    (event, task) => {
      event.preventDefault();

      if (!rowDragState.draggedTaskId || rowDragState.draggedTaskId === task.id) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

      setRowDragState((previousState) => {
        if (previousState.overTaskId === task.id && previousState.position === position) {
          return previousState;
        }

        return {
          ...previousState,
          overTaskId: task.id,
          position,
        };
      });
    },
    [rowDragState.draggedTaskId],
  );

  const handleTaskRowDrop = useCallback(
    (event, task) => {
      event.preventDefault();
      const draggedTaskId =
        rowDragState.draggedTaskId || Number(event.dataTransfer.getData('text/plain'));

      setTasks((previousTasks) =>
        reorderTasks(
          previousTasks,
          draggedTaskId,
          task.id,
          rowDragState.position || 'before',
        ),
      );

      resetRowDragState();
    },
    [resetRowDragState, rowDragState.draggedTaskId, rowDragState.position, setTasks],
  );

  const handleMouseMove = useCallback(
    (event) => {
      if (!dragState) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;
      const daysDelta = Math.round(deltaX / dayWidth);

      setTasks((previousTasks) =>
        previousTasks.map((task) => {
          if (task.id !== dragState.taskId) {
            return task;
          }

          if (dragState.action === 'move') {
            const nextStartDate = new Date(dragState.initialStartDate);
            nextStartDate.setDate(nextStartDate.getDate() + daysDelta);
            return { ...task, startDate: nextStartDate };
          }

          if (dragState.action === 'resize-right') {
            return {
              ...task,
              duration: Math.max(1, dragState.initialDuration + daysDelta),
            };
          }

          if (dragState.action === 'resize-left') {
            const nextDuration = Math.max(1, dragState.initialDuration - daysDelta);
            const nextStartDate = new Date(dragState.initialStartDate);
            nextStartDate.setDate(
              nextStartDate.getDate() + (dragState.initialDuration - nextDuration),
            );

            return {
              ...task,
              startDate: nextStartDate,
              duration: nextDuration,
            };
          }

          return task;
        }),
      );
    },
    [dayWidth, dragState, setTasks],
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, handleMouseMove, handleMouseUp]);

  const handleTaskListClick = useCallback((task) => {
    setEditingTaskId(task.id);
    setEditingTask({
      name: task.name,
      assignee: task.assignee,
      startDate: task.startDate,
      duration: task.duration,
    });
  }, []);

  const handleEditingTaskChange = useCallback((field, value) => {
    setEditingTask((previousTask) => ({ ...previousTask, [field]: value }));
  }, []);

  const saveTaskEdit = useCallback(() => {
    if (!editingTask.name.trim() || !editingTask.assignee.trim()) {
      resetEditingTask();
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              name: editingTask.name,
              assignee: editingTask.assignee,
              startDate: new Date(editingTask.startDate),
              duration: editingTask.duration,
            }
          : task,
      ),
    );

    resetEditingTask();
  }, [editingTask, editingTaskId, resetEditingTask, setTasks]);

  const deleteTask = useCallback(
    (taskId) => {
      setTasks((previousTasks) => previousTasks.filter((task) => task.id !== taskId));
      resetEditingTask();
    },
    [resetEditingTask, setTasks],
  );

  const clearAllTasks = useCallback(() => {
    setTasks([]);
  }, [setTasks]);

  const downloadMarkdown = useCallback(() => {
    const markdown = generateMarkdown(documentTitle, tasks, dates, isMarkedNonWorkingDay);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const now = new Date();
    const dateString = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}.${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
    link.download = `${documentTitle}_${dateString}.md`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [dates, documentTitle, isMarkedNonWorkingDay, tasks]);

  const openEditTitleModal = useCallback(() => {
    setTempTitle(documentTitle);
    setIsEditingTitle(true);
  }, [documentTitle]);

  const saveDocumentTitle = useCallback(() => {
    setDocumentTitle(tempTitle);
    setIsEditingTitle(false);
  }, [tempTitle]);

  const cancelEditTitle = useCallback(() => {
    setIsEditingTitle(false);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col relative">
      <GanttHeader
        documentTitle={documentTitle}
        newTask={newTask}
        errors={errors}
        period={period}
        startDate={startDate}
        onEditTitle={openEditTitleModal}
        onNewTaskChange={handleNewTaskChange}
        onAddTask={addTask}
        onDownload={downloadMarkdown}
        onClearAll={clearAllTasks}
        onPeriodChange={setPeriod}
        onStartDateChange={setStartDate}
      />

      <div className="flex flex-1 overflow-hidden">
        <TaskListPanel
          tasks={tasks}
          editingTaskId={editingTaskId}
          taskHeight={taskHeight}
          taskListRef={taskListRef}
          onScroll={handleTaskListScroll}
          onTaskClick={handleTaskListClick}
          getWorkingDaysCount={getTaskWorkingDaysCount}
          rowDragState={rowDragState}
          onTaskDragStart={handleTaskRowDragStart}
          onTaskDragOver={handleTaskRowDragOver}
          onTaskDrop={handleTaskRowDrop}
          onTaskDragEnd={resetRowDragState}
        />

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden" ref={ganttContainerRef}>
          <TimelineHeader
            dates={dates}
            dayWidth={dayWidth}
            timelineHeaderRef={timelineHeaderRef}
            nonWorkingDays={nonWorkingDays}
            isNonWorkingDay={isMarkedNonWorkingDay}
            onToggleWorkingDay={toggleWorkingDay}
          />

          <TimelineGrid
            dates={dates}
            tasks={tasks}
            dayWidth={dayWidth}
            taskHeight={taskHeight}
            timelineContentRef={timelineContentRef}
            onScroll={handleTimelineScroll}
            isNonWorkingDay={isMarkedNonWorkingDay}
            editingTaskId={editingTaskId}
            getWorkingDaysForTask={getTaskWorkingDays}
            onTaskMouseDown={handleTaskMouseDown}
          />
        </div>
      </div>

      {editingTaskId && (
        <EditTaskModal
          task={editingTask}
          onChange={handleEditingTaskChange}
          onSave={saveTaskEdit}
          onCancel={resetEditingTask}
          onDelete={() => deleteTask(editingTaskId)}
        />
      )}

      {isEditingTitle && (
        <EditTitleModal
          title={tempTitle}
          onChange={setTempTitle}
          onSave={saveDocumentTitle}
          onCancel={cancelEditTitle}
        />
      )}

      <InstructionsPanel
        isOpen={isInstructionsOpen}
        onToggle={() => setIsInstructionsOpen((previousState) => !previousState)}
      />
    </div>
  );
};

export default GanttChart;
