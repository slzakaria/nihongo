import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scenarios",
  description:
    "Japanese phrases for everyday travel situations, from greetings and restaurants to onsen and trains.",
  alternates: { canonical: "/scenarios" },
};

export default function ScenariosLayout({
  children,
}: LayoutProps<"/scenarios">) {
  return children;
}
