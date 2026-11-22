import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hiragana and Katakana",
  description:
    "Learn the hiragana and katakana syllabaries row by row, with spaced-repetition practice.",
  alternates: { canonical: "/kana" },
};

export default function KanaLayout({ children }: LayoutProps<"/kana">) {
  return children;
}
