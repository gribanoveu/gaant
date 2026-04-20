import { reorderTasks } from './gantt';

describe('reorderTasks', () => {
  const tasks = [
    { id: 1, name: 'Первая задача' },
    { id: 2, name: 'Вторая задача' },
    { id: 3, name: 'Третья задача' },
  ];

  it('moves a task before another one', () => {
    const reorderedTasks = reorderTasks(tasks, 3, 1, 'before');

    expect(reorderedTasks.map((task) => task.id)).toEqual([3, 1, 2]);
  });

  it('moves a task after another one', () => {
    const reorderedTasks = reorderTasks(tasks, 1, 2, 'after');

    expect(reorderedTasks.map((task) => task.id)).toEqual([2, 1, 3]);
  });
});
