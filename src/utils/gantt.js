import { formatDate, getTaskEndDate } from './date';

export const getWorkingDaysForTask = (task, dates, isNonWorkingDay) => {
  const taskDays = [];
  const currentDate = new Date(task.startDate);

  for (let i = 0; i < task.duration; i += 1) {
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

export const getWorkingDaysCount = (task, dates, isNonWorkingDay) =>
  getWorkingDaysForTask(task, dates, isNonWorkingDay).filter((day) => day.isWorkingDay).length;

export const generateMarkdown = (documentTitle, tasks, dates, isNonWorkingDay) => {
  let markdown = `# ${documentTitle}\n\n`;

  markdown += '## Список задач\n\n';
  markdown += '| Название задачи | Исполнитель | Начало | Конец | Длительность | Рабочие дни |\n';
  markdown += '|-----------------|-------------|--------|-------|--------------|-------------|\n';

  tasks.forEach((task) => {
    markdown += `| ${task.name} | ${task.assignee} | ${formatDate(task.startDate)} | ${formatDate(
      getTaskEndDate(task),
    )} | ${task.duration} дн. | ${getWorkingDaysCount(task, dates, isNonWorkingDay)} раб. |\n`;
  });

  return markdown;
};

export const reorderTasks = (tasks, draggedTaskId, targetTaskId, position) => {
  if (!draggedTaskId || !targetTaskId || draggedTaskId === targetTaskId) {
    return tasks;
  }

  const draggedIndex = tasks.findIndex((task) => task.id === draggedTaskId);
  const targetIndex = tasks.findIndex((task) => task.id === targetTaskId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return tasks;
  }

  const nextTasks = [...tasks];
  const [draggedTask] = nextTasks.splice(draggedIndex, 1);
  const adjustedTargetIndex =
    draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
  const insertionIndex = position === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex;

  nextTasks.splice(insertionIndex, 0, draggedTask);

  return nextTasks;
};
