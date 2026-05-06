import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Appli | ACE CARDS", 
  description: "Apply to become a member of the ACE CARDS organization.",
};

export default function MemberAppliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full mx-auto max-w-[1920px]">
      {children}
    </div>
  );
}