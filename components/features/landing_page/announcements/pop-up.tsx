import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, useState } from "react";
import { Transition } from "react-transition-group";
import { createClient } from "@/utils/supabase/client";
import AnnounceCard from "@/components/features/landing_page/announcements/announceCard";
import { BsSuitSpadeFill } from "react-icons/bs";

type Props = {
  isShowing: boolean;
  onClose: () => void;
};

gsap.registerPlugin(useGSAP);
const supabase = createClient();
const Popup: FC<Props> = ({ isShowing, onClose }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    async function getAnnouncements() {
      const today = new Date().toISOString();

      const { data, error } = await supabase
        .from("announce_landing")
        .select()
        .gte("announce_landing_end", today)
        .lte("announce_landing_start", today)
        .order("announce_landing_end", { ascending: true });

      if (data) {
        setAnnouncements(data);
      }
    }

    if (isShowing) {
      getAnnouncements();
    }
  }, [isShowing, supabase]);

  useEffect(() => {
    if (isShowing) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isShowing]);

  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const onEnter = contextSafe(() => {
    gsap
      .timeline()
      .to(".backdrop", { opacity: 1, duration: 0.1 })
      .fromTo(
        ".content",
        { opacity: 0, scale: 0.9, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 30,
          duration: 0.4,
          ease: "back.out(1.2)",
        },
        0,
      )
      .fromTo(
        "#announcementHeader, .announcements",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.2, stagger: 0.1 },
        "-=0.1",
      );
  });
  const onExit = contextSafe(() => {
    gsap.to(".backdrop", { opacity: 0, duration: 0.2 });
    gsap.to(".content", { opacity: 0, scale: 0.95, duration: 0.2 });
  });

  return (
    <Transition
      in={isShowing}
      timeout={{ exit: 300 }}
      mountOnEnter
      unmountOnExit
      onEnter={onEnter}
      onExit={onExit}
      nodeRef={container}
    >
      {(status) => (
        <div
          ref={container}
          id="popUpAnnouncement"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="backdrop absolute inset-0 cursor-pointer bg-black/40 opacity-0 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <div className="content relative z-10 flex flex-col w-full max-w-6xl h-[85vh] bg-[#011638] rounded-2xl shadow-3xl overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
              <BsSuitSpadeFill className="absolute top-[-5%] right-[-5%] rotate-12 size-40 md:size-64 text-slate-600/70" />
              <BsSuitSpadeFill className="absolute top-8/12 -left-20 -rotate-12 size-60 md:size-96 text-slate-600/70" />
              <BsSuitSpadeFill className="absolute top-1/4 left-1 -rotate-[13deg] size-32 text-slate-600/70" />
              <BsSuitSpadeFill className="absolute top-[-5%] left-[5%] rotate-[35deg] size-40 text-slate-600/70" />
              <BsSuitSpadeFill className="absolute top-1/5 right-[18%] rotate-[-15deg] size-60 text-slate-600/70" />
              <BsSuitSpadeFill className="absolute top-2/4 right-[-10] rotate-[13deg] size-28 text-slate-600/70" />
              <BsSuitSpadeFill className="absolute top-3/4 right-32 -rotate-[6deg] size-40 text-slate-600/70" />
            </div>

            <div className="absolute right-6 top-6 z-30">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white 
                backdrop-blur-md transition hover:bg-white/20 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div id="announcementHeader" className="relative z-10 pt-10 pb-6">
              <h2 className="text-4xl lg:text-6xl font-bold text-[#eff0f2] text-center">
                ANNOUNCEMENT
              </h2>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-12 pb-10">
              {announcements.length === 0 ? (
                <div className="flex h-64 w-full items-center justify-center">
                  <p className="text-white/50 animate-pulse">Loading...</p>
                </div>
              ) : (
                <div className="announcements grid grid-cols-1 gap-6 ">
                  {announcements.map((announce_landing) => (
                    <AnnounceCard
                      key={announce_landing.id}
                      announce_landing={announce_landing}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default Popup;
