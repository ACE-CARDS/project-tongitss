import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | ACE CARDS",
  description: "Learn more about the mission, passion, and team behind ACE CARDS.",
};

export default function AboutUsLayout({
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