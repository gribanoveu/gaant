import React from 'react';
import Modal from '../common/Modal';
import { toDateInputValue } from '../../utils/date';

const EditTaskModal = ({ task, onChange, onSave, onCancel, onDelete }) => {
  if (!task) {
    return null;
  }

  return (
    <Modal
      title="Редактировать задачу"
      onClose={onCancel}
      footer={
        <>
          <button
            onClick={onSave}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Сохранить
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Отмена
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            Удалить
          </button>
        </>
      }>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Название задачи</label>
        <input
          type="text"
          value={task.name}
          onChange={(event) => onChange('name', event.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Введите название задачи"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Исполнитель</label>
        <input
          type="text"
          value={task.assignee}
          onChange={(event) => onChange('assignee', event.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Введите имя исполнителя"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
        <input
          type="date"
          value={toDateInputValue(task.startDate)}
          onChange={(event) => onChange('startDate', new Date(event.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Длительность (в днях)
        </label>
        <input
          type="number"
          value={task.duration}
          onChange={(event) => onChange('duration', parseInt(event.target.value, 10) || 1)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </Modal>
  );
};

export default EditTaskModal;
