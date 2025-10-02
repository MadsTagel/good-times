import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, Play, ArrowLeft, Pencil } from "lucide-react";
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
    if (timers) {
      setSavedTimers(JSON.parse(timers));
    }
  }, []);

  const deleteTimer = (id: string) => {
    const updatedTimers = savedTimers.filter((timer) => timer.id !== id);
    setSavedTimers(updatedTimers);
    localStorage.setItem("savedTimers", JSON.stringify(updatedTimers));
    toast({
      title: "Timer deleted",
      description: "Your timer has been removed.",
    });
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
    const totalSeconds = intervals.reduce(
      (acc, interval) => acc + interval.minutes * 60 + interval.seconds,
      0
    );
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pb-safe">
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              My Timers
            </h1>
            <p className="text-muted-foreground mt-1">Your saved interval timers</p>
          </div>
        </div>

        {savedTimers.length === 0 ? (
          <Card className="p-12 text-center shadow-md">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No saved timers yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first interval timer to get started
            </p>
            <Button onClick={() => navigate("/create")}>
              Create New Timer
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedTimers.map((timer) => (
              <Card key={timer.id} className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  {/* Title and Buttons Row */}
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold">{timer.name}</h3>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="icon"
                        onClick={() => playTimer(timer)}
                        className="shadow-md"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => editTimer(timer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteTimer(timer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Intervals Count and Duration */}
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {timer.intervals.length} intervals
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTotalTime(timer.intervals)} total
                    </div>
                  </div>
                  
                  {/* Intervals Chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {timer.intervals.map((interval, index) => (
                      <div
                        key={interval.id}
                        className="text-xs bg-muted px-2 py-1 rounded-md font-mono"
                      >
                        {index + 1}. {interval.minutes}m {interval.seconds}s
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTimers;
