import React from 'react';
import TimelineDayCell from './TimelineDayCell';
import { getDateString } from '../../utils/date';

const TimelineHeader = ({
  dates,
  dayWidth,
  timelineHeaderRef,
  nonWorkingDays,
  isNonWorkingDay,
  onToggleWorkingDay,
}) => (
  <div ref={timelineHeaderRef} className="bg-white border-b overflow-hidden">
    <div
      className="flex"
      style={{
        width: dates.length * dayWidth,
        minWidth: dates.length * dayWidth,
        paddingLeft: 0,
        paddingRight: 0,
      }}>
      {dates.map((date, index) => (
        <TimelineDayCell
          key={index}
          date={date}
          dayWidth={dayWidth}
          isNonWorking={isNonWorkingDay(date)}
          isCustomNonWorking={nonWorkingDays.has(getDateString(date))}
          onToggle={onToggleWorkingDay}
        />
      ))}
    </div>
  </div>
);

export default TimelineHeader;
