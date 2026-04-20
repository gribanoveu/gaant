import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ganttTasks';

export const usePersistentTasks = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    return JSON.parse(savedTasks, (key, value) => {
      if (key === 'startDate') {
        return new Date(value);
      }

      return value;
    });
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  return [tasks, setTasks];
};
