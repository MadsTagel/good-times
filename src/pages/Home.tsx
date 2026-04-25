import { useNavigate } from "react-router-dom";
import { Plus, Clock } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-10">
      <div className="text-center">
        <h1 className="text-6xl font-black tracking-tight mb-3">GOOD TIMES</h1>
        <p className="text-muted-foreground text-lg">Build and run custom interval timers</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => navigate("/create")}
          className="w-full h-14 rounded-full bg-white text-gray-900 font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Timer
        </button>
        <button
          onClick={() => navigate("/timers")}
          className="w-full h-14 rounded-full border-2 border-white/25 text-white font-bold text-lg flex items-center justify-center gap-2 hover:border-white/40 transition-colors"
        >
          <Clock className="w-5 h-5" />
          My Timers
        </button>
      </div>
    </div>
  );
};

export default Home;
