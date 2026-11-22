import { SRSGrade } from '@/types';

export const FLASHCARD_RATINGS: {
  label: string;
  shortcut: string;
  grade: SRSGrade;
  style: string;
}[] = [
  { label: 'Again', shortcut: '1', grade: 0, style: 'again' },
  { label: 'Hard', shortcut: '2', grade: 2, style: 'hard' },
  { label: 'Medium', shortcut: '3', grade: 3, style: 'medium' },
  { label: 'Easy', shortcut: '4', grade: 4, style: 'easy' },
  { label: 'Expert', shortcut: '5', grade: 5, style: 'expert' },
];
