"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PaginationNav from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";

// --- DnD Kit Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface MemAppItem {
  id: number;
  type: string;
  description: string;
  order_index: number;
}

// --- Helper Components ---
function Toast({
  message,
  type,
  onClose,
}: {
  message: string | null;
  type: "error" | "success";
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg font-ubuntu-mono font-bold z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 ${
        type === "error"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-green-50 text-green-700 border border-green-200"
      }`}
    >
      <span>{message}</span>

      <button
        onClick={onClose}
        className="text-xl leading-none hover:opacity-70 transition-opacity"
      >
        &times;
      </button>
    </div>
  );
}

function DeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        ref={popupRef}
        className="bg-[#fbfaf8] rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
            Confirm Delete
          </h3>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
            Are you sure you want to delete{" "}
            <span className="font-bold text-[#011638]">
              &quot;{title}&quot;
            </span>
            ? This action will hide it from the public view.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638]"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-oswald font-bold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sortable Row Component ---
function SortableRow({
  item,
  index,
  isDragEnabled,
  onActivate,
  onDelete,
  onEdit,
  onMove,
}: {
  item: MemAppItem;
  index: number;
  isDragEnabled: boolean;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onMove: (id: number, dir: 'up' | 'down') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id.toString(),
  });

  // FIX 1: Lock the drag transform to the Y-axis only. 
  // This physically prevents horizontal dragging, stopping the scrollbar from appearing.
  const style = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 100 : "auto",
    position: "relative" as const,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${
        index % 2 === 0 ? "bg-white" : "bg-[#fbfaf8]"
      } h-[80px] ${
        isDragging ? "opacity-50 shadow-2xl bg-blue-50" : ""
      }`}
    >
      <td className="px-4 py-2 text-center align-middle w-[5%]">
        {isDragEnabled ? (
          <button
            {...attributes}
            {...listeners}
            className="text-slate-400 hover:text-[#011638] cursor-grab active:cursor-grabbing p-1"
            title="Drag to reorder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 15h8" />
            </svg>
          </button>
        ) : (
          <span className="text-slate-200" title="Reordering disabled in this tab">—</span>
        )}
      </td>

      <td className="px-4 py-2 w-[20%]">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            item.type === "video" ? "bg-purple-100 text-purple-700" :
            item.type === "reminder" ? "bg-orange-100 text-orange-700" :
            "bg-blue-100 text-blue-700"
          }`}
        >
          {item.type === "instruction" ? "Announcement" : item.type}
        </span>
      </td>

      <td className="px-4 py-2 text-sm font-ubuntu-mono text-[#475569] truncate max-w-sm w-[45%]">
        {item.description}
      </td>

      {/* FIX 2: Split the actions into 3 fixed-width zones to lock alignment */}
      <td className="px-4 py-2 text-center w-[30%]">
        <div className="flex justify-center items-center w-full">
          
          {/* ZONE 1: Arrow Buttons (Fixed Width) */}
          <div className="w-[30px] flex justify-center">
            {isDragEnabled && (
              <div className="flex flex-col gap-0.5">
                <button onClick={() => onMove(item.id, 'up')} className="text-slate-400 hover:text-[#011638] transition-colors" title="Move Up">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => onMove(item.id, 'down')} className="text-slate-400 hover:text-[#011638] transition-colors" title="Move Down">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            )}
          </div>

          {/* ZONE 2: Active Video Badge (Fixed Width) */}
          <div className="w-[100px] flex justify-center mx-2">
            {item.type === "video" && item.order_index !== 1 && (
              <button
                onClick={() => onActivate(item.id)}
                className="text-[10px] bg-[#011638] text-white px-2 py-1 rounded uppercase font-bold hover:bg-[#eec643] hover:text-[#011638] transition-colors whitespace-nowrap"
              >
                Set Active
              </button>
            )}
            {item.type === "video" && item.order_index === 1 && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded uppercase font-bold whitespace-nowrap">
                Active Video
              </span>
            )}
          </div>

          {/* ZONE 3: Edit & Delete Icons (Fixed Width) */}
          <div className="w-[60px] flex justify-center items-center gap-4">
            <button
              onClick={() => onEdit(item.id)}
              className="text-[#0d21a1] hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
            </button>

            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
          </div>

        </div>
      </td>
    </tr>
  );
}

// --- Main Component ---
export default function MemAppAdmin() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useUser();

  const [items, setItems] = useState<MemAppItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MemAppItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Deadline States
  const [deadlineItem, setDeadlineItem] = useState<MemAppItem | null>(null);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [initialDeadlineDate, setInitialDeadlineDate] = useState("");
  const [savingDeadline, setSavingDeadline] = useState(false);

  // Signup Link States
  const [signupLinkItem, setSignupLinkItem] =
    useState<MemAppItem | null>(null);

  const [signupLink, setSignupLink] = useState("");
  const [initialSignupLink, setInitialSignupLink] = useState("");
  const [savingLink, setSavingLink] = useState(false);

  // Other States
  const [activeTab, setActiveTab] = useState("ALL");
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const TABS = [
    { id: "ALL", label: "All Content" },
    { id: "instruction", label: "Announcements" },
    { id: "reminder", label: "Reminders" },
    { id: "video", label: "Videos" },
  ];

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        item.type !== "deadline" && item.type !== "signup_link"
    );

    if (activeTab !== "ALL") {
      filtered = filtered.filter(
        (item) => item.type === activeTab
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [activeTab, items]);

  const fetchItems = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("announce_memapp")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;

      if (data) {
        setItems(data);

        const dl = data.find((d) => d.type === "deadline");

        if (dl) {
          setDeadlineItem(dl);

          const parsed = new Date(dl.description);

          if (!isNaN(parsed.getTime())) {
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(
              2,
              "0"
            );
            const day = String(parsed.getDate()).padStart(2, "0");

            const formatted = `${year}-${month}-${day}`;

            setDeadlineDate(formatted);
            setInitialDeadlineDate(formatted);
          }
        }

        const sl = data.find(
          (d) => d.type === "signup_link"
        );

        if (sl) {
          setSignupLinkItem(sl);
          setSignupLink(sl.description);
          setInitialSignupLink(sl.description);
        }
      }
    } catch (err: any) {
      setToast({
        message: "Failed to load: " + err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (!isDragEnabled) return;

    const oldIndex = filteredItems.findIndex(
      (item) => item.id.toString() === active.id
    );

    const newIndex = filteredItems.findIndex(
      (item) => item.id.toString() === over.id
    );

    const newOrder = arrayMove(
      filteredItems,
      oldIndex,
      newIndex
    );

    setFilteredItems(newOrder);

    try {
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        order_index: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("announce_memapp")
          .update({ order_index: update.order_index })
          .eq("id", update.id);

        if (error) throw error;
      }

      fetchItems();
    } catch (err: any) {
      setToast({
        message: "Failed to save order",
        type: "error",
      });

      fetchItems();
    }
  };

  // NEW: handleMove logic for Arrows
  const handleMove = async (id: number, dir: 'up' | 'down') => {
    const currentIndex = filteredItems.findIndex(i => i.id === id);
    const targetIndex = dir === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Boundary check
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

    const item = filteredItems[currentIndex];
    const target = filteredItems[targetIndex];

    // Optimistically update the UI instantly
    const newOrder = arrayMove(filteredItems, currentIndex, targetIndex);
    setFilteredItems(newOrder);

    try {
      // Swap order_index values in DB
      await supabase.from("announce_memapp").update({ order_index: target.order_index }).eq("id", item.id);
      await supabase.from("announce_memapp").update({ order_index: item.order_index }).eq("id", target.id);
      
      fetchItems();
    } catch (err: any) {
      setToast({ message: "Failed to move item", type: "error" });
      fetchItems(); // revert on fail
    }
  };

  const saveDeadline = async () => {
    if (!deadlineDate) {
      return setToast({
        message: "Please select a date.",
        type: "error",
      });
    }

    setSavingDeadline(true);

    try {
      const formattedDate = new Date(
        deadlineDate
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).toUpperCase();

      const { error } = deadlineItem
        ? await supabase
            .from("announce_memapp")
            .update({ description: formattedDate })
            .eq("id", deadlineItem.id)
        : await supabase
            .from("announce_memapp")
            .insert([
              {
                type: "deadline",
                description: formattedDate,
                order_index: 0,
              },
            ]);

      if (error) throw error;

      setInitialDeadlineDate(deadlineDate);

      setToast({
        message: "Deadline updated!",
        type: "success",
      });

      fetchItems();
    } catch (err: any) {
      setToast({
        message: err.message,
        type: "error",
      });
    } finally {
      setSavingDeadline(false);
    }
  };

  const saveSignupLink = async () => {
    if (!signupLink.trim()) {
      return setToast({
        message: "Link cannot be empty.",
        type: "error",
      });
    }

    setSavingLink(true);

    try {
      const trimmedLink = signupLink.trim();

      const { error } = signupLinkItem
        ? await supabase
            .from("announce_memapp")
            .update({ description: trimmedLink })
            .eq("id", signupLinkItem.id)
        : await supabase
            .from("announce_memapp")
            .insert([
              {
                type: "signup_link",
                description: trimmedLink,
                order_index: 0,
              },
            ]);

      if (error) throw error;

      setInitialSignupLink(trimmedLink);

      setToast({
        message: "Link saved!",
        type: "success",
      });

      fetchItems();
    } catch (err: any) {
      setToast({
        message: err.message,
        type: "error",
      });
    } finally {
      setSavingLink(false);
    }
  };

  const handleSetActiveVideo = async (id: number) => {
    try {
      await supabase
        .from("announce_memapp")
        .update({ order_index: 0 })
        .eq("type", "video");

      await supabase
        .from("announce_memapp")
        .update({ order_index: 1 })
        .eq("id", id);

      setToast({
        message: "Video is now active!",
        type: "success",
      });

      fetchItems();
    } catch (err: any) {
      setToast({
        message: err.message,
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const { error } = await supabase
        .from("announce_memapp")
        .delete()
        .eq("id", selectedId);

      if (error) throw error;

      setToast({
        message: "Content deleted.",
        type: "success",
      });

      setDeletePopupOpen(false);

      fetchItems();
    } catch (err: any) {
      setToast({
        message: err.message,
        type: "error",
      });
    }
  };

  const isDragEnabled = activeTab !== "ALL";

  const totalItems = filteredItems.length;

  const totalPages = Math.ceil(
    totalItems / ITEMS_PER_PAGE
  );

  const validCurrentPage = Math.min(
    Math.max(1, currentPage),
    totalPages || 1
  );

  const startIndex =
    (validCurrentPage - 1) * ITEMS_PER_PAGE;

  const paginatedItems = isDragEnabled
    ? filteredItems
    : filteredItems.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      );

  // CHANGE DETECTION
  const isDeadlineChanged =
    deadlineDate !== initialDeadlineDate;

  const isSignupLinkChanged =
    signupLink.trim() !== initialSignupLink.trim();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full overflow-hidden flex flex-col">
      <Toast
        message={toast?.message || null}
        type={toast?.type || "success"}
        onClose={() => setToast(null)}
      />

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638] uppercase tracking-wide">
            Membership App Content
          </h1>

          <p className="text-[#475569] font-ubuntu-mono mt-1">
            Manage rules, reminders, and video announcements
          </p>
        </div>

        <Link
          href="/dashboard/add/mem-app"
          className="bg-[#eec643] text-[#011638] px-6 py-2.5 rounded-lg hover:bg-[#d9b237] flex items-center justify-center gap-2 font-oswald font-bold shadow-md transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>

          Add Content
        </Link>
      </div>

      {/* SETTINGS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col xl:flex-row gap-8 xl:gap-12">
        {/* Deadline */}
        <div className="flex-1">
          <h2 className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-3">
            Application Deadline
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) =>
                setDeadlineDate(e.target.value)
              }
              className="w-full px-4 py-2.5 rounded-lg border border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono focus:ring-1 focus:ring-[#011638]"
            />

            <button
              onClick={saveDeadline}
              disabled={
                savingDeadline || !isDeadlineChanged
              }
              className={`px-4 py-2 rounded-xl text-white transition cursor-pointer ${
                savingDeadline || !isDeadlineChanged
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#1e4db7] hover:opacity-90"
              }`} 
            >
              Save
            </button>
          </div>

          {deadlineItem && (
            <p className="text-xs text-[#475569] font-ubuntu-mono mt-2">
              Currently displaying:{" "}
              <strong className="text-red-600 font-bold">
                {deadlineItem.description}
              </strong>
            </p>
          )}
        </div>

        {/* Signup Link */}
        <div className="flex-1">
          <h2 className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-3">
            Google Form Link
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={signupLink}
              onChange={(e) =>
                setSignupLink(e.target.value)
              }
              placeholder="https://docs.google.com/forms/..."
              className="w-full px-4 py-2.5 rounded-lg border border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono focus:ring-1 focus:ring-[#011638]"
            />

            <button
              onClick={saveSignupLink}
              disabled={
                savingLink || !isSignupLinkChanged
              }
              className={`px-4 py-2 rounded-xl text-white transition cursor-pointer ${
                savingLink || !isSignupLinkChanged
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#1e4db7] hover:opacity-90"
              }`}

            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-oswald font-bold tracking-wide uppercase transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-4 border-[#011638] text-[#011638]"
                : "text-slate-400 hover:text-[#011638] hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isDragEnabled && (
        <div className="mb-4 text-sm text-[#0d21a1] font-ubuntu-mono font-bold flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          Reorder Mode Active: Drag the handles or use the arrows on the right
          to reorder items.
        </div>
      )}

      {/* TABLE - Fixed DndContext structure to prevent Hydration errors */}
      <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-x-auto border border-gray-200 flex flex-col">
        <div className="min-w-[700px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full table-fixed">
              <thead className="bg-[#011638]">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[5%]"></th>

                  <th className="px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[20%]">
                    Type
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[50%]">
                    Content Details
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[25%]">
                    Actions
                  </th>
                </tr>
              </thead>

              <SortableContext
                items={paginatedItems.map((i) =>
                  i.id.toString()
                )}
                strategy={
                  verticalListSortingStrategy
                }
              >
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center font-ubuntu-mono text-[#475569] animate-pulse"
                      >
                        Fetching records...
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center font-ubuntu-mono text-[#475569]"
                      >
                        No content found in this category.
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, idx) => (
                      <SortableRow
                        key={item.id}
                        item={item}
                        index={idx}
                        isDragEnabled={isDragEnabled}
                        onMove={handleMove}
                        onActivate={handleSetActiveVideo}
                        onDelete={(id) => {
                          setSelectedId(id);
                          setDeletePopupOpen(true);
                        }}
                        onEdit={(id) =>
                          router.push(
                            `/dashboard/edit/mem-app?id=${id}`
                          )
                        }
                      />
                    ))
                  )}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      </div>

      {!isDragEnabled && totalPages > 1 && (
        <div className="mt-6">
          <PaginationNav
            currentPage={validCurrentPage}
            totalPages={totalPages || 1}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) =>
              setCurrentPage(page)
            }
          />
        </div>
      )}

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        onConfirm={handleDelete}
        title={
          items.find((i) => i.id === selectedId)?.type ||
          "item"
        }
      />
    </div>
  );
}