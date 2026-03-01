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
      const { data, error } = await supabase
        .from("announce_landing")
        .select("announce_landing_title, announce_landing_desc");

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
          <div className="content relative h-[80%] w-[80%] space-y-4 rounded-3xl border border-black bg-[#011638] p-8 text-white shadow-2xl flex flex-col">
            <div>
              <h2 className="text-xl font-bold text-green text-center">
                ANNOUNCEMENT
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
              {announcements.length === 0 && <p>Loading...</p>}
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
