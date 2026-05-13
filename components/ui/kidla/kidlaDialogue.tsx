import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useState, useEffect } from "react";
import { Transition } from "react-transition-group";
import Link from "next/link";
import ModalBlur from "../modalBlur";

type Props = {
  isShowing: boolean;
  onClose: () => void;
  onAnnouncements: () => void; // open announcements modal
  onRedirectMemApp: () => void; // go to events page
};

gsap.registerPlugin(useGSAP);
const KidlaDialogue: FC<Props> = ({
  isShowing,
  onClose,
  onAnnouncements,
  onRedirectMemApp,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [showTriangle, setShowTriangle] = useState(true);
  const { contextSafe } = useGSAP({ scope: container });

  useEffect(() => {
    const updateTriangle = () => {
      if (typeof window === "undefined") return;

      const viewportScale = window.visualViewport?.scale;
      const screenRatio = window.screen.width
        ? window.innerWidth / window.screen.width
        : 1;
      const zoomScale = viewportScale ?? screenRatio ?? 1;
      const zoomedOut = zoomScale < 0.6;

      setShowTriangle(!zoomedOut);
    };

    updateTriangle();
    window.addEventListener("resize", updateTriangle);
    window.visualViewport?.addEventListener("resize", updateTriangle);
    return () => {
      window.removeEventListener("resize", updateTriangle);
      window.visualViewport?.removeEventListener("resize", updateTriangle);
    };
  }, []);

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
          className="fixed inset-0 z-40 flex items-center justify-center lg:justify-end pt-20 lg:pt-28 lg:pr-24 px-4 overflow-y-auto"
        >
          <ModalBlur isShowing={isShowing} onClose={onClose}/>

          <div
            className="z-40 content relative w-full max-w-[90%] md:max-w-[70%] lg:w-[50%] lg:max-w-4xl min-h-[30vh] md:min-h-[30vh] rounded-xl md:rounded-[80rem] lg:rounded-[80rem] 
          border border-white/10 bg-[#fbfaf8] p-6 md:p-12 text-white shadow-2xl flex flex-col justify-center items-center"
          >
            {showTriangle && (
              <div className="hidden lg:block z-[-1] absolute -bottom-8 right-10 md:right-20 md:-bottom-1 w-12 h-12 bg-[#fbfaf8] triangle" />
            )}
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={onClose}
                className="flex h-5 w-5 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-[#fbfaf8] text-gray-600 hover:bg-gray-200 transition-colors"
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
            <div className="flex flex-col items-center justify-center text-center">
              <div id="announcementHeader" className="space-y-4 md:pt-4 ">
                <p className="text-md md:text-3xl font-bold text-[#141414]">
                  Welcome to ACE CARDS!
                </p>
                <p className="text-xs md:text-xl font-medium text-[#141414] max-w-md mx-auto">
                  Would you like to see announcements or take a look at our
                  member application process?
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-2 md:gap-4 sm:w-[40%] max-w-lg mx-auto px-4 md:pb-6">
                <button
                  onClick={onAnnouncements}
                  className="w-full sm:w-auto bg-origin-border cursor-pointer group px-10 py-4 border-2 border-[#011638] rounded-full font-bold 
                  text-xs md:text-lg text-[#011638] hover:bg-gradient-to-r hover:from-[#011638] hover:to-[#0d21a1] hover:text-white transition-all duration-300 
                  shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  See Announcements
                </button>
                <button
                  onClick={onRedirectMemApp}
                  className="w-full sm:w-auto bg-origin-border cursor-pointer group px-10 py-4 border-2 border-[#011638] rounded-full font-bold 
                  text-xs md:text-lg text-[#011638] hover:bg-gradient-to-r hover:from-[#011638] hover:to-[#0d21a1] hover:text-white transition-all duration-300 
                  shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  Apply for Membership!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default KidlaDialogue;
