import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Clock, Home as HomeIcon } from "lucide-react";

const ClockFace = () => (
  <svg viewBox="0 0 100 100" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="38" />
    <line x1="50" y1="14" x2="50" y2="20" />
    <line x1="86" y1="50" x2="80" y2="50" />
    <line x1="50" y1="86" x2="50" y2="80" />
    <line x1="14" y1="50" x2="20" y2="50" />
    <line x1="50" y1="50" x2="50" y2="29" strokeWidth="3" />
    <line x1="50" y1="50" x2="65" y2="57" strokeWidth="3" />
    <circle cx="50" cy="50" r="2.5" fill="currentColor" />
    <path d="M 37 63 Q 50 74 63 63" />
    <circle cx="39" cy="47" r="2.5" fill="currentColor" />
    <circle cx="61" cy="47" r="2.5" fill="currentColor" />
  </svg>
);

const BottomNav = ({ active }: { active: string }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-10 pb-2">
      <button
        onClick={() => navigate("/")}
        className="flex flex-col items-center gap-1"
      >
        <HomeIcon className={`w-6 h-6 ${active === "home" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${active === "home" ? "text-primary" : "text-muted-foreground"}`}>Home</span>
      </button>
      <button
        onClick={() => navigate("/create")}
        className="flex flex-col items-center gap-1"
      >
        <Plus className={`w-6 h-6 ${active === "create" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${active === "create" ? "text-primary" : "text-muted-foreground"}`}>Create</span>
      </button>
      <button
        onClick={() => navigate("/timers")}
        className="flex flex-col items-center gap-1"
      >
        <Clock className={`w-6 h-6 ${active === "timers" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs ${active === "timers" ? "text-primary" : "text-muted-foreground"}`}>Timers</span>
      </button>
    </div>
  );
};

export { BottomNav };

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 pb-24 pt-16">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center">

        <div className="w-56 h-56 rounded-full bg-secondary/20 flex items-center justify-center mb-10 text-foreground">
          <ClockFace />
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-3">GOOD TIMES</h1>
        <p className="text-muted-foreground text-lg mb-12">Build and run custom interval timers</p>

        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/create")}
            className="w-full h-14 rounded-full bg-white text-gray-900 font-semibold text-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Timer
          </button>
          <button
            onClick={() => navigate("/timers")}
            className="w-full h-14 rounded-full border-2 border-white/25 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:border-white/40 transition-colors"
          >
            <Clock className="w-5 h-5" />
            My Timers
          </button>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
};

export default Home;
