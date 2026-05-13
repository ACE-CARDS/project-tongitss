import Image from "next/image";

export default function Hero({id}: {id?: string}) {
  return (
    <section
      id={id || "hero"}
      className="
        relative min-h-[100dvh] flex items-center overflow-hidden
        px-[clamp(1.25rem,4vw,5rem)]
        py-[clamp(2rem,6vh,4rem)]
      "
    >
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/assets/logos/hero-bg.png')" }}
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/90" />

      {/* glow blobs (responsive scaling) */}
      <div className="absolute top-[-25%] left-[-20%] w-[clamp(300px,40vw,600px)] h-[clamp(300px,40vw,600px)] bg-[#eec643]/20 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-25%] right-[-20%] w-[clamp(300px,40vw,600px)] h-[clamp(300px,40vw,600px)] bg-[#0d21a1]/20 rounded-full blur-[160px]" />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* LEFT */}
        <div className="flex flex-col gap-6 text-left">
          <div>
            <p className="text-white/60 tracking-widest uppercase text-xs sm:text-sm">
              DOST-SEI Scholars • CAR
            </p>

            <h1
              className="text-white font-black leading-[0.85]
            text-[clamp(3rem,6vw,6rem)]"
            >
              ACE <span className="text-[#eec643]">CARDS</span>
            </h1>

            <h1
              className="hidden sm:block absolute -z-10 font-black text-transparent select-none opacity-20
            text-[clamp(5rem,10vw,14rem)]"
              style={{
                WebkitTextStroke: "2px rgba(238, 198, 67, 0.25)",
              }}
            >
              ACE CARDS
            </h1>

            <div className="w-20 h-[3px] mt-4 bg-gradient-to-r from-[#eec643] to-[#0d21a1]" />
          </div>

          <p className="text-white/75 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
            A unified organization of DOST-SEI scholars in the Cordillera
            Administrative Region that aims to develop scholars in
            excellence, leadership, and service through science,
            innovation, and volunteerism.
          </p>

          {/* CORE VALUES */}
          <div className="flex flex-col gap-2">
            <p className="text-white/60 tracking-widest uppercase text-xs sm:text-sm">
              3 CORE VALUES of a DOST-SEI Scholar
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[
                "Professional Excellence",
                "Social Responsibility",
                "Servant Leadership",
              ].map((val) => (
                <span
                  key={val}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full
                bg-white/5 border border-white/10 text-white/80 backdrop-blur-md"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] order-first lg:order-last">
          <div className="absolute w-[clamp(250px,40vw,500px)] h-[clamp(250px,40vw,500px)] bg-[#eec643]/25 blur-[140px] rounded-full" />

          <div className="relative z-10 group flex items-center justify-center">
            <Image
              src="/assets/logos/ACE CARDS logo.png"
              width={406}
              height={406}
              loading="eager"
              alt="Ace Cards Logo"
              className="
              bg-[#e0ae04]
                w-[clamp(220px,30vw,420px)]
                transition-all duration-700 ease-out
                hover:scale-105 hover:shadow-[0_0_100px_#d9b237] rounded-full
              "
            />
          </div>
        </div>
      </div>
    </section>
  )
};