"use client";

import React, { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import BackButton from "@/components/backButton";
import LoadingState from "@/components/mainLoadingState";
import ReactFlow, { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

function CommitteeContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  const isMobile = window.innerWidth < 768;

  const nodeStyleYellow = {
    background: "#ffe599",
    border: "1px solid #f1c232",
    fontSize: isMobile ? "8px" : "10px",
    width: isMobile ? 70 : 120,
    padding: "5px",
    textAlign: "center",
  };

  const nodeStyleYellowHead = {
    background: "#ffe599",
    border: "1px solid #f1c232",
    fontSize: isMobile ? "8px" : "10px",
    width: isMobile ? 50 : 120,
    padding: "5px",
    textAlign: "center",
  };

  const nodeStyleBlue = {
    background: "#a4c2f4",
    borderRadius: "15px",
    fontSize: isMobile ? "8px" : "10px",
    width: isMobile ? 50 : 120,
    padding: "5px",
    textAlign: "center",
  };
  const nodeStyleWhite = {
    borderRadius: "15px",
    border: "1px solid #000",
    fontSize: isMobile ? "8px" : "10px",
    width: isMobile ? 80 : 120,
    padding: "5px",
    textAlign: "center",
  };

  const initialNodes = [
    //regional dir
    {
      id: "rd",
      data: { label: <b>Regional Director</b> },
      position: { x: isMobile ? -90 : 340, y: -80 },
      style: nodeStyleYellow,
      type: "static",
    },

    //internal external
    {
      id: "mem-comm",
      data: { label: "Membership Committee" },
      position: { x: isMobile ? -190 : 20, y: 0 },
      style: nodeStyleBlue,
      type: "static",
    },
    {
      id: "dir-int",
      data: { label: "Director for Internals" },
      position: { x: isMobile ? -180 : 180, y: 0 },
      style: nodeStyleYellow,
      type: "static",
    },
    {
      id: "sec",
      data: { label: <b>Secretariat</b> },
      position: { x: isMobile ? -90 : 340, y: 0 },
      style: nodeStyleYellow,
      type: "static",
    },
    {
      id: "dir-ext",
      data: { label: "Director for Externals" },
      position: { x: isMobile ? 0 : 500, y: 0 },
      style: nodeStyleYellow,
      type: "static",
    },
    {
      id: "ext-comm",
      data: { label: "Externals Committee" },
      position: { x: 660, y: 0 },
      style: nodeStyleBlue,
      type: "static",
    },

    {
      id: "ace-cards",
      data: { label: "ACE CARDS Alumni" },
      position: { x: 20, y: 80 },
      style: nodeStyleWhite,
      type: "static",
    },

    // comm heads
    {
      id: "h-fb",
      data: { label: "Finance Head" },
      position: { x: isMobile ? -180 : 100, y: 140 },
      style: nodeStyleYellowHead,
      type: "static",
    },
    {
      id: "h-pm",
      data: { label: "Publicity Head" },
      position: { x: isMobile ? -110 : 260, y: 140 },
      style: nodeStyleYellowHead,
      type: "static",
    },
    {
      id: "h-er",
      data: { label: "Education Head" },
      position: { x: isMobile ? -50 : 420, y: 140 },
      style: nodeStyleYellowHead,
      type: "static",
    },
    {
      id: "h-el",
      data: { label: "Events Head" },
      position: { x: isMobile ? 20 : 580, y: 140 },
      style: nodeStyleYellowHead,
      type: "static",
    },

    // committees
    {
      id: "c-fb",
      data: { label: "Finance & Business" },
      position: { x: isMobile ? -180 : 100, y: 220 },
      style: nodeStyleBlue,
      type: "static",
    },
    {
      id: "c-pm",
      data: { label: "Publicity & Media" },
      position: { x: isMobile ? -110 : 260, y: 220 },
      style: nodeStyleBlue,
      type: "static",
    },
    {
      id: "c-er",
      data: { label: "Education & Research" },
      position: { x: isMobile ? -50 : 420, y: 220 },
      style: nodeStyleBlue,
      type: "static",
    },
    {
      id: "c-el",
      data: { label: "Events & Logistics" },
      position: { x: isMobile ? 20 : 580, y: 220 },
      style: nodeStyleBlue,
      type: "static",
    },
  ];

  const initialEdges = [
    { id: "e1", source: "rd", target: "dir-int", type: "straight" },
    { id: "e2", source: "rd", target: "sec", type: "step" },
    { id: "e3", source: "rd", target: "dir-ext", type: "straight" },
    { id: "e4", source: "dir-int", target: "mem-comm", type: "step" },
    { id: "e5", source: "mem-comm", target: "ace-cards", type: "step" },
    { id: "e6", source: "dir-ext", target: "ext-comm", type: "step" },
    { id: "e7", source: "dir-int", target: "h-fb", type: "step" },
    { id: "e8", source: "dir-int", target: "h-pm", type: "step" },
    { id: "e9", source: "sec", target: "h-pm", type: "step" },
    { id: "e10", source: "sec", target: "h-er", type: "step" },
    { id: "e11", source: "dir-ext", target: "h-er", type: "step" },
    { id: "e12", source: "dir-ext", target: "h-el", type: "step" },
    { id: "e13", source: "h-fb", target: "c-fb" },
    { id: "e14", source: "h-pm", target: "c-pm" },
    { id: "e15", source: "h-er", target: "c-er" },
    { id: "e16", source: "h-el", target: "c-el" },
  ];

  const StaticNode = ({ data }) => {
    return (
      <div style={{ padding: "10px", textAlign: "center" }}>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

        <div>{data.label}</div>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0 }}
        />
      </div>
    );
  };

  const nodeTypes = {
    static: StaticNode,
  };

  return (
    <>
      <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex justify-center items-center w-[100%] h-[500px] mx-auto my-10">
          <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
            <ReactFlow
              fitView
              nodes={initialNodes}
              nodeTypes={nodeTypes}
              edges={initialEdges}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              minZoom={0.2}
              maxZoom={1}
              fitViewOptions={{
                padding: 0.4, // Increases "breathing room" on small screens
                includeHiddenNodes: true,
              }}
            ></ReactFlow>
          </div>
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
