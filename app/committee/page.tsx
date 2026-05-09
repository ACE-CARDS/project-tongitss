"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import LoadingState from "@/components/mainLoadingState";
import ReactFlow, { Handle, Position, Background } from "reactflow";
import "reactflow/dist/style.css";
import BackButton from "@/components/backButton";

const Legend = ({ isMobile }: any) => {
  return (
    <div
      className={`flex ${isMobile ? "flex-col gap-2 items-start" : "flex-row gap-6 items-center"} bg-white/80 p-3 rounded-lg border border-gray-200 shadow-sm`}
    >
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#ffe599] border-[1px] border-[#f1c232]" />
        <span className="text-xs font-medium text-gray-700">
          Executive Committee
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#a4c2f4] border border-[transparent]" />
        <span className="text-xs font-medium text-gray-700">Committees</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#fff] border-[1px] border-[#333]" />
        <span className="text-xs font-medium text-gray-700">Alumni/Others</span>
      </div>
    </div>
  );
};

function CommitteeContent() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const isMobile = windowWidth < 768;

  const nodeStyleBase = {
    fontSize: isMobile ? "9px" : "11px",
    width: isMobile ? 90 : 140,
    padding: isMobile ? "4px" : "8px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: isMobile ? "1px" : "auto",
  };

  const nodeStyleYellow = {
    ...nodeStyleBase,
    background: "#ffe599",
    border: "1px solid #f1c232",
  };
  const nodeStyleBlue = {
    ...nodeStyleBase,
    background: "#a4c2f4",
    borderRadius: "10px",
    border: "none",
  };
  const nodeStyleWhite = {
    ...nodeStyleBase,
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#fff",
  };

  const nodeStyleSecret = {
    ...nodeStyleBase,
    border: "none",
    background: "#b1b1b7",
    width: isMobile ? "1.1px" : "1.2px",
    height: isMobile ? "8px" : "8px",
    padding: "0.5px",
  };

  const nodes = useMemo(() => {
    const getPos = (mX, mY, dX, dY) => ({
      x: isMobile ? mX : dX,
      y: isMobile ? mY : dY,
    });

    return [
      {
        id: "rd",
        data: { label: <b>Regional Director</b> },
        position: getPos(55, -50, 340, -80),
        style: nodeStyleYellow,
        type: "static",
      },
      {
        id: "dir-int",
        data: {
          label: isMobile ? (
            <b>Director for Internal Affairs</b>
          ) : (
            <b>Director for Internal Affairs</b>
          ),
        },
        position: getPos(-5, 50, 180, 0),
        style: nodeStyleYellow,
        type: "static",
      },
      {
        id: "sec",
        data: { label: <b>Secretariat</b> },
        position: getPos(55, 100, 340, 0),
        style: nodeStyleYellow,
        type: "static",
      },

      {
        id: "mem-comm",
        data: { label: "Membership Comm." },
        position: getPos(-75, 130, 20, 0),
        style: nodeStyleBlue,
        type: "static",
      },
      {
        id: "dir-ext",
        data: {
          label: isMobile ? (
            <b>Director for External Affairs</b>
          ) : (
            <b>Director for External Affairs</b>
          ),
        },
        position: getPos(115, 50, 500, 0),
        style: nodeStyleYellow,
        type: "static",
      },

      {
        id: "ace-cards",
        data: { label: "ACE CARDS Alumni" },
        position: getPos(-75, 210, 20, 80),
        style: nodeStyleWhite,
        type: "static",
      },
      {
        id: "ext-comm",
        data: { label: "Externals Comm." },
        position: getPos(180, 130, 660, 0),
        style: nodeStyleBlue,
        type: "static",
      },

      {
        id: "h-fb",
        data: { label: "Finance and Business Head" },
        position: getPos(-75, 300, 100, 140),
        style: nodeStyleYellow,
        type: "static",
      },
      {
        id: "h-pm",
        data: { label: "Publicity and Media Head" },
        position: getPos(180, 300, 260, 140),
        style: nodeStyleYellow,
        type: "static",
      },
      {
        id: "h-er",
        data: { label: "Education and Research Head" },
        position: getPos(-5, 370, 420, 140),
        style: nodeStyleYellow,
        type: "static",
      },
      {
        id: "h-el",
        data: { label: "Events and Logistics Head" },
        position: getPos(120, 370, 580, 140),
        style: nodeStyleYellow,
        type: "static",
      },

      {
        id: "c-fb",
        data: { label: "Finance and Business Comm." },
        position: getPos(-75, 460, 100, 220),
        style: nodeStyleBlue,
        type: "static",
      },
      {
        id: "c-pm",
        data: { label: "Publicity and Media Comm." },
        position: getPos(180, 460, 260, 220),
        style: nodeStyleBlue,
        type: "static",
      },
      {
        id: "c-er",
        data: { label: "Education and Research Comm." },
        position: getPos(-5, 530, 420, 220),
        style: nodeStyleBlue,
        type: "static",
      },
      {
        id: "c-el",
        data: { label: "Events and Logistics  Comm." },
        position: getPos(120, 530, 580, 220),
        style: nodeStyleBlue,
        type: "static",
      },
      {
        id: "bridge",
        data: { label: "" },
        position: getPos(99, 270, 409, 100),
        style: nodeStyleSecret,
        type: "static",
      },
    ];
  }, [isMobile]);

  const initialEdges = [
    { id: "e1", source: "rd", target: "dir-int", type: "step" },
    { id: "e2", source: "rd", target: "sec", type: "straight" },
    { id: "e3", source: "rd", target: "dir-ext", type: "step" },

    { id: "merge-1", source: "dir-int", target: "bridge", type: "step" },
    { id: "merge-2", source: "sec", target: "bridge", type: "straight" },
    { id: "merge-3", source: "dir-ext", target: "bridge", type: "step" },

    { id: "split-1", source: "bridge", target: "h-fb", type: "straight" },
    { id: "split-2", source: "bridge", target: "h-pm", type: "straight" },
    { id: "split-3", source: "bridge", target: "h-er", type: "straight" },
    { id: "split-4", source: "bridge", target: "h-el", type: "straight" },

    { id: "e13", source: "h-fb", target: "c-fb", type: "straight" },
    { id: "e14", source: "h-pm", target: "c-pm", type: "straight" },
    { id: "e15", source: "h-er", target: "c-er", type: "straight" },
    { id: "e16", source: "h-el", target: "c-el", type: "straight" },

    { id: "e4", source: "dir-int", target: "mem-comm", type: "step" },
    { id: "e5", source: "mem-comm", target: "ace-cards", type: "straight" },
    { id: "e6", source: "dir-ext", target: "ext-comm", type: "step" },
  ];

  const StaticNode = ({ data }) => (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );

  const nodeTypes = { static: StaticNode };

  if (isLoading) return <LoadingState />;

  return (
    <>
      <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col items-center"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        {" "}
        <div className="container mx-auto py-8 px-4 max-w-7xl flex justify-between">
          <BackButton />
          <Legend isMobile={isMobile} />
        </div>
        <div
          className={`w-full ${isMobile ? "h-[700px]" : "h-[500px]"} max-w-5xl`}
        >
          <ReactFlow
            nodes={nodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={isMobile}
            zoomOnPinch={true}
            style={{ pointerEvents: "none" }}
            preventScrolling={false}
          ></ReactFlow>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function Committee() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CommitteeContent />
    </Suspense>
  );
}
