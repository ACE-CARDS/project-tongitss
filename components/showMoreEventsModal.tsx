"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef } from "react";
import { Transition } from "react-transition-group";
import moment from "moment";

type Props = {
  isShowing: boolean;
  onClose: () => void;
  date: Date | null;
  events: any[];
  onEventClick: (event: any) => void;
};

const ShowMoreEventsModal: FC<Props> = ({
  isShowing,
  onClose,
  date,
  events,
  onEventClick,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const onEnter = contextSafe(() => {
    const tl = gsap.timeline();
    tl.to(".backdrop", { opacity: 1, duration: 0.3 }).fromTo(
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
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div
            className="backdrop absolute inset-0 bg-black/40 backdrop-blur-[3px] opacity-0"
            onClick={onClose}
          />
          <div className="content relative z-10 w-full max-w-lg bg-[#011638] rounded-xl p-8 text-[#eff0f2] shadow-2xl">
            <div className="absolute right-6 top-6 z-30">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eff0f2]/5 bg-[#eff0f2]/10 text-[#eff0f2] backdrop-blur-md 
                transition hover:bg-[#eff0f2]/20 focus:outline-none"
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

            <div className="mb-6 border-b border-white/10 pb-4">
              <label className="text-xs uppercase tracking-widest opacity-50 block mb-1">
                Events for
              </label>
              <h2 className="text-3xl font-bold">
                {moment(date).format("MMMM Do")}
              </h2>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {events.map((event, index) => (
                <div
                  key={event.id || index}
                  onClick={() => onEventClick(event)}
                  className="group cursor-pointer p-4 rounded-lg bg-[#eff0f2]/5 border border-[#eff0f2]/5 hover:bg-[#eff0f2]/10 hover:border-[#eff0f2]/20 transition-all 
                  duration-200 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold transition-colors text-ellipsis">
                      {event.title}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>

            <div className="mt-6 text-[10px] uppercase tracking-widest opacity-30 text-center">
              Click event for details
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};
export default ShowMoreEventsModal;
