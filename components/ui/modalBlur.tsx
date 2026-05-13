"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type FC, useRef, useEffect, ReactNode } from "react";
import { Transition } from "react-transition-group";

type ModalBlurProps = {
  isShowing: boolean;
  onClose: () => void;
};

const ModalBlur: FC<ModalBlurProps> = ({ isShowing, onClose }) => {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const onEnter = contextSafe(() => {
    gsap.timeline()
      .to(".backdrop", { opacity: 1, duration: 0.3 })
      .fromTo(
        ".content-wrapper",
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
        0
      );
  });

  const onExit = contextSafe(() => {
    gsap.to(".backdrop", { opacity: 0, duration: 0.2 });
    gsap.to(".content-wrapper", { opacity: 0, scale: 0.95, duration: 0.2 });
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
      <div
        ref={container}
        className="fixed inset-0 z-[9] flex items-center justify-center p-4"
      >
        <div
          className="backdrop absolute inset-0 bg-black/40 backdrop-blur-[3px] opacity-0"
          onClick={onClose}
        />
        
      </div>
    </Transition>
  );
};

export default ModalBlur;