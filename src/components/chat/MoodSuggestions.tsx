import { Button } from '@/components/ui/button';
import { Mood } from '@/types/met';

interface MoodSuggestionsProps {
  onSelectMood: (mood: string) => void;
  isLoading: boolean;
}

const MOOD_SUGGESTIONS: { mood: Mood; label: string; emoji: string }[] = [
  { mood: 'happy', label: 'Make me happy', emoji: '😊' },
  { mood: 'peaceful', label: 'I need peace', emoji: '🕊️' },
  { mood: 'energized', label: 'Excite me', emoji: '🔥' },
  { mood: 'inspired', label: 'Inspire me', emoji: '✨' },
  { mood: 'mysterious', label: 'Show me mystery', emoji: '🌙' },
  { mood: 'sad', label: 'I feel melancholy', emoji: '🌧️' },
];

export const MoodSuggestions = ({ onSelectMood, isLoading }: MoodSuggestionsProps) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Or choose a mood below:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {MOOD_SUGGESTIONS.map(({ mood, label, emoji }) => (
          <Button
            key={mood}
            variant="outline"
            size="sm"
            onClick={() => onSelectMood(`I want to feel ${mood}`)}
            disabled={isLoading}
            className="justify-start gap-2 h-auto py-3 px-3 text-left bg-card hover:bg-accent/50 border-border/50"
          >
            <span className="text-base">{emoji}</span>
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};