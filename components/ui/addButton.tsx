import Link from "next/link";

interface AddButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
}

export default function AddButton({ label, href, onClick }: AddButtonProps) {
  // Shared styling across both variants
  const buttonClassName = 
    "w-full md:w-auto bg-[#eec643] text-[#011638] px-6 py-2.5 rounded-lg " +
    "hover:bg-[#d9b237] flex items-center justify-center gap-2 font-oswald " +
    "transition-all active:scale-95 cursor-pointer";

  // Shared Plus Icon
  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className={buttonClassName}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClassName}>
      {icon}
      {label}
    </button>
  );
}