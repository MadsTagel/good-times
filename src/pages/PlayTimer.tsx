import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Interval {
  id: string;
  minutes: number;
  seconds: number;
}

const PlayTimer = () => {
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerName, setTimerName] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTimer = localStorage.getItem("playTimer");
    if (playTimer) {
      const timer = JSON.parse(playTimer);
      setIntervals(timer.intervals);
      setTimerName(timer.name);
      setCurrentIntervalIndex(0);
      setRemainingSeconds(timer.intervals[0].minutes * 60 + timer.intervals[0].seconds);
      localStorage.removeItem("playTimer");
      
      // Auto-start
      setTimeout(() => setIsRunning(true), 100);
    } else {
      // No timer loaded, redirect back
      navigate("/timers");
    }
    
    return () => {
      audioContextRef.current?.close();
    };
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && remainingSeconds === 0 && currentIntervalIndex < intervals.length) {
      playBeep(1);
      
      if (currentIntervalIndex < intervals.length - 1) {
        setCurrentIntervalIndex((prev) => prev + 1);
        const nextInterval = intervals[currentIntervalIndex + 1];
        setRemainingSeconds(nextInterval.minutes * 60 + nextInterval.seconds);
      } else {
        setIsRunning(false);
        playBeep(3);
        toast({
          title: "Timer Complete!",
          description: "All intervals finished.",
        });
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, remainingSeconds, currentIntervalIndex, intervals]);

  const playBeep = (count: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
      }, i * 300);
    }
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentIntervalIndex(0);
    setRemainingSeconds(intervals[0]?.minutes * 60 + intervals[0]?.seconds || 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getNextInterval = () => {
    if (currentIntervalIndex < intervals.length - 1) {
      const nextInterval = intervals[currentIntervalIndex + 1];
      const nextTime = formatTime(nextInterval.minutes * 60 + nextInterval.seconds);
      const intervalType = (currentIntervalIndex + 1) % 2 === 0 ? "REST" : "ROUND";
      return `${intervalType} ${nextTime}`;
    }
    return null;
  };

  const getCurrentIntervalType = () => {
    return currentIntervalIndex % 2 === 0 ? "ROUND" : "REST";
  };

  const getButtonColor = () => {
    return currentIntervalIndex % 2 === 0 ? "bg-[#7FFF00]" : "bg-[#00FFFF]";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Section - Next Interval */}
      <div className="p-6 flex items-start justify-between">
        <div>
          {getNextInterval() && (
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {getNextInterval()}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/timers")}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Middle Section - Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-black text-xl">▶</span>
            <p className="text-xl text-black uppercase tracking-wide">
              {getCurrentIntervalType()} {currentIntervalIndex + 1}/{intervals.length}
            </p>
          </div>
          <div className="text-[10rem] leading-none font-bold tabular-nums text-black">
            {formatTime(remainingSeconds)}
          </div>
        </div>
      </div>

      {/* Bottom Section - Large Control Button */}
      <div
        className={`h-[45vh] w-full flex items-center justify-center cursor-pointer transition-colors duration-300 ${getButtonColor()}`}
        onClick={isRunning ? pauseTimer : resumeTimer}
      >
        {isRunning ? (
          <Pause className="w-20 h-20 text-black" fill="black" />
        ) : (
          <Play className="w-20 h-20 text-black ml-2" fill="black" />
        )}
      </div>
    </div>
  );
};

export default PlayTimer;
