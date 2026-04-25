import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, X, RotateCcw } from "lucide-react";
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
  const [isComplete, setIsComplete] = useState(false);
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
      setTimeout(() => setIsRunning(true), 100);
    } else {
      navigate("/timers");
    }
    return () => { audioContextRef.current?.close(); };
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && remainingSeconds > 0) {
      timer = setInterval(() => setRemainingSeconds((prev) => prev - 1), 1000);
    } else if (isRunning && remainingSeconds === 0 && currentIntervalIndex < intervals.length) {
      playBeep(1);
      if (currentIntervalIndex < intervals.length - 1) {
        setCurrentIntervalIndex((prev) => prev + 1);
        const next = intervals[currentIntervalIndex + 1];
        setRemainingSeconds(next.minutes * 60 + next.seconds);
      } else {
        setIsRunning(false);
        setIsComplete(true);
        playBeep(3);
        toast({ title: "Timer Complete!", description: "All intervals finished." });
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingSeconds, currentIntervalIndex, intervals]);

  const playBeep = (count: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }, i * 300);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsComplete(false);
    setCurrentIntervalIndex(0);
    setRemainingSeconds(intervals[0]?.minutes * 60 + intervals[0]?.seconds || 0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isRound = currentIntervalIndex % 2 === 0;
  const intervalType = isRound ? "ROUND" : "REST";
  const accentColor = isRound ? "#22D3EE" : "#F472B6";

  const getNextInterval = () => {
    if (currentIntervalIndex < intervals.length - 1) {
      const next = intervals[currentIntervalIndex + 1];
      const nextType = (currentIntervalIndex + 1) % 2 === 0 ? "ROUND" : "REST";
      return `Next: ${nextType} · ${formatTime(next.minutes * 60 + next.seconds)}`;
    }
    return "Last interval";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{timerName}</p>
          <p className="text-sm text-muted-foreground">{getNextInterval()}</p>
        </div>
        <button
          onClick={() => navigate("/timers")}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        <div
          className="text-xs font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
          style={{ color: accentColor, backgroundColor: `${accentColor}20` }}
        >
          {intervalType} {currentIntervalIndex + 1} / {intervals.length}
        </div>

        <div
          className="text-[9rem] leading-none font-bold tabular-nums"
          style={{ color: isComplete ? accentColor : "hsl(var(--foreground))" }}
        >
          {isComplete ? "DONE" : formatTime(remainingSeconds)}
        </div>

        {isComplete && (
          <p className="text-muted-foreground text-lg">Great work!</p>
        )}
      </div>

      {/* Bottom control */}
      <div
        className="h-[42vh] w-full flex items-center justify-center gap-8 cursor-pointer transition-colors duration-500"
        style={{ backgroundColor: `${accentColor}22` }}
        onClick={isComplete ? undefined : (isRunning ? () => setIsRunning(false) : () => setIsRunning(true))}
      >
        <button
          onClick={(e) => { e.stopPropagation(); resetTimer(); }}
          className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <div
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
          style={{ backgroundColor: accentColor }}
        >
          {isComplete ? (
            <Play className="w-10 h-10 text-background ml-1" fill="currentColor" onClick={resetTimer} />
          ) : isRunning ? (
            <Pause className="w-10 h-10 text-background" fill="currentColor" />
          ) : (
            <Play className="w-10 h-10 text-background ml-1" fill="currentColor" />
          )}
        </div>

        <div className="w-14 h-14" />
      </div>
    </div>
  );
};

export default PlayTimer;
