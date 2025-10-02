import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, Clock } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col justify-between pt-[30px] pb-[30px] px-4">
      <div className="max-w-2xl w-full mx-auto text-center">
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            GOOD TIMES
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Build and run custom interval timers
          </p>
        </div>

      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
          <Button
            size="lg"
            onClick={() => navigate("/create")}
            className="w-full sm:w-auto text-lg h-16 px-8 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-6 w-6" />
            Create New Timer
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/timers")}
            className="w-full sm:w-auto text-lg h-16 px-8 border-2"
          >
            <Clock className="mr-2 h-6 w-6" />
            My Timers
          </Button>
      </div>
    </div>
  );
};

export default Home;
