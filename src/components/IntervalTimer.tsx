import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Plus, Trash2, Save, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Interval {
  id: string;
  minutes: number;
  seconds: number;
}

export const IntervalTimer = () => {
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [newMinutes, setNewMinutes] = useState("");
  const [newSeconds, setNewSeconds] = useState("");
  const [timerName, setTimerName] = useState("");
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const totalSeconds = intervals.reduce((acc, interval) => 
    acc + interval.minutes * 60 + interval.seconds, 0
  );

  const totalRemainingSeconds = intervals
    .slice(currentIntervalIndex)
    .reduce((acc, interval, index) => {
      if (index === 0) {
        return acc + remainingSeconds;
      }
      return acc + interval.minutes * 60 + interval.seconds;
    }, 0);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Check if there's a loaded timer
    const loadedTimer = localStorage.getItem("loadedTimer");
    const autoStart = localStorage.getItem("autoStartTimer");
    
    if (loadedTimer) {
      const timer = JSON.parse(loadedTimer);
      setIntervals(timer.intervals);
      setTimerName(timer.name);
      setEditingTimerId(timer.id || null);
      localStorage.removeItem("loadedTimer");
      
      // Auto-start if coming from "play" button - redirect to play page
      if (autoStart === "true") {
        localStorage.removeItem("autoStartTimer");
        navigate("/play");
      }
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
      // Interval completed
      playBeep(1);
      
      if (currentIntervalIndex < intervals.length - 1) {
        // Move to next interval
        setCurrentIntervalIndex((prev) => prev + 1);
        const nextInterval = intervals[currentIntervalIndex + 1];
        setRemainingSeconds(nextInterval.minutes * 60 + nextInterval.seconds);
      } else {
        // All intervals completed
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

  const addInterval = () => {
    const mins = parseInt(newMinutes) || 0;
    const secs = parseInt(newSeconds) || 0;
    
    if (mins === 0 && secs === 0) {
      toast({
        title: "Invalid interval",
        description: "Please enter a valid time.",
        variant: "destructive",
      });
      return;
    }

    const newInterval: Interval = {
      id: Date.now().toString(),
      minutes: mins,
      seconds: secs,
    };

    setIntervals([...intervals, newInterval]);
    setNewMinutes("");
    setNewSeconds("");
  };

  const removeInterval = (id: string) => {
    setIntervals(intervals.filter((interval) => interval.id !== id));
  };

  const moveIntervalUp = (index: number) => {
    if (index === 0) return;
    const newIntervals = [...intervals];
    [newIntervals[index - 1], newIntervals[index]] = [newIntervals[index], newIntervals[index - 1]];
    setIntervals(newIntervals);
  };

  const moveIntervalDown = (index: number) => {
    if (index === intervals.length - 1) return;
    const newIntervals = [...intervals];
    [newIntervals[index], newIntervals[index + 1]] = [newIntervals[index + 1], newIntervals[index]];
    setIntervals(newIntervals);
  };

  const startTimer = () => {
    if (intervals.length === 0) {
      toast({
        title: "No intervals",
        description: "Please add at least one interval.",
        variant: "destructive",
      });
      return;
    }

    if (remainingSeconds === 0 && !isRunning) {
      // Starting fresh
      setCurrentIntervalIndex(0);
      setRemainingSeconds(intervals[0].minutes * 60 + intervals[0].seconds);
    }
    
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentIntervalIndex(0);
    setRemainingSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const saveTimer = () => {
    if (intervals.length === 0) {
      toast({
        title: "No intervals",
        description: "Add at least one interval before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!timerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your timer.",
        variant: "destructive",
      });
      return;
    }

    const savedTimers = JSON.parse(localStorage.getItem("savedTimers") || "[]");
    
    if (editingTimerId) {
      // Update existing timer
      const timerIndex = savedTimers.findIndex((t: any) => t.id === editingTimerId);
      if (timerIndex !== -1) {
        savedTimers[timerIndex] = {
          ...savedTimers[timerIndex],
          name: timerName,
          intervals,
        };
        toast({
          title: "Timer updated!",
          description: `"${timerName}" has been updated.`,
        });
      }
    } else {
      // Create new timer
      const newTimer = {
        id: Date.now().toString(),
        name: timerName,
        intervals,
        createdAt: new Date().toISOString(),
      };
      savedTimers.push(newTimer);
      toast({
        title: "Timer saved!",
        description: `"${timerName}" has been saved to your timers.`,
      });
    }

    localStorage.setItem("savedTimers", JSON.stringify(savedTimers));
    navigate("/timers");
  };

  const progress = intervals.length > 0 && remainingSeconds > 0
    ? ((intervals[currentIntervalIndex].minutes * 60 + intervals[currentIntervalIndex].seconds - remainingSeconds) /
        (intervals[currentIntervalIndex].minutes * 60 + intervals[currentIntervalIndex].seconds)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pb-safe">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1 space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              GOOD TIMES
            </h1>
            <p className="text-muted-foreground">Build and run custom interval timers</p>
          </div>
        </div>

        {/* Timer Display */}
        <Card className="p-8 shadow-lg border-2 bg-gradient-to-br from-card to-card/80">
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="hsl(var(--border))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
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
                <div className="text-5xl font-bold tabular-nums">
                  {formatTime(remainingSeconds)}
                </div>
                {intervals.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Interval {currentIntervalIndex + 1} of {intervals.length}
                  </div>
                )}
              </div>
            </div>

            {totalRemainingSeconds > 0 && (
              <div className="text-sm text-muted-foreground">
                Total remaining: {formatTime(totalRemainingSeconds)}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 justify-center pt-4">
              <Button
                size="lg"
                onClick={isRunning ? pauseTimer : startTimer}
                className="rounded-full w-16 h-16 p-0 shadow-lg"
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="rounded-full w-16 h-16 p-0"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Timer Name */}
        <Card className="p-6 shadow-md">
          <h3 className="font-semibold mb-4">Timer Name</h3>
          <Input
            type="text"
            placeholder="e.g., Morning Workout"
            value={timerName}
            onChange={(e) => setTimerName(e.target.value)}
          />
        </Card>

        {/* Add Interval */}
        <Card className="p-6 shadow-md">
          <h3 className="font-semibold mb-4">Add Interval</h3>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value)}
              className="text-center"
              min="0"
            />
            <Input
              type="number"
              placeholder="Sec"
              value={newSeconds}
              onChange={(e) => setNewSeconds(e.target.value)}
              className="text-center"
              min="0"
              max="59"
            />
            <Button onClick={addInterval} size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Intervals List */}
        {intervals.length > 0 && (
          <Card className="p-6 shadow-md">
            <h3 className="font-semibold mb-4">Intervals ({intervals.length})</h3>
            <div className="space-y-2">
              {intervals.map((interval, index) => (
                <div
                  key={interval.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    index === currentIntervalIndex && isRunning
                      ? "bg-primary/10 border-2 border-primary/30"
                      : "bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-mono text-lg">
                      {interval.minutes}m {interval.seconds}s
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveIntervalUp(index)}
                      disabled={isRunning || index === 0}
                      className="h-8 w-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveIntervalDown(index)}
                      disabled={isRunning || index === intervals.length - 1}
                      className="h-8 w-8"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInterval(interval.id)}
                      disabled={isRunning}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {totalSeconds > 0 && (
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                Total duration: {formatTime(totalSeconds)}
              </div>
            )}
          </Card>
        )}

        {/* Save Timer Button */}
        {intervals.length > 0 && (
          <Button
            onClick={saveTimer}
            size="lg"
            className="w-full shadow-lg"
          >
            <Save className="mr-2 h-5 w-5" />
            Save Timer
          </Button>
        )}
      </div>
    </div>
  );
};
