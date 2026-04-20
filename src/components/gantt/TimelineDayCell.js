import React from 'react';
import { formatDate } from '../../utils/date';

const TimelineDayCell = ({ date, dayWidth, isNonWorking, isCustomNonWorking, onToggle }) => {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return (
    <div
      className={`shrink-0 border-r text-center flex flex-col justify-center text-xs font-medium cursor-pointer transition-colors py-3 ${
        isNonWorking ? 'bg-gray-100 text-gray-500' : 'text-gray-600'
      }`}
      style={{ width: dayWidth, minWidth: dayWidth }}
      onClick={() => onToggle(date)}
      title={
        isWeekend
          ? `${isCustomNonWorking ? 'Рабочий выходной' : 'Выходной день'} - нажмите для переключения`
          : `${isCustomNonWorking ? 'Нерабочий день' : 'Рабочий день'} - нажмите для переключения`
      }>
      <div>{formatDate(date)}</div>
      <div className="text-gray-400">{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
      {isCustomNonWorking && !isWeekend && <div className="text-xs text-red-500"></div>}
      {isCustomNonWorking && isWeekend && <div className="text-xs text-green-500"></div>}
    </div>
  );
};

export default TimelineDayCell;
