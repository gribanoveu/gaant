import React from 'react';
import { Download, Edit2, Plus, Trash2 } from 'lucide-react';

const GanttHeader = ({
  documentTitle,
  newTask,
  errors,
  period,
  startDate,
  onEditTitle,
  onNewTaskChange,
  onAddTask,
  onDownload,
  onClearAll,
  onPeriodChange,
  onStartDateChange,
}) => (
  <div className="bg-white border-b p-4">
    <div className="flex items-center gap-2 mb-4">
      <h1 className="text-2xl font-bold text-gray-800">{documentTitle}</h1>
      <button
        onClick={onEditTitle}
        aria-label="Изменить название документа"
        className="text-gray-500 hover:text-gray-700">
        <Edit2 size={18} />
      </button>
    </div>

    <div className="flex gap-2 items-center pb-2.5">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Название задачи"
          value={newTask.name}
          onChange={(event) => onNewTaskChange('name', event.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {errors.name && (
          <p className="absolute text-red-500 text-xs mt-1" style={{ bottom: '-18px', marginLeft: '0.2rem' }}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Исполнитель"
          value={newTask.assignee}
          onChange={(event) => onNewTaskChange('assignee', event.target.value)}
          className="border rounded px-3 py-2 w-48"
        />
        {errors.assignee && (
          <p className="absolute text-red-500 text-xs mt-1 mr-1" style={{ bottom: '-18px', marginLeft: '0.2rem' }}>
            {errors.assignee}
          </p>
        )}
      </div>

      <button
        onClick={onAddTask}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600">
        <Plus size={16} />
        Добавить
      </button>

      <button
        onClick={onDownload}
        className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600">
        <Download size={16} />
        Скачать
      </button>

      <button
        onClick={onClearAll}
        className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600">
        <Trash2 size={16} />
        Очистить
      </button>

      <select value={period} onChange={(event) => onPeriodChange(event.target.value)} className="border rounded px-3 py-2">
        <option value="sprint">Спринт</option>
        <option value="month">Месяц</option>
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(event) => onStartDateChange(event.target.value)}
        className="border rounded px-3 py-2"
      />
    </div>
  </div>
);

export default GanttHeader;
