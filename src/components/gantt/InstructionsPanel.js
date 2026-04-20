import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const InstructionsPanel = ({ isOpen, onToggle }) => (
  <div className="bg-gray-100 p-3 text-sm text-gray-600">
    <div className="flex justify-between items-center">
      <strong>Инструкции</strong>
      <button onClick={onToggle} className="text-gray-600 hover:text-gray-800">
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
    </div>

    {isOpen && (
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
);

export default InstructionsPanel;
