"use client";

import { useState } from "react";
import { QUIZ_QUESTIONS, type QuizQ } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Brain, CheckCircle2, XCircle, Trophy, Coins, Star, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function QuizPanel() {
  const { quizAnswered, quizCorrect, recordQuiz } = useGameStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  // FIX: snapshot de la pregunta en curso. Antes "available" se recalculaba al responder
  // (recordQuiz añade el id) y "current" saltaba a la SIGUIENTE pregunta ya revelada,
  // mostrando su respuesta correcta en verde sin haberla respondido.
  const [lockedQ, setLockedQ] = useState<QuizQ | null>(null);

  const available = QUIZ_QUESTIONS.filter((q) => !quizAnswered.includes(q.id));
  const current = lockedQ ?? available[0] ?? QUIZ_QUESTIONS[0];
  const allDone = !lockedQ && available.length === 0;

  const handleSelect = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    setLockedQ(current); // congela la pregunta mientras se muestra la explicación
    const correct = i === current.answerIdx;
    recordQuiz(current.id, correct, current.xpReward, current.coinReward);
    if (correct) {
      setStreak((s) => s + 1);
      toast.success(`Correcto! +${current.coinReward} monedas · +${current.xpReward} XP`, {
        description: current.explanation,
      });
    } else {
      setStreak(0);
      toast.error("Incorrecto", { description: current.explanation });
    }
  };

  const handleNext = () => {
    setSelected(null);
    setRevealed(false);
    setLockedQ(null); // libera el snapshot → "current" pasa a la siguiente sin responder
  };

  const handleReset = () => {
    // reset answered quizzes so player can replay
    useGameStore.setState({ quizAnswered: [], quizCorrect: 0 });
    setSelected(null);
    setRevealed(false);
    setLockedQ(null);
    toast.success("Quiz reiniciado · puedes volver a responder");
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Quiz geopolitico"
        subtitle="Pon a prueba tu conocimiento · gana recompensas"
        icon={<Brain className="w-4 h-4 text-green-hud" />}
        color="green"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-green-hud">{quizCorrect}/{QUIZ_QUESTIONS.length}</span>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-amber">
                <Trophy className="w-3 h-3" /> {streak}x
              </span>
            )}
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-2">
        <StatBox label="Aciertos" value={quizCorrect} color="text-green-hud" />
        <StatBox label="Respondidas" value={quizAnswered.length} color="text-cyan-hud" />
        <StatBox label="Racha actual" value={streak} color="text-amber" />
      </div>

      {allDone ? (
        <div className="hud-corner p-6 text-center">
          <Trophy className="w-10 h-10 mx-auto text-amber mb-2" />
          <div className="text-lg font-mono font-bold text-amber">¡Has completado todos los quizzes!</div>
          <p className="text-xs text-muted-foreground mt-1 mb-3">Acertaste {quizCorrect} de {QUIZ_QUESTIONS.length} preguntas</p>
          <Button onClick={handleReset} className="bg-amber-hud text-amber hover:bg-amber-hud/80 font-mono uppercase">
            <RotateCw className="w-3 h-3 mr-1" /> Reiniciar quiz
          </Button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="hud-corner p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-green-hud text-green-hud bg-green-hud/30 uppercase">
                {current.category}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud text-amber bg-amber-hud/30 uppercase">
                {current.difficulty}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                {quizAnswered.length + (lockedQ ? 0 : 1)}/{QUIZ_QUESTIONS.length}
              </span>
            </div>

            <h3 className="text-base font-medium text-foreground mb-4">{current.question}</h3>

            <div className="grid sm:grid-cols-2 gap-2 mb-3">
              {current.options.map((opt, i) => {
                const isAnswer = i === current.answerIdx;
                const isSelected = i === selected;
                let style = "border-border hover:border-amber-hud hover:bg-amber-hud/20 text-foreground";
                if (revealed) {
                  if (isAnswer) style = "border-green-hud bg-green-hud/30 text-green-hud";
                  else if (isSelected) style = "border-red-hud bg-red-hud/30 text-red-hud";
                  else style = "border-border text-muted-foreground";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={revealed}
                    className={cn(
                      "flex items-center gap-2 p-3 border rounded-sm text-left text-sm font-mono transition-all",
                      style
                    )}
                  >
                    <span className="w-5 h-5 flex items-center justify-center hud-corner border-current flex-shrink-0 text-[10px]">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isAnswer && <CheckCircle2 className="w-4 h-4 text-green-hud" />}
                    {revealed && isSelected && !isAnswer && <XCircle className="w-4 h-4 text-red-hud" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                <div className={cn(
                  "hud-corner p-3 mb-3 text-sm",
                  selected === current.answerIdx
                    ? "bg-green-hud/20 border-green-hud"
                    : "bg-red-hud/20 border-red-hud"
                )}>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
                    {selected === current.answerIdx ? "Correcto" : "Incorrecto"}
                  </div>
                  <p className="text-foreground">{current.explanation}</p>
                  {selected === current.answerIdx && (
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono">
                      <span className="flex items-center gap-0.5 text-amber">
                        <Coins className="w-3 h-3" /> +{current.coinReward}
                      </span>
                      <span className="flex items-center gap-0.5 text-cyan-hud">
                        <Star className="w-3 h-3" /> +{current.xpReward} XP
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full bg-amber-hud text-amber hover:bg-amber-hud/80 font-mono uppercase tracking-wider"
                >
                  Siguiente pregunta →
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="hud-corner p-3">
      <div className="text-[10px] font-mono text-muted-foreground uppercase">{label}</div>
      <div className={cn("text-2xl font-mono font-bold", color)}>{value}</div>
    </div>
  );
}
