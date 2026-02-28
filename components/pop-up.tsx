import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, useState } from "react";
import { Transition } from "react-transition-group";
import { createClient } from "@/utils/supabase/client";

type Props = {
  isShowing: boolean;
  onClose: () => void;
};

gsap.registerPlugin(useGSAP);

const Modal: FC<Props> = ({ isShowing, onClose }) => {
  const [announce_landing, setAnnouncement] = useState({
    announce_landing_title: "Loading...",
    announce_landing_desc: "",
  });
  const supabase = createClient();

  useEffect(() => {
    async function getAnnouncement() {
      const { data, error } = await supabase
        .from("announce_landing")
        .select("announce_landing_title, announce_landing_desc")
        .single();

      if (data) {
        setAnnouncement(data);
      }
    }

    if (isShowing) {
      getAnnouncement();
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
          <div className="content relative h-[240px] w-[320px] space-y-4 rounded-md border border-black bg-off-black p-8 text-white shadow-2xl">
            <h2 className="text-xl font-bold text-green text-center">
              ANNOUNCEMENT
            </h2>
            <p>{announce_landing.announce_landing_title}</p>
            <p>{announce_landing.announce_landing_desc}</p>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default Modal;
