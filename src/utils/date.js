export const formatDate = (date) =>
  date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });

export const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const toDateInputValue = (date) => getDateString(new Date(date));

export const getDateRange = (startDate, period) => {
  const selectedStartDate = new Date(startDate);
  let rangeStartDate = new Date(selectedStartDate);
  let endDate = new Date(selectedStartDate);

  if (period === 'sprint') {
    endDate.setDate(selectedStartDate.getDate() + 14);
  } else if (period === 'month') {
    rangeStartDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), 1);
    endDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth() + 1, 0);
  } else {
    endDate.setDate(selectedStartDate.getDate() + 30);
  }

  const dates = [];
  const current = new Date(rangeStartDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const isNonWorkingDay = (date, nonWorkingDays) => {
  const dayOfWeek = date.getDay();
  const dateString = getDateString(date);

  return dayOfWeek === 0 || dayOfWeek === 6 || nonWorkingDays.has(dateString);
};

export const getTaskEndDate = (task) =>
  new Date(task.startDate.getTime() + (task.duration - 1) * 24 * 60 * 60 * 1000);
