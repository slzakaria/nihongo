import { SRSGrade } from '@/types';

export const FLASHCARD_RATINGS: {
  label: string;
  shortcut: string;
  grade: SRSGrade;
  style: string;
}[] = [
  { label: 'Again', shortcut: '1', grade: 'again', style: 'again' },
  { label: 'Hard', shortcut: '2', grade: 'hard', style: 'hard' },
  { label: 'Good', shortcut: '3', grade: 'good', style: 'good' },
  { label: 'Easy', shortcut: '4', grade: 'easy', style: 'easy' },
];
