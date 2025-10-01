import { TimePicker } from 'antd';
import { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface TimeSetterProps {
    date: Date;
    startTime?: string;
    endTime?: string;
    onTimeSave?: (startTime?: string | null, endTime?: string | null) => void;
}

const formatTimeForAPI = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}


export const TimeSetter = ({ date, onTimeSave, startTime, endTime }: TimeSetterProps) => {
  const [startTimeString, setStartTimeString] = useState<string | undefined>(startTime ? startTime : undefined);
  const [endTimeString, setEndTimeString] = useState<string | undefined>(endTime ? endTime : undefined);
  const [warning, setWarning] = useState<string | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  useEffect(() => {
    if (!startTimeString && endTimeString) {
      setWarning("End time cannot be set without a start time.");
      setIsSaveDisabled(true);
    }
    else {
      setWarning(null);
      setIsSaveDisabled(false);
    }
  }, [startTimeString, endTimeString]);

  const handleStartTimeChange = (time: Dayjs | null) => {
    if (time) {
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(time.hour(), time.minute(), 0, 0);
      console.log('Combined Start DateTime:', formatTimeForAPI(combinedDateTime));
      setStartTimeString(formatTimeForAPI(combinedDateTime));
    } else {
      setStartTimeString(undefined);
    }
  };

  const handleEndTimeChange = (time: Dayjs | null) => {
    if (time) {
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(time.hour(), time.minute(), 0, 0);
      setEndTimeString(formatTimeForAPI(combinedDateTime));
    } else {
      setEndTimeString(undefined);
    }
  };

  const handleSave = () => {
    if (startTimeString || (!startTimeString && !endTimeString)) { // can save with only start time
      onTimeSave?.(startTimeString || null, endTimeString || null);
    }
    else {
      // Optionally handle the case where startTimeString is not set
      console.warn("Start time is required to save.");
    }
  }

  return (
    <div className="p-4 flex flex-col bg-white dark:bg-card border border-border rounded-md shadow-md">
      <div className="flex gap-2">
      <TimePicker
          value={startTimeString ? dayjs(startTimeString) : undefined}
          onChange={handleStartTimeChange}
          placeholder="Start time"
          allowClear={true}
          format="HH:mm"
        />
        <TimePicker
          value={endTimeString ? dayjs(endTimeString) : undefined}
          onChange={handleEndTimeChange}
          placeholder="End time"
          allowClear={true}
          format="HH:mm"
        />
      </div>
      <div>{warning && <span className="text-red-500">{warning}</span>}</div>
      <button disabled={isSaveDisabled} onClick={handleSave} className='mt-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md'>
        Save
      </button>
    </div>
  );
};
