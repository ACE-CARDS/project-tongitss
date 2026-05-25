export default function BottomBlur() {
  return (
    <div className="
      fixed bottom-0 left-0 z-[20]
      w-full h-18 sm:h-20 md:h-22 lg:h-24 
      backdrop-blur-xl mask-[linear-gradient(to_top,black_20%,transparent)] 
      pointer-events-none" />
  );
}