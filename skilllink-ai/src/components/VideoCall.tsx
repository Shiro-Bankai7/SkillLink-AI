import { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';

export default function VideoCall() {
  const callRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roomUrl = "https://shiroi.daily.co/ss";
    if (!roomUrl || typeof roomUrl !== 'string') {
      setError('Video room URL is not configured. Please contact support.');
      return;
    }
    if (!callRef.current) return;
    // Prevent duplicate instances
    if (callRef.current.childElementCount > 0) return;

    const callFrame = DailyIframe.createFrame(callRef.current, {
      showLeaveButton: true,
      iframeStyle: {
        position: 'relative',
        width: '100%',
        height: '100%',
        border: '1px solid #ccc',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px 0 rgba(80, 80, 180, 0.10)',
      },
    });

    callFrame.join({ url: roomUrl });

    return () => {
      callFrame.leave();
      if (callRef.current) {
        callRef.current.innerHTML = '';
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] max-w-full w-full rounded-lg bg-red-50 text-red-600 font-semibold border border-red-200 overflow-hidden">
        {error}
      </div>
    );
  }

  return (
    <div
      className="h-[400px] max-h-[400px] w-full max-w-full rounded-2xl shadow-lg border border-gray-200 bg-white overflow-auto flex items-center justify-center"
      style={{ minWidth: 0 }}
      ref={callRef}
    ></div>
  );
}
