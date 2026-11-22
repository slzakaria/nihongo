import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BilingualText } from '@/components/layout/BilingualText';

// Practical etiquette for a scenario, shown above its phrase list
export function EtiquetteCard({ tips }: { tips: string[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold">
            <BilingualText english="Good to know" japanese="しっておくとよいこと" />
          </h2>
        </div>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
