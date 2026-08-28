import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = React.useState<string>('09:41');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50/40 to-slate-100 flex flex-col items-center justify-start sm:py-4">
      {/* Mobile viewport container constrained to 430px max width */}
      <div
        id="mobile-container"
        className="w-full max-w-md bg-white min-h-screen sm:min-h-[860px] sm:max-h-[920px] sm:rounded-[36px] sm:shadow-[0_20px_60px_-15px_rgba(124,58,237,0.15)] sm:border-[8px] sm:border-slate-800 flex flex-col relative overflow-hidden"
      >
        {/* Status Bar simulation (Clean Android / iOS top look) */}
        <div className="w-full bg-white text-slate-800 px-6 pt-2.5 pb-1.5 flex items-center justify-between text-xs select-none z-30">
          <span className="font-semibold tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal size={13} className="stroke-[2.2px]" />
            <Wifi size={13} className="stroke-[2.2px]" />
            <Battery size={15} className="stroke-[2.2px] fill-slate-700" />
          </div>
        </div>

        {/* Dynamic content scrollable area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-20 relative bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};
