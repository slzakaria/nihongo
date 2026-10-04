'use client'

import { useAudio } from '@/hooks/useAudio'
import { AudioIconButton } from '@/components/phrases/AudioIconButton'

export function AudioButton({ text, className }: { text: string; className?: string }) {
  const { play, isLoading, isPlaying } = useAudio()

  return (
    <AudioIconButton
      isLoading={isLoading}
      isPlaying={isPlaying}
      onClick={() => play(text)}
      className={className}
    />
  )
}
