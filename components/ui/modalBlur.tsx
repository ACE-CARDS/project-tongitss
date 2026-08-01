"use client";

import { type FC, useRef, useEffect, ReactNode } from "react";

type ModalBlurProps = {
  onClose: () => void;
};

const ModalBlur: FC<ModalBlurProps> = ({ onClose }) => {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={container}
      className="fixed inset-0 z-[100] flex transition-all ease-in-out duration-200"
    >
      <div
        className="backdrop absolute inset-0 bg-black/40 backdrop-blur-[3px]"
        onClick={onClose}
      />
      
    </div>
  );
};

export default ModalBlur;