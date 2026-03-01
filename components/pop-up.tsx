import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, useState } from "react";
import { Transition } from "react-transition-group";
import { createClient } from "@/utils/supabase/client";
import AnnounceCard from "./announceCard";

type Props = {
  isShowing: boolean;
  onClose: () => void;
};

gsap.registerPlugin(useGSAP);
const supabase = createClient();
const Modal: FC<Props> = ({ isShowing, onClose }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    async function getAnnouncements() {
      const { data, error } = await supabase.from("announce_landing").select();

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
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.1 },
        0,
      )
      .fromTo(
        "h2, p",
        { opacity: 0, y: 3 },
        { opacity: 1, y: 0, duration: 0.1, stagger: 0.01 },
        "-=0.2",
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
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="backdrop absolute inset-0 cursor-pointer bg-black/20 opacity-0 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="bg-linear-to-r to-[#011638] via-[#0b1763] from-[#011638] content relative h-[80%] w-[80%] space-y-4 rounded-3xl border border-black  p-8 text-white shadow-2xl flex flex-col">
            <div>
              <h2 className="text-4xl font-bold text-[#eff0f2] text-center p-4 pb-6">
                ANNOUNCEMENT
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
              {announcements.length === 0 && (
                <div className="flex h-full w-full items-center justify-center">
                  <p>Loading...</p>
                </div>
              )}
              {announcements && (
                <div className="announcements">
                  <div className="announcements-grid">
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
      )}
    </Transition>
  );
};

export default Modal;
