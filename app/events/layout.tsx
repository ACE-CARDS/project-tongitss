import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | ACE CARDS",
  description: "Join the ACE CARDS community at our upcoming tournaments, trade shows, and meetups.",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}