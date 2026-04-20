import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GanttChart from './GanttChart';

describe('GanttChart', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds a task and opens task edit modal', async () => {
    render(<GanttChart />);

    await userEvent.type(screen.getByPlaceholderText('Название задачи'), 'Подготовить релиз');
    await userEvent.type(screen.getByPlaceholderText('Исполнитель'), 'Евгений');
    await userEvent.click(screen.getByRole('button', { name: /добавить/i }));

    expect(screen.getByText('Подготовить релиз')).toBeTruthy();
    expect(screen.getByText('Исполнитель: Евгений')).toBeTruthy();

    await userEvent.click(screen.getByText('Подготовить релиз'));

    expect(screen.getByText('Редактировать задачу')).toBeTruthy();
  });

  it('opens and saves document title modal', async () => {
    render(<GanttChart />);

    await userEvent.click(screen.getByRole('button', { name: 'Изменить название документа' }));
    await userEvent.clear(screen.getByPlaceholderText('Введите название документа'));
    await userEvent.type(screen.getByPlaceholderText('Введите название документа'), 'Новый план');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(screen.getByText('Новый план')).toBeTruthy();
  });

  it('uses fixed day width in month view', async () => {
    render(<GanttChart />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'month');

    await waitFor(() => {
      const firstDayCell = screen.getAllByTitle(/нажмите для переключения/i)[0];
      expect(firstDayCell.style.width).toBe('72px');
      expect(firstDayCell.style.minWidth).toBe('72px');
    });
  });
});
