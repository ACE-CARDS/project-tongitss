export default function EventsHero() {
  return (
    <section className="relative pt-40 pb-24 px-5 flex flex-col items-center justify-center text-center overflow-hidden bg-[#fbfaf8] border-b-4 border-[#011638]">
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#011638 2px, transparent 2px)",
          backgroundSize: "30px 30px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-5xl lg:text-7xl font-extrabold text-[#011638] uppercase border-b-8 border-[#011638] pb-4 mb-6 inline-block tracking-tight">
          TOURNAMENTS <br /> & MEETUPS
        </h1>

        <p className="text-[#b52f3f] font-black tracking-widest uppercase text-xl lg:text-2xl bg-white border-4 border-[#011638] px-8 py-3 rounded-full shadow-[6px_6px_0px_0px_rgba(1,22,56,1)] rotate-[-2deg]">
          ♠ Join the Community ♠
        </p>
      </div>
    </section>
  );
}
