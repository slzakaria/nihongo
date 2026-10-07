'use client'

import { useAudio } from '@/hooks/useAudio'
import { AudioIconButton } from '@/components/phrases/AudioIconButton'

export function AudioButton({
  text,
  className,
  onPlay,
}: {
  text: string
  className?: string
  onPlay?: () => void
}) {
  const { play, isLoading, isPlaying } = useAudio()

  return (
    <AudioIconButton
      isLoading={isLoading}
      isPlaying={isPlaying}
      onClick={() => {
        onPlay?.()
        play(text)
      }}
      className={className}
    />
  )
}
