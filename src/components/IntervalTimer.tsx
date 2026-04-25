import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Trash2, Save, ArrowLeft, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Interval {
  id: string;
  minutes: number;
  seconds: number;
}

interface SortableIntervalProps {
  interval: Interval;
  index: number;
  isActive: boolean;
  isRunning: boolean;
  onRemove: (id: string) => void;
}

const SortableInterval = ({ interval, index, isActive, isRunning, onRemove }: SortableIntervalProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: interval.id,
    disabled: isRunning,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${
        isActive ? "bg-primary/15 border border-primary/30" : "bg-muted"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className={isRunning ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="w-7 h-7 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <span className="font-mono text-base">
          {String(interval.minutes).padStart(2, "0")}:{String(interval.seconds).padStart(2, "0")}
        </span>
      </div>
      <button
        onClick={() => onRemove(interval.id)}
        disabled={isRunning}
        className="w-8 h-8 rounded-full hover:bg-destructive/20 flex items-center justify-center transition-colors disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </button>
    </div>
  );
};

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const totalSeconds = intervals.reduce((acc, i) => acc + i.minutes * 60 + i.seconds, 0);

  const totalRemainingSeconds = intervals.slice(currentIntervalIndex).reduce((acc, interval, index) => {
    if (index === 0) return acc + remainingSeconds;
    return acc + interval.minutes * 60 + interval.seconds;
  }, 0);

  const displaySeconds = isRunning || remainingSeconds > 0 ? totalRemainingSeconds : totalSeconds;

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const loadedTimer = localStorage.getItem("loadedTimer");
    if (loadedTimer) {
      const timer = JSON.parse(loadedTimer);
      setIntervals(timer.intervals);
      setTimerName(timer.name);
      setEditingTimerId(timer.id || null);
      localStorage.removeItem("loadedTimer");
    }
    return () => { audioContextRef.current?.close(); };
  }, []);

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

  const addInterval = () => {
    const mins = parseInt(newMinutes) || 0;
    const secs = parseInt(newSeconds) || 0;
    if (mins === 0 && secs === 0) {
      toast({ title: "Invalid interval", description: "Please enter a valid time.", variant: "destructive" });
      return;
    }
    setIntervals([...intervals, { id: Date.now().toString(), minutes: mins, seconds: secs }]);
    setNewMinutes("");
    setNewSeconds("");
  };

  const removeInterval = (id: string) => setIntervals(intervals.filter((i) => i.id !== id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setIntervals((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const startTimer = () => {
    if (intervals.length === 0) {
      toast({ title: "No intervals", description: "Please add at least one interval.", variant: "destructive" });
      return;
    }
    if (remainingSeconds === 0 && !isRunning) {
      setCurrentIntervalIndex(0);
      setRemainingSeconds(intervals[0].minutes * 60 + intervals[0].seconds);
    }
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentIntervalIndex(0);
    setRemainingSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const saveTimer = () => {
    if (intervals.length === 0) {
      toast({ title: "No intervals", description: "Add at least one interval before saving.", variant: "destructive" });
      return;
    }
    if (!timerName.trim()) {
      toast({ title: "Name required", description: "Please enter a name for your timer.", variant: "destructive" });
      return;
    }
    const saved = JSON.parse(localStorage.getItem("savedTimers") || "[]");
    if (editingTimerId) {
      const idx = saved.findIndex((t: any) => t.id === editingTimerId);
      if (idx !== -1) {
        saved[idx] = { ...saved[idx], name: timerName, intervals };
        toast({ title: "Timer updated!", description: `"${timerName}" has been updated.` });
      }
    } else {
      saved.push({ id: Date.now().toString(), name: timerName, intervals, createdAt: new Date().toISOString() });
      toast({ title: "Timer saved!", description: `"${timerName}" has been saved.` });
    }
    localStorage.setItem("savedTimers", JSON.stringify(saved));
    navigate("/timers");
  };

  const progress =
    intervals.length > 0 && remainingSeconds > 0
      ? ((intervals[currentIntervalIndex].minutes * 60 + intervals[currentIntervalIndex].seconds - remainingSeconds) /
          (intervals[currentIntervalIndex].minutes * 60 + intervals[currentIntervalIndex].seconds)) * 100
      : 0;

  const circumference = 2 * Math.PI * 88;

  return (
    <div className="min-h-screen bg-background pt-6 px-5 pb-10">
      <div className="max-w-md mx-auto space-y-5">

        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-2xl font-bold">Create Timer</h1>
            <p className="text-muted-foreground text-sm">Build a custom interval timer</p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-card rounded-3xl p-8 border border-border flex flex-col items-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <svg className="w-48 h-48 -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
              <circle
                cx="96" cy="96" r="88"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-sans text-5xl font-bold tabular-nums">{formatTime(remainingSeconds)}</div>
              {intervals.length > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  {currentIntervalIndex + 1} / {intervals.length}
                </div>
              )}
            </div>
          </div>

          {displaySeconds > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Total: {formatTime(displaySeconds)}
            </p>
          )}

          <div className="flex gap-4">
            <button
              onClick={isRunning ? () => setIsRunning(false) : startTimer}
              className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            >
              {isRunning ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-border transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timer Name */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block mb-3">Timer Name</label>
          <input
            type="text"
            placeholder="e.g. Morning Workout"
            value={timerName}
            onChange={(e) => setTimerName(e.target.value)}
            className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
          />
        </div>

        {/* Add Interval */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block mb-3">Add Interval</label>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value.replace(/\D/g, ""))}
              className="flex-1 bg-muted rounded-xl px-4 py-3 text-center text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Sec"
              value={newSeconds}
              onChange={(e) => setNewSeconds(e.target.value.replace(/\D/g, ""))}
              className="flex-1 bg-muted rounded-xl px-4 py-3 text-center text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
            />
          </div>
          <button
            onClick={addInterval}
            className="w-full h-11 rounded-xl bg-primary text-background font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Interval
          </button>
        </div>

        {/* Intervals List */}
        {intervals.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Intervals ({intervals.length})
              </label>
              {totalSeconds > 0 && (
                <span className="text-sm text-muted-foreground font-mono">{formatTime(totalSeconds)} total</span>
              )}
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={intervals.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {intervals.map((interval, index) => (
                    <SortableInterval
                      key={interval.id}
                      interval={interval}
                      index={index}
                      isActive={index === currentIntervalIndex && isRunning}
                      isRunning={isRunning}
                      onRemove={removeInterval}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Save Button */}
        {intervals.length > 0 && (
          <button
            onClick={saveTimer}
            className="w-full h-14 rounded-full bg-white text-gray-900 font-semibold text-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Timer
          </button>
        )}
      </div>

    </div>
  );
};
