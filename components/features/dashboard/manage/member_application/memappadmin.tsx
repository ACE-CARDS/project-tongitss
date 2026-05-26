"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/ui/pagination";
import FilterDropdown from "@/components/ui/filterDropdown";
import { useUser } from "@/components/context/userContext";

interface MemAppItem {
  id: number;
  type: string;
  description: string;
  order_index: number;
}

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
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg font-ubuntu-mono font-bold z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 ${type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
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
      if (popupRef.current && !popupRef.current.contains(event.target as Node))
        onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

function SearchBar({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Search content..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
      />
      <svg
        className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

export default function MemAppAdmin() {
  const supabase = createClient();
  const router = useRouter();

  const [items, setItems] = useState<MemAppItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MemAppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deadlineItem, setDeadlineItem] = useState<MemAppItem | null>(null);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [savingDeadline, setSavingDeadline] = useState(false);
  const [signupLinkItem, setSignupLinkItem] = useState<MemAppItem | null>(null);
  const [signupLink, setSignupLink] = useState("");
  const [savingLink, setSavingLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Pagination Local State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Dropdown Options
  const filterOptions = [
    { label: "All Content", value: "ALL" },
    { label: "Instructions", value: "instruction" },
    { label: "Reminders", value: "reminder" },
    { label: "Videos", value: "video" },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items.filter(
      (item) => item.type !== "deadline" && item.type !== "signup_link",
    );
    if (typeFilter !== "ALL")
      filtered = filtered.filter((item) => item.type === typeFilter);
    if (searchTerm.trim() !== "")
      filtered = filtered.filter((item) =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchTerm, typeFilter, items]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("announce_memapp")
        .select("*")
        .order("type", { ascending: true })
        .order("order_index", { ascending: true });
      if (error) throw error;
      if (data) {
        setItems(data);
        const dl = data.find((d) => d.type === "deadline");
        if (dl) {
          setDeadlineItem(dl);
          const parsed = new Date(dl.description);
          if (!isNaN(parsed.getTime())) {
            // FIXED: Using local date extraction to avoid timezone shifts pushing the date backward
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, "0");
            const day = String(parsed.getDate()).padStart(2, "0");
            setDeadlineDate(`${year}-${month}-${day}`);
          }
        }
        const sl = data.find((d) => d.type === "signup_link");
        if (sl) {
          setSignupLinkItem(sl);
          setSignupLink(sl.description);
        }
      }
    } catch (err: any) {
      setToast({ message: "Failed to load: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const saveDeadline = async () => {
    if (!deadlineDate)
      return setToast({ message: "Please select a date.", type: "error" });
    setSavingDeadline(true);
    try {
      const formattedDate = new Date(deadlineDate)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        .toUpperCase();
      const { error } = deadlineItem
        ? await supabase
            .from("announce_memapp")
            .update({ description: formattedDate })
            .eq("id", deadlineItem.id)
        : await supabase
            .from("announce_memapp")
            .insert([
              { type: "deadline", description: formattedDate, order_index: 0 },
            ]);
      if (error) throw error;
      setToast({ message: "Deadline updated!", type: "success" });
      fetchItems();
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSavingDeadline(false);
    }
  };

  const logEditDeadlineAudit = async (
    oldDate: string | null,
    newDate: string,
  ) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    let detailedMessage = "";

    if (oldDate !== newDate) {
      detailedMessage = `Changed membership application deadline from "${oldDate}" to "${newDate}"`;
    } else {
      detailedMessage = `Re-saved membership application deadline as "${newDate}" (No changes made)`;
    }

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "announce_memapp",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);

    if (error) {
      console.error("Failed to log.");
    }
  };

  const saveSignupLink = async () => {
    if (!signupLink.trim())
      return setToast({ message: "Link cannot be empty.", type: "error" });
    setSavingLink(true);
    try {
      const { error } = signupLinkItem
        ? await supabase
            .from("announce_memapp")
            .update({ description: signupLink.trim() })
            .eq("id", signupLinkItem.id)
        : await supabase.from("announce_memapp").insert([
            {
              type: "signup_link",
              description: signupLink.trim(),
              order_index: 0,
            },
          ]);
      if (error) throw error;
      setToast({ message: "Link saved!", type: "success" });
      fetchItems();
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
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
      setToast({ message: "Video is now active!", type: "success" });
      fetchItems();
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deletedItem = items.find((item) => item.id === selectedId);

      const { error } = await supabase
        .from("announce_memapp")
        .delete()
        .eq("id", selectedId);
      if (error) throw error;

      if (deletedItem)
        await logDeleteAudit(
          deletedItem?.type,
          deletedItem?.description.trim(),
          selectedId,
        );

      setToast({ message: "Content deleted.", type: "success" });
      setDeletePopupOpen(false);
      fetchItems();
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  //audit log
  const { user } = useUser();
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const loadCurrentUser = async (email: string) => {
    const { data, error } = await supabase
      .from("member")
      .select("mem_fname, mem_lname, mem_email")
      .eq("mem_email", email)
      .single();

    const fullName = data
      ? `${data.mem_fname || ""} ${data.mem_lname || ""}`.trim()
      : email;
    setCurrentUserName(fullName || email);
    setCurrentUserEmail(data?.mem_email || email);
  };

  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  const logDeleteAudit = async (
    contentType: string,
    text: string,
    recordID: number,
  ) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    let detailedMessage = "";
    if (contentType === "instruction") {
      detailedMessage = `Deleted membership application content "${contentType || "Unknown Title"}" (ID: ${recordID || "Unknown ID"})`;
    } else if (contentType === "video") {
      detailedMessage = `Deleted video link: "${text}"`;
    } else {
      detailedMessage = `Deleted membership application content "${contentType || "Unknown Title"}" (ID: ${recordID || "Unknown ID"})`;
    }

    const logEntry = {
      action: "Delete",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "announce_memapp",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);

    if (error) {
      console.error("Failed to log.");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full overflow-hidden flex flex-col">
      <Toast
        message={toast?.message || null}
        type={toast?.type || "success"}
        onClose={() => setToast(null)}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638] uppercase tracking-wide">
          Membership App Content
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">
          Manage rules, reminders, and video announcements
        </p>
      </div>

      {/* Configuration Cards */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <span className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest min-w-[120px]">
              Set Deadline:
            </span>
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
            />
            <button
              onClick={saveDeadline}
              disabled={savingDeadline}
              className="w-full sm:w-auto px-6 py-2 bg-[#011638] text-white rounded-lg hover:bg-[#0d21a1] font-oswald disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {deadlineItem && (
            <span className="text-xs text-[#475569] font-ubuntu-mono">
              Current:{" "}
              <strong className="text-red-600">
                {deadlineItem.description}
              </strong>
            </span>
          )}
        </div>
        <hr className="border-gray-100" />
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <span className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest min-w-[120px]">
            Google Form:
          </span>
          <input
            type="url"
            value={signupLink}
            onChange={(e) => setSignupLink(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-4 py-2 rounded-lg border border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
          />
          <button
            onClick={saveSignupLink}
            disabled={savingLink}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-oswald disabled:opacity-50"
          >
            Update Link
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <FilterDropdown
          value={typeFilter}
          options={filterOptions}
          onChange={(val) => setTypeFilter(val)}
        />
        <Link
          href="/dashboard/add/mem-app"
          className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] flex items-center justify-center gap-2 font-oswald"
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
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-[#011638]">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[10%]">
                  Seq
                </th>
                <th className="px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[15%]">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[50%]">
                  Content
                </th>
                <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[25%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center font-ubuntu-mono text-[#475569] animate-pulse"
                  >
                    Fetching...
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-[#fbfaf8]"} h-[80px]`}
                  >
                    <td className="px-4 py-2 text-center font-bold text-[#011638] font-ubuntu-mono">
                      {item.type === "video"
                        ? item.order_index === 1
                          ? "🌟"
                          : "🎥"
                        : item.order_index || "•"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${item.type === "video" ? "bg-purple-100 text-purple-700" : item.type === "reminder" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-ubuntu-mono text-[#475569] truncate max-w-xs">
                      {item.description}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-4">
                        {item.type === "video" && item.order_index !== 1 && (
                          <button
                            onClick={() => handleSetActiveVideo(item.id)}
                            className="text-[10px] bg-[#011638] text-white px-2 py-1 rounded uppercase font-bold hover:bg-[#eec643] hover:text-[#011638] transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <Link
                          href={`/dashboard/edit/mem-app?id=${item.id}`}
                          className="text-[#0d21a1] hover:scale-110 transition-transform"
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
                              strokeWidth="1.5"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedId(item.id);
                            setDeletePopupOpen(true);
                          }}
                          className="text-red-600 hover:scale-110 transition-transform"
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
                              strokeWidth="1.5"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages || 1}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        onConfirm={handleDelete}
        title={items.find((i) => i.id === selectedId)?.type || "item"}
      />
    </div>
  );
}