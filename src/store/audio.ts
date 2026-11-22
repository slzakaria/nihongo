import { create } from 'zustand';

// Only one phrase can be loading or playing at a time across the whole app — otherwise clicking
// several voice buttons in a row fires overlapping TTS requests and stacks playback. `activeId`
// identifies which useAudio() instance currently owns playback, so only its button shows
// "playing" while every other button just shows disabled.
interface AudioStore {
  activeId: number | null;
  status: 'idle' | 'loading' | 'playing';
}

export const useAudioStore = create<AudioStore>(() => ({
  activeId: null,
  status: 'idle',
}));

let nextId = 0;
export function nextAudioId(): number {
  nextId += 1;
  return nextId;
}
