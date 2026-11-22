import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Hanazono - Survival Japanese" },
  description:
    "Survival Japanese for your trip: phrases, flashcards, and a live conversation simulator.",
  alternates: { canonical: "/" },
};

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return children;
}
