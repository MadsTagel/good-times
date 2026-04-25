import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, Play, Pencil, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SavedTimer {
  id: string;
  name: string;
  intervals: Array<{ id: string; minutes: number; seconds: number }>;
  createdAt: string;
}

const SavedTimers = () => {
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timers = localStorage.getItem("savedTimers");
    if (timers) setSavedTimers(JSON.parse(timers));
  }, []);

  const deleteTimer = (id: string) => {
    const updated = savedTimers.filter((t) => t.id !== id);
    setSavedTimers(updated);
    localStorage.setItem("savedTimers", JSON.stringify(updated));
    toast({ title: "Timer deleted" });
  };

  const playTimer = (timer: SavedTimer) => {
    localStorage.setItem("playTimer", JSON.stringify(timer));
    navigate("/play");
  };

  const editTimer = (timer: SavedTimer) => {
    localStorage.setItem("loadedTimer", JSON.stringify(timer));
    navigate("/create");
  };

  const formatTotalTime = (intervals: SavedTimer["intervals"]) => {
    const total = intervals.reduce((acc, i) => acc + i.minutes * 60 + i.seconds, 0);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background pt-6 px-5 pb-10">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-2xl font-bold">My Timers</h1>
            <p className="text-muted-foreground text-sm">Your saved interval timers</p>
          </div>
        </div>

        {savedTimers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-6">
              <Clock className="w-9 h-9 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No timers yet</h3>
            <p className="text-muted-foreground mb-8">Create your first interval timer to get started</p>
            <button
              onClick={() => navigate("/create")}
              className="h-12 px-8 rounded-full bg-white text-gray-900 font-semibold hover:bg-white/90 transition-colors"
            >
              Create New Timer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedTimers.map((timer) => (
              <div key={timer.id} className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-sans text-lg font-semibold">{timer.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {timer.intervals.length} intervals · {formatTotalTime(timer.intervals)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => playTimer(timer)}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Play className="w-4 h-4 text-background ml-0.5" fill="currentColor" />
                    </button>
                    <button
                      onClick={() => editTimer(timer)}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTimer(timer.id)}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {timer.intervals.map((interval, index) => (
                    <span
                      key={interval.id}
                      className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-mono"
                    >
                      {index + 1}. {interval.minutes}m {interval.seconds}s
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SavedTimers;
