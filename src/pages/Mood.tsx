import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfDay } from "date-fns";

const MOODS = [
  { value: 1, emoji: "😢", label: "Very Sad" },
  { value: 2, emoji: "😕", label: "Sad" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Happy" },
  { value: 5, emoji: "😄", label: "Very Happy" },
];

interface MoodEntry {
  id: string;
  mood_value: number;
  note: string | null;
  created_at: string;
}

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [weekData, setWeekData] = useState<number[]>([]);
  const { toast } = useToast();
  const sessionId = getSessionId();

  useEffect(() => {
    loadMoodEntries();
  }, []);

  async function loadMoodEntries() {
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error loading moods:", error);
      return;
    }

    if (data) {
      setEntries(data);
      calculateWeekTrend(data);
    }
  }

  function calculateWeekTrend(data: MoodEntry[]) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dayEntries = data.filter(entry => {
        const entryDate = startOfDay(new Date(entry.created_at));
        return entryDate.getTime() === date.getTime();
      });
      
      if (dayEntries.length === 0) return 3; // Default neutral
      return Math.round(
        dayEntries.reduce((sum, e) => sum + e.mood_value, 0) / dayEntries.length
      );
    });
    
    setWeekData(last7Days);
  }

  async function saveMood() {
    if (!selectedMood) return;

    const { error } = await supabase.from("mood_entries").insert({
      session_id: sessionId,
      mood_value: selectedMood,
      note: note.trim() || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Mood logged!",
      description: "Your mood has been recorded.",
    });

    setSelectedMood(null);
    setNote("");
    loadMoodEntries();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      
      <main className="flex-1 pt-20 pb-24 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className="text-3xl font-bold mb-6">How are you feeling?</h1>
            
            <div className="flex justify-center gap-4 mb-6">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    selectedMood === mood.value
                      ? "scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`text-5xl rounded-full p-3 transition-all ${
                      selectedMood === mood.value
                        ? "bg-primary/20 ring-4 ring-primary"
                        : "hover:bg-secondary"
                    }`}
                  >
                    {mood.emoji}
                  </div>
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about how you're feeling... (optional)"
                  className="min-h-[100px] glass"
                />
                <Button onClick={saveMood} className="w-full">
                  Log Mood
                </Button>
              </div>
            )}
          </div>

          {weekData.length > 0 && (
            <Card className="glass p-6">
              <h2 className="text-xl font-bold mb-4">7-Day Trend</h2>
              <div className="flex items-end justify-between gap-2 h-32">
                {weekData.map((value, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all"
                      style={{ height: `${(value / 5) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {format(subDays(new Date(), 6 - i), "EEE")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {entries.slice(0, 3).map((entry) => (
              <Card key={entry.id} className="glass p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {MOODS.find(m => m.value === entry.mood_value)?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {format(new Date(entry.created_at), "EEEE, MMMM d")}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Note: {entry.note}
                      </p>
                    )}
                    {!entry.note && (
                      <p className="text-sm text-muted-foreground mt-1">
                        No note added.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
