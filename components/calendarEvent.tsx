import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, useState } from "react";
import { Transition } from "react-transition-group";

type Props = {
  isShowing: boolean;
  onClose: () => void;
};

const CalendarEvent: FC<Props & { eventDetail?: any }> = ({
  isShowing,
  onClose,
  eventDetail,
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
      )
      .fromTo(
        ".detail-item",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, stagger: 0.1 },
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="backdrop absolute inset-0 bg-black/40 backdrop-blur-[3px] opacity-0"
            onClick={onClose}
          />

          <div className="content relative z-10 w-full max-w-2xl bg-[#011638] rounded-3xl p-8 text-white shadow-2xl border border-white/10">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-white/50 hover:text-white"
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
              <div>
                <h2 className="text-3xl font-bold mb-6 border-b border-white/10 pb-4">
                  {eventDetail.event_name}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase opacity-50">
                      Description
                    </label>
                    <p className="opacity-80">
                      {eventDetail.event_desc || "No description available."}
                    </p>
                  </div>
                  <div className=" grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase opacity-50">
                        Start
                      </label>
                      <p>{eventDetail.event_start}</p>
                    </div>
                    <div>
                      <label className="text-xs uppercase opacity-50">
                        End
                      </label>
                      <p>{eventDetail.event_end}</p>
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
