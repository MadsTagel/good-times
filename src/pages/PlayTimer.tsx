import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, X } from "lucide-react";
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

  const totalRemainingSeconds = intervals
    .slice(currentIntervalIndex)
    .reduce((acc, interval, index) => {
      if (index === 0) return acc + remainingSeconds;
      return acc + interval.minutes * 60 + interval.seconds;
    }, 0);

  const progress = intervals.length > 0 && remainingSeconds > 0
    ? ((intervals[currentIntervalIndex].minutes * 60 + intervals[currentIntervalIndex].seconds - remainingSeconds) /
        (intervals[currentIntervalIndex].minutes * 60 + intervals[currentIntervalIndex].seconds)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pb-safe flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{timerName}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/timers")}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Timer Display */}
        <Card className="p-12 shadow-lg border-2 bg-gradient-to-br from-card to-card/80">
          <div className="text-center space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="hsl(var(--border))"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-7xl font-bold tabular-nums">
                  {formatTime(remainingSeconds)}
                </div>
                {intervals.length > 0 && (
                  <div className="text-lg text-muted-foreground mt-3">
                    Interval {currentIntervalIndex + 1} of {intervals.length}
                  </div>
                )}
              </div>
            </div>

            {totalRemainingSeconds > 0 && (
              <div className="text-base text-muted-foreground">
                Total remaining: {formatTime(totalRemainingSeconds)}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-4 justify-center pt-6">
              <Button
                size="lg"
                onClick={isRunning ? pauseTimer : resumeTimer}
                className="rounded-full w-20 h-20 p-0 shadow-lg text-lg"
              >
                {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="rounded-full w-20 h-20 p-0"
              >
                <RotateCcw className="h-7 w-7" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Intervals List */}
        <Card className="p-6 shadow-md">
          <h3 className="font-semibold mb-4 text-lg">Intervals</h3>
          <div className="space-y-2">
            {intervals.map((interval, index) => (
              <div
                key={interval.id}
                className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                  index === currentIntervalIndex
                    ? "bg-primary/20 border-2 border-primary scale-105"
                    : index < currentIntervalIndex
                    ? "bg-muted/50 opacity-50"
                    : "bg-secondary"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold ${
                  index === currentIntervalIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                <span className="font-mono text-xl">
                  {interval.minutes}m {interval.seconds}s
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlayTimer;
