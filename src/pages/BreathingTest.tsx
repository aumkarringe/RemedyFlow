import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wind, Play, Pause, RotateCcw, Timer, Heart, Zap, Moon, Focus } from "lucide-react";

type BreathingExercise = {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter?: number;
  cycles: number;
  icon: React.ReactNode;
  benefits: string[];
  color: string;
};

const exercises: BreathingExercise[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Navy SEAL technique for stress relief and focus",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    cycles: 4,
    icon: <Focus className="w-6 h-6" />,
    benefits: ["Reduces stress", "Improves focus", "Calms anxiety"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "478",
    name: "4-7-8 Relaxing Breath",
    description: "Dr. Andrew Weil's technique for sleep and relaxation",
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    icon: <Moon className="w-6 h-6" />,
    benefits: ["Promotes sleep", "Reduces anxiety", "Lowers heart rate"],
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "energizing",
    name: "Energizing Breath",
    description: "Quick technique to boost energy and alertness",
    inhale: 2,
    hold: 0,
    exhale: 2,
    cycles: 10,
    icon: <Zap className="w-6 h-6" />,
    benefits: ["Increases energy", "Improves alertness", "Boosts oxygen"],
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "calm",
    name: "Calming Breath",
    description: "Simple technique for immediate calm",
    inhale: 4,
    hold: 2,
    exhale: 6,
    cycles: 6,
    icon: <Heart className="w-6 h-6" />,
    benefits: ["Instant calm", "Heart coherence", "Emotional balance"],
    color: "from-pink-500 to-rose-500",
  },
];

type Phase = "inhale" | "hold" | "exhale" | "holdAfter" | "idle";

export default function BreathingTest() {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise>(exercises[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold": return "Hold";
      case "exhale": return "Breathe Out";
      case "holdAfter": return "Hold";
      default: return "Get Ready";
    }
  };

  const startExercise = () => {
    setIsRunning(true);
    setCurrentCycle(1);
    setPhase("inhale");
    setTimeLeft(selectedExercise.inhale);
    setCircleScale(1.5);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setPhase("idle");
    setCurrentCycle(0);
    setCircleScale(1);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetExercise = () => {
    stopExercise();
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === "inhale") {
            if (selectedExercise.hold > 0) {
              setPhase("hold");
              setCircleScale(1.5);
              return selectedExercise.hold;
            } else {
              setPhase("exhale");
              setCircleScale(1);
              return selectedExercise.exhale;
            }
          } else if (phase === "hold") {
            setPhase("exhale");
            setCircleScale(1);
            return selectedExercise.exhale;
          } else if (phase === "exhale") {
            if (selectedExercise.holdAfter && selectedExercise.holdAfter > 0) {
              setPhase("holdAfter");
              setCircleScale(1);
              return selectedExercise.holdAfter;
            } else {
              // Next cycle or finish
              if (currentCycle >= selectedExercise.cycles) {
                stopExercise();
                return 0;
              }
              setCurrentCycle((c) => c + 1);
              setPhase("inhale");
              setCircleScale(1.5);
              return selectedExercise.inhale;
            }
          } else if (phase === "holdAfter") {
            if (currentCycle >= selectedExercise.cycles) {
              stopExercise();
              return 0;
            }
            setCurrentCycle((c) => c + 1);
            setPhase("inhale");
            setCircleScale(1.5);
            return selectedExercise.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, currentCycle, selectedExercise]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Wind className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Breathing Exercises</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Breathing Test & Exercises
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Practice guided breathing techniques for stress relief, better sleep, and improved focus
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Exercise Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Choose Exercise</h2>
            {exercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => {
                    if (!isRunning) {
                      setSelectedExercise(exercise);
                    }
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedExercise.id === exercise.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${exercise.color} text-white`}>
                      {exercise.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.benefits.map((benefit, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Inhale: {exercise.inhale}s</span>
                        {exercise.hold > 0 && <span>Hold: {exercise.hold}s</span>}
                        <span>Exhale: {exercise.exhale}s</span>
                        {exercise.holdAfter && <span>Hold: {exercise.holdAfter}s</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Breathing Animation */}
          <div className="flex flex-col items-center justify-center">
            <Card className="w-full p-8 flex flex-col items-center">
              {/* Animated Circle */}
              <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                <motion.div
                  animate={{ scale: circleScale }}
                  transition={{ duration: phase === "inhale" ? selectedExercise.inhale : selectedExercise.exhale, ease: "easeInOut" }}
                  className={`absolute w-48 h-48 rounded-full bg-gradient-to-br ${selectedExercise.color} opacity-20`}
                />
                <motion.div
                  animate={{ scale: circleScale }}
                  transition={{ duration: phase === "inhale" ? selectedExercise.inhale : selectedExercise.exhale, ease: "easeInOut" }}
                  className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${selectedExercise.color} opacity-40`}
                />
                <motion.div
                  animate={{ scale: circleScale }}
                  transition={{ duration: phase === "inhale" ? selectedExercise.inhale : selectedExercise.exhale, ease: "easeInOut" }}
                  className={`absolute w-24 h-24 rounded-full bg-gradient-to-br ${selectedExercise.color} flex items-center justify-center`}
                >
                  <span className="text-2xl font-bold text-white">
                    {isRunning ? timeLeft : ""}
                  </span>
                </motion.div>
              </div>

              {/* Status */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {getPhaseInstruction()}
                  </h3>
                  {isRunning && (
                    <p className="text-sm text-muted-foreground">
                      Cycle {currentCycle} of {selectedExercise.cycles}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex gap-4">
                {!isRunning ? (
                  <Button onClick={startExercise} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Start Exercise
                  </Button>
                ) : (
                  <>
                    <Button onClick={stopExercise} variant="outline" size="lg" className="gap-2">
                      <Pause className="w-5 h-5" />
                      Pause
                    </Button>
                    <Button onClick={resetExercise} variant="ghost" size="lg" className="gap-2">
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </Button>
                  </>
                )}
              </div>

              {/* Timer Info */}
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span>
                  Total time: ~{(selectedExercise.inhale + selectedExercise.hold + selectedExercise.exhale + (selectedExercise.holdAfter || 0)) * selectedExercise.cycles}s
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
