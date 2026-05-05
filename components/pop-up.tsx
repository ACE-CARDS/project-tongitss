import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, useState } from "react";
import { Transition } from "react-transition-group";
import { createClient } from "@/lib/supabase/client";
import AnnounceCard from "./announceCard";

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
        .order("announce_landing_end", { ascending: true });

      if (data) {
        setAnnouncements(data);
      }
    }

    if (isShowing) {
      getAnnouncements();
    }
  }, [isShowing, supabase]);

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
          y: 0,
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
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="backdrop absolute inset-0 cursor-pointer bg-black/20 opacity-0 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <div
            id="scrollbar"
            className="content relative z-10 max-h-[80vh] w-[92%] lg:w-full max-w-6xl overflow-y-auto custom-scrollbar pr-4 shadow-3xl"
          >
            <div className="min-h-full rounded-md border-1 border-white/30 bg-[#011638] p-4 lg:p-8 text-white flex flex-col">
              <div className="absolute right-4 top-4 z-20 lg:pr-4 pl-2 pr-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-5 w-5 lg:h-10 lg:w-10 items-center justify-center rounded-xl text-white transition hover:bg-[#0b1763]/50 focus:outline-none focus:ring-2 focus:ring-white/30"
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
              <div id="announcementHeader" className=" pb-8">
                <h2 className="text-4xl lg:text-6xl font-bold text-[#eff0f2] text-center p-4">
                  ANNOUNCEMENT
                </h2>
              </div>

              <div className="flex-1">
                {announcements.length === 0 ? (
                  <div className="flex h-64 w-full items-center justify-center">
                    <p>Loading...</p>
                  </div>
                ) : (
                  <div className="announcements">
                    <div className="grid grid-cols-1 gap-6">
                      {" "}
                      {announcements.map((announce_landing) => (
                        <AnnounceCard
                          key={announce_landing.id}
                          announce_landing={announce_landing}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default Popup;
