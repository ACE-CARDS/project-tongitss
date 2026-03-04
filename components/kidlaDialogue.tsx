import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef } from "react";
import { Transition } from "react-transition-group";

type Props = {
  isShowing: boolean;
  onClose: () => void;
  onAnnouncements: () => void; // open announcements modal
  onRedirectEvent: () => void; // go to events page
};

gsap.registerPlugin(useGSAP);
const KidlaDialogue: FC<Props> = ({ isShowing, onClose, onAnnouncements, onRedirectEvent }) => {
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
            className="content relative z-10 h-full max-h-[50vh] w-full max-w-4xl overflow-y-auto custom-scrollbar pr-4"
          >
            <div className="min-h-full rounded-2xl border border-white/10 bg-[#d9dee8] p-8 text-white shadow-2xl flex flex-col">
              <div className="flex flex-col items-center justify-center">
                <div id="announcementHeader" className="pt-2">
                  <h2 className="text-3xl font-bold text-[#141414] text-center p-2">
                    Welcome to ACE CARDS!
                  </h2>
                  <h3 className="text-xl font-bold text-[#141414] text-center p-2">
                    Clicking on Kidla will open a dialogue box that lets you
                    open the announcement modal or navigate to the events page
                  </h3>
                </div>
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={onAnnouncements}
                    className="rounded-2xl text-white bg-gradient-to-r from-[#011638] via-[#0b1763] to-[#011638] hover:bg-gradient-to-bl font-medium rounded-base text-lg px-4 py-2.5 text-center leading-5 m-3"
                  >
                    See Announcements
                  </button>
                  <button
                    onClick={onRedirectEvent}
                    className="rounded-2xl text-white bg-gradient-to-r from-[#011638] via-[#0b1763] to-[#011638] hover:bg-gradient-to-bl font-medium rounded-base text-lg px-4 py-2.5 text-center leading-5 m-3"
                  >
                    Go to Events
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default KidlaDialogue;
