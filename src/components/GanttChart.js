import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, X, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const GanttChart = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('ganttTasks');
    if (savedTasks) {
      return JSON.parse(savedTasks, (key, value) => {
        if (key === 'startDate') return new Date(value);
        return value;
      });
    }
    return [];
  });

  const [newTask, setNewTask] = useState({ name: '', assignee: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({
    name: '',
    assignee: '',
    startDate: new Date(),
    duration: 1,
  });
  const [dragState, setDragState] = useState(null);
  const [nonWorkingDays, setNonWorkingDays] = useState(new Set());
  const [period, setPeriod] = useState('sprint');

  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);

  const [documentTitle, setDocumentTitle] = useState('Диаграмма Ганта');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);

  const ganttContainerRef = useRef(null);
  const [dayWidth, setDayWidth] = useState(40);
  const taskHeight = 80;

  const getDateRange = () => {
    const selectedStartDate = new Date(startDate);
    let endDate;

    if (period === 'sprint') {
      endDate = new Date(selectedStartDate);
      endDate.setDate(selectedStartDate.getDate() + 14);
    } else if (period === 'month') {
      endDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth() + 1, 1);
    } else if (period === 'quarter') {
      const currentMonth = selectedStartDate.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      endDate = new Date(selectedStartDate.getFullYear(), quarterStartMonth + 3, 0);
    }

    const dates = [];
    const current = new Date(selectedStartDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const dates = getDateRange();

  useEffect(() => {
    localStorage.setItem('ganttTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const updateDayWidth = () => {
      if (ganttContainerRef.current) {
        const containerWidth = ganttContainerRef.current.offsetWidth;
        const newDayWidth = containerWidth / dates.length;
        setDayWidth(newDayWidth);
      }
    };

    updateDayWidth();
    window.addEventListener('resize', updateDayWidth);

    return () => {
      window.removeEventListener('resize', updateDayWidth);
    };
  }, [dates.length]);

  const timelineHeaderRef = useRef(null);
  const timelineContentRef = useRef(null);
  const taskListRef = useRef(null);

  const isNonWorkingDay = (date) => {
    const dayOfWeek = date.getDay();
    const dateString = getDateString(date);
    return dayOfWeek === 0 || dayOfWeek === 6 || nonWorkingDays.has(dateString);
  };

  const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleWorkingDay = (date) => {
    const dateString = getDateString(date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    setNonWorkingDays((prev) => {
      const newSet = new Set(prev);
      if (isWeekend) {
        if (newSet.has(dateString)) {
          newSet.delete(dateString);
        } else {
          newSet.add(dateString);
        }
      } else {
        if (newSet.has(dateString)) {
          newSet.delete(dateString);
        } else {
          newSet.add(dateString);
        }
      }
      return newSet;
    });
  };

  const handleTimelineScroll = (e) => {
    if (timelineHeaderRef.current && e.target === timelineContentRef.current) {
      timelineHeaderRef.current.scrollLeft = e.target.scrollLeft;
    }
    if (taskListRef.current) {
      taskListRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleTaskListScroll = (e) => {
    if (timelineContentRef.current) {
      timelineContentRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const addTask = () => {
    if (newTask.name.trim() && newTask.assignee.trim()) {
      const newTaskObj = {
        id: Date.now(),
        name: newTask.name,
        assignee: newTask.assignee,
        startDate: new Date(),
        duration: 1,
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask({ name: '', assignee: '' });
    }
  };

  const getTaskPosition = (task) => {
    const firstDate = dates[0];
    const daysDiff = Math.floor((task.startDate - firstDate) / (1000 * 60 * 60 * 24));
    return {
      left: daysDiff * dayWidth,
      width: task.duration * dayWidth,
    };
  };

  const getWorkingDaysForTask = (task) => {
    const taskDays = [];
    const currentDate = new Date(task.startDate);

    for (let i = 0; i < task.duration; i++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(currentDate.getDate() + i);

      const dayIndex = dates.findIndex((date) => date.toDateString() === dayDate.toDateString());

      if (dayIndex !== -1) {
        taskDays.push({
          date: dayDate,
          index: dayIndex,
          isWorkingDay: !isNonWorkingDay(dayDate),
        });
      }
    }

    return taskDays;
  };

  const handleMouseDown = (e, task, action) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = e.currentTarget.closest('.gantt-timeline').getBoundingClientRect();

    setDragState({
      taskId: task.id,
      action,
      startX: e.clientX,
      initialLeft: rect.left - containerRect.left,
      initialWidth: rect.width,
      initialStartDate: new Date(task.startDate),
      initialDuration: task.duration,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;

    const deltaX = e.clientX - dragState.startX;
    const daysDelta = Math.round(deltaX / dayWidth);

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== dragState.taskId) return task;

        if (dragState.action === 'move') {
          const newStartDate = new Date(dragState.initialStartDate);
          newStartDate.setDate(newStartDate.getDate() + daysDelta);
          return { ...task, startDate: newStartDate };
        } else if (dragState.action === 'resize-right') {
          const newDuration = Math.max(1, dragState.initialDuration + daysDelta);
          return { ...task, duration: newDuration };
        } else if (dragState.action === 'resize-left') {
          const newDuration = Math.max(1, dragState.initialDuration - daysDelta);
          const newStartDate = new Date(dragState.initialStartDate);
          newStartDate.setDate(newStartDate.getDate() + (dragState.initialDuration - newDuration));
          return { ...task, startDate: newStartDate, duration: newDuration };
        }

        return task;
      }),
    );
  };

  const getWorkingDaysCount = (task) => {
    const taskDays = getWorkingDaysForTask(task);
    return taskDays.filter((day) => day.isWorkingDay).length;
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState]);

  const handleTaskListClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTask({
      name: task.name,
      assignee: task.assignee,
      startDate: task.startDate,
      duration: task.duration,
    });
  };

  const saveTaskEdit = () => {
    if (editingTask.name.trim() && editingTask.assignee.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
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
    }
    setEditingTaskId(null);
    setEditingTask({ name: '', assignee: '', startDate: new Date(), duration: 1 });
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTask({ name: '', assignee: '', startDate: new Date(), duration: 1 });
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setEditingTaskId(null);
    setEditingTask({ name: '', assignee: '', startDate: new Date(), duration: 1 });
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  const generateMarkdown = () => {
    let markdown = `# ${documentTitle}\n\n`;

    markdown += '## Список задач\n\n';
    markdown += '| Название задачи | Исполнитель | Начало | Конец | Длительность | Рабочие дни |\n';
    markdown += '|-----------------|-------------|--------|-------|--------------|-------------|\n';

    tasks.forEach((task) => {
      const endDate = new Date(
        task.startDate.getTime() + (task.duration - 1) * 24 * 60 * 60 * 1000,
      );
      markdown += `| ${task.name} | ${task.assignee} | ${formatDate(task.startDate)} | ${formatDate(
        endDate,
      )} | ${task.duration} дн. | ${getWorkingDaysCount(task)} раб. |\n`;
    });

    return markdown;
  };

  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
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
  };

  const openEditTitleModal = () => {
    setTempTitle(documentTitle);
    setIsEditingTitle(true);
  };

  const saveDocumentTitle = () => {
    setDocumentTitle(tempTitle);
    setIsEditingTitle(false);
  };

  const cancelEditTitle = () => {
    setIsEditingTitle(false);
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col relative">
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{documentTitle}</h1>
          <button onClick={openEditTitleModal} className="text-gray-500 hover:text-gray-700">
            <Edit2 size={18} />
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Название задачи"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            type="text"
            placeholder="Исполнитель"
            value={newTask.assignee}
            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
            className="border rounded px-3 py-2 w-48"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600">
            <Plus size={16} />
            Добавить
          </button>
          <button
            onClick={downloadMarkdown}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600">
            <Download size={16} />
            Скачать
          </button>
          <button
            onClick={clearAllTasks}
            className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600">
            <Trash2 size={16} />
            Очистить
          </button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded px-3 py-2">
            <option value="sprint">Спринт</option>
            <option value="month">Месяц</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700 pb-2">Список задач</h2>
          </div>
          <div
            ref={taskListRef}
            className="flex-1 overflow-y-auto relative"
            onScroll={handleTaskListScroll}>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`border-b hover:bg-gray-50 flex items-center px-4 cursor-pointer ${
                  editingTaskId === task.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                style={{
                  height: taskHeight,
                  minHeight: taskHeight,
                }}
                onClick={() => handleTaskListClick(task)}>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 mb-1">{task.name}</div>
                  <div className="text-sm text-gray-600 mb-1">Исполнитель: {task.assignee}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(task.startDate)} -{' '}
                    {formatDate(
                      new Date(
                        task.startDate.getTime() + (task.duration - 1) * 24 * 60 * 60 * 1000,
                      ),
                    )}
                    <span className="ml-2">
                      ({task.duration} дн., {getWorkingDaysCount(task)} раб.)
                    </span>
                  </div>
                </div>
                {editingTaskId === task.id && <Edit2 size={16} className="text-blue-500" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden" ref={ganttContainerRef}>
          <div className="bg-white border-b overflow-hidden">
            <div
              ref={timelineHeaderRef}
              className="flex overflow-x-hidden"
              style={{ paddingLeft: 0, paddingRight: 0 }}>
              {dates.map((date, index) => {
                const isNonWorking = isNonWorkingDay(date);
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const dateString = getDateString(date);
                const isCustomNonWorking = nonWorkingDays.has(dateString);

                return (
                  <div
                    key={index}
                    className={`border-r text-center flex flex-col justify-center text-xs font-medium cursor-pointer transition-colors py-3 ${
                      isNonWorking ? 'bg-gray-100 text-gray-500' : 'text-gray-600'
                    }`}
                    style={{ width: dayWidth, minWidth: dayWidth }}
                    onClick={() => toggleWorkingDay(date)}
                    title={
                      isWeekend
                        ? `${
                            isCustomNonWorking ? 'Рабочий выходной' : 'Выходной день'
                          } - нажмите для переключения`
                        : `${
                            isCustomNonWorking ? 'Нерабочий день' : 'Рабочий день'
                          } - нажмите для переключения`
                    }>
                    <div>{formatDate(date)}</div>
                    <div className={isNonWorking ? 'text-gray-400' : 'text-gray-400'}>
                      {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                    </div>
                    {isCustomNonWorking && !isWeekend && (
                      <div className="text-xs text-red-500"></div>
                    )}
                    {isCustomNonWorking && isWeekend && (
                      <div className="text-xs text-green-500"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            ref={timelineContentRef}
            className="flex-1 overflow-auto"
            onScroll={handleTimelineScroll}>
            <div
              className="gantt-timeline relative"
              style={{
                width: dates.length * dayWidth,
                height: tasks.length * taskHeight,
                minHeight: '100%',
              }}>
              {dates.map((date, index) => {
                const isNonWorking = isNonWorkingDay(date);
                return (
                  <div
                    key={index}
                    className={`absolute border-r ${
                      isNonWorking ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                    }`}
                    style={{
                      left: index * dayWidth,
                      width: dayWidth,
                      top: 0,
                      height: tasks.length * taskHeight,
                    }}
                  />
                );
              })}

              {tasks.map((task, index) => {
                const isEditing = editingTaskId === task.id;
                const taskDays = getWorkingDaysForTask(task);

                return (
                  <div key={task.id} className="relative">
                    <div
                      className="absolute border-b border-gray-100 hover:bg-gray-50"
                      style={{
                        top: index * taskHeight,
                        left: 0,
                        right: 0,
                        height: taskHeight,
                      }}
                    />

                    {taskDays.map((day, dayIndex) => {
                      const segmentLeft = day.index * dayWidth;
                      const isFirstSegment = dayIndex === 0;
                      const isLastSegment = dayIndex === taskDays.length - 1;

                      return (
                        <div
                          key={`${task.id}-${dayIndex}`}
                          className={`absolute shadow-sm cursor-pointer flex items-center px-1 select-none ${
                            day.isWorkingDay
                              ? isEditing
                                ? 'bg-blue-600 ring-2 ring-blue-300'
                                : 'bg-blue-500'
                              : isEditing
                              ? 'bg-gray-500 ring-2 ring-gray-300'
                              : 'bg-gray-400'
                          } ${isFirstSegment ? 'rounded-l' : ''} ${
                            isLastSegment ? 'rounded-r' : ''
                          }`}
                          style={{
                            top: index * taskHeight + 10,
                            left: Math.max(0, segmentLeft),
                            width: dayWidth,
                            height: taskHeight - 20,
                            zIndex: day.isWorkingDay ? 10 : 5,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, task, 'move')}>
                          {isFirstSegment && (
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize ${
                                day.isWorkingDay ? 'bg-blue-700' : 'bg-gray-600'
                              }`}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleMouseDown(e, task, 'resize-left');
                              }}
                            />
                          )}
                          {isLastSegment && (
                            <div
                              className={`absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize ${
                                day.isWorkingDay ? 'bg-blue-700' : 'bg-gray-600'
                              }`}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleMouseDown(e, task, 'resize-right');
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {editingTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Редактировать задачу</h3>
              <button onClick={cancelTaskEdit} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название задачи
                </label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите название задачи"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Исполнитель</label>
                <input
                  type="text"
                  value={editingTask.assignee}
                  onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите имя исполнителя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                <input
                  type="date"
                  value={editingTask.startDate.toISOString().split('T')[0]}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, startDate: new Date(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Длительность (в днях)
                </label>
                <input
                  type="number"
                  value={editingTask.duration}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, duration: parseInt(e.target.value) || 1 })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveTaskEdit}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Сохранить
              </button>
              <button
                onClick={cancelTaskEdit}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Отмена
              </button>
              <button
                onClick={() => deleteTask(editingTaskId)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingTitle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Изменить название документа</h3>
              <button onClick={cancelEditTitle} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите название документа"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveDocumentTitle}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Сохранить
              </button>
              <button
                onClick={cancelEditTitle}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-100 p-3 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <strong>Инструкции</strong>
          <button
            onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
            className="text-gray-600 hover:text-gray-800">
            {isInstructionsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        {isInstructionsOpen && (
          <>
            <p>
              Перетаскивайте задачи для изменения даты начала. Наведите на края задач и
              перетаскивайте для изменения длительности. Кликните по задаче в списке слева для
              редактирования или удаления.
            </p>
            <p>
              <strong>Календарь:</strong> Нажмите на дату в заголовке для переключения
              рабочего/нерабочего дня. Серые дни - выходные/нерабочие.
            </p>
            <p>
              <strong>Задачи:</strong> Синие сегменты - рабочие дни, серые сегменты -
              выходные/нерабочие дни. В списке задач показана общая длительность и количество
              рабочих дней.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GanttChart;
