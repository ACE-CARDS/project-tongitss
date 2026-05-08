import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, useState } from "react";
import { Transition } from "react-transition-group";
import BackButton from "./backButton";

type Props = {
  isShowing: boolean;
  onClose: () => void;
  onBack?: () => void;
};

const CalendarEvent: FC<Props & { eventDetail?: any }> = ({
  isShowing,
  onClose,
  eventDetail,
  onBack,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const onEnter = contextSafe(() => {
    gsap
      .timeline()
      .to(".backdrop", { opacity: 1, duration: 0.3 })
      .fromTo(
        ".content",
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
        0,
      );
  });

  const onExit = contextSafe(() => {
    gsap.to(".backdrop", { opacity: 0, duration: 0.2 });
    gsap.to(".content", { opacity: 0, scale: 0.95, duration: 0.2 });
  });

  useEffect(() => {
    if (isShowing) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isShowing]);

  return (
    <Transition
      in={isShowing}
      timeout={300}
      mountOnEnter
      unmountOnExit
      onEnter={onEnter}
      onExit={onExit}
      nodeRef={container}
    >
      {() => (
        <div
          ref={container}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        >
          <div
            className="backdrop absolute inset-0 bg-black/40 backdrop-blur-[3px] opacity-0 "
            onClick={onClose}
          />

          <div
            className="content relative z-10 w-full max-w-2xl max-h-[70vh] bg-[#011638] rounded-xl p-8 text-white shadow-2xl 
          border border-white/10 flex flex-col overflow-hidden"
          >
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-6 top-6 text-white/50 hover:text-white flex items-center gap-1 text-xs uppercase 
                tracking-widest transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            )}

            <button
              onClick={onClose}
              className="absolute right-6 top-5 text-white/50 hover:text-white cursor-pointer z-20 transition-colors"
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

            {eventDetail && (
              <div className="flex flex-col overflow-hidden min-w-0">
                <h2 className="text-3xl font-bold mb-6 border-b border-white/10 pb-4 pr-10 break-words hyphens-auto flex-shrink-0 pt-4">
                  {eventDetail.title}
                </h2>

                <div className="overflow-y-auto custom-scrollbar-white-nobg min-w-0">
                  <div className="space-y-4 pr-2">
                    <div className="min-w-0">
                      <label className="text-xs uppercase opacity-50">
                        Description
                      </label>
                      <p className="opacity-80 text-justify break-words hyphens-auto">
                        {eventDetail.description || "No description available."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 min-w-0">
                      <div className="min-w-0">
                        <label className="text-xs uppercase opacity-50">
                          Start
                        </label>
                        <p>{eventDetail.start_date}</p>
                      </div>
                      <div className="min-w-0">
                        <label className="text-xs uppercase opacity-50">
                          End
                        </label>
                        <p>{eventDetail.end_date}</p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <label className="text-xs uppercase opacity-50">
                        Location
                      </label>
                      <p className="break-words">{eventDetail.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Transition>
  );
};

export default CalendarEvent;
