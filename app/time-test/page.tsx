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
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bdTime = new Date(utcTime + (6 * 60 * 60 * 1000));
      
      setTimes({
        raw: now.toString(),
        utc: now.toISOString(),
        bd: bdTime.toISOString(),
        bdHours: bdTime.getUTCHours(),
        bdMinutes: bdTime.getUTCMinutes(),
        bdSeconds: bdTime.getUTCSeconds(),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const bdTimeString = `${String(times.bdHours).padStart(2, '0')}:${String(times.bdMinutes).padStart(2, '0')}:${String(times.bdSeconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Time Debug Page</h1>
      
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
          <div className="text-sm text-gray-400">BD Time (ISO):</div>
          <div className="text-xl">{times.bd}</div>
        </div>

        <div className="bg-green-900 p-6 rounded border-2 border-green-500">
          <div className="text-sm text-green-300">BD Time Display (Should be 14:24):</div>
          <div className="text-6xl font-bold text-green-400">{bdTimeString}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Calculation Details:</div>
          <div className="space-y-1">
            <div>BD Hours: {times.bdHours}</div>
            <div>BD Minutes: {times.bdMinutes}</div>
            <div>BD Seconds: {times.bdSeconds}</div>
          </div>
        </div>

        <div className="bg-yellow-900 p-4 rounded">
          <div className="text-sm text-yellow-300">Expected:</div>
          <div className="text-2xl">14:24:XX (2:24 PM Bangladesh Time)</div>
        </div>
      </div>
    </div>
  );
}
