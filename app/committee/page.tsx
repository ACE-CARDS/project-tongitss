"use client";

import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import ReactFlow, {
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import BackButton from "@/components/ui/backButton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Transition } from "react-transition-group";
import AnimatedTitle from "@/components/ui/animatedTitle";
import ModalBlur from "@/components/ui/modalBlur";

// Move static data outside to prevent re-creation on every render
const nodeDescriptions: Record<string, string> = {
  rd: "The Regional Director serves as the head of the Executive Committee and the chairperson of the Board of Directors. They preside over all meetings, assign duties to other officers and members of the organization, sign documents on behalf of the organization and take charge of other duties and responsibilities as needed in their position.",
  "dir-int": "The Director for Internal Affairs presides over all meetings and fulfills duties and responsibilities in the absence of the Regional Director. They maintain relationships among members of the organization, handle the application/recruitment process and take charge of other duties and responsibilities as needed in their position.",
  sec: "The Secretary shall keep a record of the attendance and minutes of every meeting, keep a complete directory of members, file documents of the organization, and take charge of other duties and responsibilities as needed in their position.",
  "mem-comm": "This committee shall facilitate the application or recruitment process of new scholar-members and other events that concern the members within the organization and establish and maintain linkages with the ACE CARDS alumni.",
  "dir-ext": "The Director for External Affairs maintains the relationship of the body with other affiliated organizations and institutions inside and outside the Cordillera Administrative Region.",
  alum: "ACE CARDS Alumni network supporting the growth and professional development of graduated scholars.",
  "ext-comm": "This committee shall be responsible for coordinating and building partnerships with other organizations within and outside DOST-CAR.",
  "h-er": "The Education and Research Committee Head handles content of academic-related activities and research projects.",
  "h-el": "The Events and Logistics Committee Head is responsible for planning and managing organizational events.",
  "h-fb": "The Finance and Business Committee Head oversees all financial transactions and income-generating projects.",
  "h-pm": "The Publicity and Media Committee Head handles social media accounts and production of publication materials.",
  "c-er": "Facilitates academic support and managing academic activities/research.",
  "c-el": "Responsible for supervising the organization in the overall planning of events.",
  "c-fb": "Manages fundraising activities and oversees the purchase of materials.",
  "c-pm": "In charge of managing official social media accounts and publications.",
};

const StaticNode = ({ data }: any) => (
  <div className="relative">
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <div className="select-none">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const nodeTypes = { static: StaticNode };

const Legend = ({ isMobile }: { isMobile: boolean }) => (
  <div className={`flex ${isMobile ? "flex-col gap-2 items-start" : "flex-row gap-6 items-center"} bg-white/80 p-3 rounded-lg border border-gray-200 shadow-sm z-0`}>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-[#eec643] border-[1px] border-[#eec643]" />
      <span className="text-xs font-medium text-gray-700">Executive Committee</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-[#0d21a1] border border-[#0d21a1]" />
      <span className="text-xs font-medium text-gray-700">Committees</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-[#fff] border-[1px] border-[#333]" />
      <span className="text-xs font-medium text-gray-700">Alumni/Others</span>
    </div>
  </div>
);

function CommitteeContent() {
  const container = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const isMobile = windowWidth < 768;

  const { contextSafe } = useGSAP({ scope: container });

  const onEnter = contextSafe(() => {
    gsap.timeline()
      .to(".backdrop", { opacity: 1, duration: 0.3 })
      .fromTo(".content", 
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }, 
        0
      );
  });

  const onExit = contextSafe(() => {
    gsap.to(".backdrop", { opacity: 0, duration: 0.2 });
    gsap.to(".content", { opacity: 0, scale: 0.95, duration: 0.2 });
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const onClose = () => setSelectedNode(null);

  const FlowCanvas = () => {

    const onNodeClick = (_event: React.MouseEvent, node: any) => {
      if (node.id === "bridge") return;

      setSelectedNode(node);
    };

    return (
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        preventScrolling={false}
        zoomOnPinch={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        selectionOnDrag={false}
        onNodeClick={onNodeClick}
        noDragClassName="cursor-default"
        style={{ cursor: 'default' }}
        // Removed pointerEvents: none from here
      />
    );
  };

  const nodeStyles = useMemo(() => {
    const base = {
      fontSize: isMobile ? "9px" : "11px",
      width: isMobile ? 90 : 140,
      padding: isMobile ? "4px" : "8px",
      textAlign: "center" as const,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    return {
      yellow: { ...base, background: "#eec643", borderRadius: "10px", border: "1px solid #eec643" },
      blue: { ...base, background: "#0d21a1", borderRadius: "10px", border: "none" , color: "#fff"},
      white: { ...base, borderRadius: "10px", border: "1px solid #333", background: "#fff" },
      secret: { ...base, border: "none", background: "#b1b1b7", width: "1.2px", height: "8px", padding: "0" },
    };
  }, [isMobile]);

  const nodes = useMemo(() => {
    const getPos = (mX: number, mY: number, dX: number, dY: number) => ({
      x: isMobile ? mX : dX,
      y: isMobile ? mY : dY,
    });

    return [
      { id: "rd", data: { label: "Regional Director" }, position: getPos(55, -50, 340, -80), style: nodeStyles.yellow, type: "static" },
      { id: "dir-int", data: { label: "Director for Internal Affairs" }, position: getPos(-5, 50, 180, 0), style: nodeStyles.yellow, type: "static" },
      { id: "sec", data: { label: "Secretariat" }, position: getPos(55, 100, 340, 0), style: nodeStyles.yellow, type: "static" },
      { id: "mem-comm", data: { label: "Membership Comm." }, position: getPos(-75, 130, 20, 0), style: nodeStyles.blue, type: "static" },
      { id: "dir-ext", data: { label: "Director for External Affairs" }, position: getPos(115, 50, 500, 0), style: nodeStyles.yellow, type: "static" },
      { id: "alum", data: { label: "ACE CARDS Alumni" }, position: getPos(-75, 210, 20, 80), style: nodeStyles.white, type: "static" },
      { id: "ext-comm", data: { label: "Externals Comm." }, position: getPos(180, 130, 660, 0), style: nodeStyles.blue, type: "static" },
      { id: "h-fb", data: { label: "Finance and Business Head" }, position: getPos(-75, 300, 100, 140), style: nodeStyles.yellow, type: "static" },
      { id: "h-pm", data: { label: "Publicity and Media Head" }, position: getPos(180, 300, 260, 140), style: nodeStyles.yellow, type: "static" },
      { id: "h-er", data: { label: "Education and Research Head" }, position: getPos(-5, 370, 420, 140), style: nodeStyles.yellow, type: "static" },
      { id: "h-el", data: { label: "Events and Logistics Head" }, position: getPos(120, 370, 580, 140), style: nodeStyles.yellow, type: "static" },
      { id: "c-fb", data: { label: "Finance and Business Comm." }, position: getPos(-75, 460, 100, 220), style: nodeStyles.blue, type: "static" },
      { id: "c-pm", data: { label: "Publicity and Media Comm." }, position: getPos(180, 460, 260, 220), style: nodeStyles.blue, type: "static" },
      { id: "c-er", data: { label: "Education and Research Comm." }, position: getPos(-5, 530, 420, 220), style: nodeStyles.blue, type: "static" },
      { id: "c-el", data: { label: "Events and Logistics Comm." }, position: getPos(120, 530, 580, 220), style: nodeStyles.blue, type: "static" },
      { id: "bridge", data: { label: "" }, position: getPos(99, 270, 409, 100), style: nodeStyles.secret, type: "static" },
    ];
  }, [isMobile, nodeStyles]);

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
    { id: "e5", source: "mem-comm", target: "alum", type: "straight" },
    { id: "e6", source: "dir-ext", target: "ext-comm", type: "step" },
  ];

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
        <div className="container mx-auto pt-8 px-4 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <BackButton />
        </div>
        <AnimatedTitle title="COMMITTEES" />
        <div className="flex flex-col items-center gap-5">
          <p className="box mx-8">
            Click any item to view its details.
          </p>
          <Legend isMobile={isMobile} />
        </div>
        <div className={`w-full ${isMobile ? "h-[1000px]" : "h-[500px]"} max-w-5xl`}>
          <style>{`
            .react-flow__pane{
              cursor: default !important;
            }
          `}
          </style>
          <ReactFlowProvider >
            <FlowCanvas />
          </ReactFlowProvider>
        </div>

        <Transition
          in={Boolean(selectedNode)}
          timeout={300}
          mountOnEnter
          unmountOnExit
          onEnter={onEnter}
          onExit={onExit}
          nodeRef={container}
        >
          <div ref={container} className="fixed inset-0 z-[10000] flex items-center justify-center">
            <ModalBlur onClose={onClose} />
            <div
              className="content relative z-50 w-[90%] max-w-xs bg-white border-2 border-gray-200 shadow-2xl rounded-xl p-6 pointer-events-auto items-center justify-center"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-md font-bold text-gray-900 mb-2 pr-6">
                {selectedNode?.data.label}
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                {selectedNode ? (nodeDescriptions[selectedNode.id] || "Description coming soon.") : ""}
              </p>
            </div>
          </div>
        </Transition>
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