import { Phrase } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function KanaCard({ kana }: { kana: Phrase }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <p lang="ja" className="text-4xl font-medium">
              {kana.japanese}
            </p>
            <div>
              <p className="text-sm font-medium">{kana.romaji}</p>
              <p className="text-xs text-muted-foreground">{kana.english}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={kana.difficulty === 'core' ? 'default' : 'secondary'}>{kana.difficulty}</Badge>
          </div>
        </div>

        {kana.notes && <p className="text-xs text-muted-foreground">{kana.notes}</p>}

        {kana.responses.length > 0 && (
          <ul className="flex flex-col gap-2 border-l-2 border-border pl-3">
            {kana.responses.map((word, i) => (
              <li key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p lang="ja" className="text-sm font-medium">
                    {word.japanese}
                  </p>
                  <span className="text-xs text-muted-foreground">{word.romaji}</span>
                </div>
                <p className="text-xs text-muted-foreground">{word.english}</p>
                <p className="text-xs italic text-muted-foreground">{word.listen_for}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
