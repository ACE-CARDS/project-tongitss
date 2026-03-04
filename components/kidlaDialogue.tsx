import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef } from "react";
import { Transition } from "react-transition-group";

type Props = {
  isShowing: boolean;
  onClose: () => void;
};

gsap.registerPlugin(useGSAP);
const KidlaDialogue: FC<Props> = ({ isShowing, onClose }) => {
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
          id="popUpAnnouncement"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="backdrop absolute inset-0 cursor-pointer bg-black/20 opacity-0 backdrop-blur-md"
            onClick={onClose}
          />
          <div
            id="scrollbar"
            className="content relative z-10 h-full max-h-[80vh] w-full max-w-6xl overflow-y-auto custom-scrollbar pr-4"
          >
            <div className="min-h-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#011638] via-[#0b1763] to-[#011638] p-8 text-white shadow-2xl flex flex-col">
              <div id="announcementHeader" className="p-4">
                <h2 className="text-4xl font-bold text-[#eff0f2] text-center p-4">
                  ANNOUNCEMENT
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default KidlaDialogue;
