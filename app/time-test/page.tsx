'use client';

import { useEffect, useState } from 'react';

export default function TimeTestPage() {
  const [times, setTimes] = useState({
    raw: '',
    utc: '',
    bd: '',
    bdHours: 0,
    bdMinutes: 0,
    bdSeconds: 0,
    offset: 0,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Direct UTC time (no timezone offset adjustment needed)
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();
      
      // Add 6 hours for BD time
      let bdHours = utcHours + 6;
      let bdMinutes = utcMinutes;
      let bdSeconds = utcSeconds;
      
      // Handle day overflow
      if (bdHours >= 24) {
        bdHours -= 24;
      }
      
      setTimes({
        raw: now.toString(),
        utc: now.toISOString(),
        bd: `UTC+6: ${String(bdHours).padStart(2, '0')}:${String(bdMinutes).padStart(2, '0')}:${String(bdSeconds).padStart(2, '0')}`,
        bdHours: bdHours,
        bdMinutes: bdMinutes,
        bdSeconds: bdSeconds,
        offset: now.getTimezoneOffset(),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const bdTimeString = `${String(times.bdHours).padStart(2, '0')}:${String(times.bdMinutes).padStart(2, '0')}:${String(times.bdSeconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Time Debug Page - BD Time Fix</h1>
      
      <div className="space-y-4 font-mono">
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Browser Raw Time:</div>
          <div className="text-xl">{times.raw}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">UTC Time (ISO):</div>
          <div className="text-xl">{times.utc}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Timezone Offset (minutes):</div>
          <div className="text-xl">{times.offset} minutes</div>
        </div>

        <div className="bg-green-900 p-6 rounded border-2 border-green-500">
          <div className="text-sm text-green-300">BD Time Display (Should be 14:28):</div>
          <div className="text-6xl font-bold text-green-400">{bdTimeString}</div>
          <div className="text-sm text-green-300 mt-2">{times.bd}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Calculation: UTC + 6 hours</div>
          <div className="space-y-1">
            <div>BD Hours: {times.bdHours}</div>
            <div>BD Minutes: {times.bdMinutes}</div>
            <div>BD Seconds: {times.bdSeconds}</div>
          </div>
        </div>

        <div className="bg-yellow-900 p-4 rounded">
          <div className="text-sm text-yellow-300">Expected Now:</div>
          <div className="text-2xl">14:28:XX (2:28 PM Bangladesh Time)</div>
        </div>
      </div>
    </div>
  );
}
