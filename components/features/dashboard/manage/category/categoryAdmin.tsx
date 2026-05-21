"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Pagination from "@/components/ui/pagination";
import { SortField, SortOrder } from "../announcements/announcementsAdmin";
import { useUser } from "@/components/context/userContext";

interface Category {
  id: number;
  r_category_name: string;
  created_at: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// --- POPUP COMPONENTS ---

function DeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  name,
  usageCount,
  isDeleting,
  deleteError,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  usageCount: { surveys: number; theses: number };
  isDeleting: boolean;
  deleteError: string | null;
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

  const hasUsage = usageCount.surveys > 0 || usageCount.theses > 0;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden text-center sm:text-left"
      >
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
            Confirm Delete
          </h3>
        </div>
        <div className="px-6 py-6">
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-ubuntu-mono">
                {deleteError}
              </p>
            </div>
          )}

          {hasUsage ? (
            <>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-4">
                Cannot delete category because it is currently in use:
              </p>
              <ul className="list-disc list-inside mb-4 text-sm text-[#475569] font-ubuntu-mono inline-block text-left">
                {usageCount.surveys > 0 && (
                  <li>
                    {usageCount.surveys}{" "}
                    {usageCount.surveys === 1 ? "survey" : "surveys"}
                  </li>
                )}
                {usageCount.theses > 0 && (
                  <li>
                    {usageCount.theses}{" "}
                    {usageCount.theses === 1 ? "thesis" : "theses"}
                  </li>
                )}
              </ul>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-6 italic">
                Please reassign these records before deleting this category.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#011638] text-white rounded-lg hover:bg-[#012a5a] font-oswald"
                >
                  OK
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#011638]">"{name}"</span>? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryFormPopup({
  isOpen,
  onClose,
  onAction,
  title,
  buttonLabel,
  initialValue = "",
  categories,
  isProcessing,
  apiError,
  isEdit = false,
  originalId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAction: (name: string) => void;
  title: string;
  buttonLabel: string;
  initialValue?: string;
  categories: Category[];
  isProcessing: boolean;
  apiError: string | null;
  isEdit?: boolean;
  originalId?: number;
}) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isOpen) setName(initialValue);
    setError("");
  }, [isOpen, initialValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node))
        onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const validateAndCheckDuplicate = (value: string) => {
    if (!value.trim()) {
      setError("");
      return;
    }
    if (value.trim().length < 2) {
      setError("Name too short");
      return;
    }

    setIsChecking(true);
    const exists = categories.some(
      (cat) =>
        cat.r_category_name.toLowerCase() === value.trim().toLowerCase() &&
        (isEdit ? cat.id !== originalId : true),
    );

    setError(exists ? "This category name already exists" : "");
    setIsChecking(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(
      () => validateAndCheckDuplicate(val),
      300,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden"
      >
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
            {title}
          </h3>
        </div>
        <div className="px-6 py-6">
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-ubuntu-mono">
              {apiError}
            </div>
          )}
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            Category Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleChange}
              maxLength={50}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono ${error ? "border-red-500" : "border-[#94a3b8]"}`}
              placeholder="e.g. Artificial Intelligence"
            />
            {isChecking && (
              <div className="absolute right-3 top-2.5 animate-spin rounded-full h-4 w-4 border-2 border-[#011638] border-t-transparent"></div>
            )}
          </div>
          {error && (
            <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638]"
            >
              Cancel
            </button>
            <button
              onClick={() => !error && name.trim() && onAction(name.trim())}
              disabled={isProcessing || !!error || !name.trim()}
              className={`px-6 py-2 rounded-lg font-oswald text-white transition-colors ${isProcessing || !!error || !name.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-[#1e4db7] hover:bg-[#0d21a1]"}`}
            >
              {isProcessing ? "Processing..." : buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function CategoryAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [popups, setPopups] = useState({ add: false, edit: false, del: false });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [usageCount, setUsageCount] = useState({ surveys: 0, theses: 0 });
  const [status, setStatus] = useState({
    processing: false,
    error: null as string | null,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((cat) =>
      cat.r_category_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("r_category")
      .select("*")
      .order("r_category_name");
    if (error) console.error(error);
    else setCategories(data || []);
    setLoading(false);
  };

  // Override or define the local SortField to include 'name'
  type CategorySortField = "name" | "created_at" | null;

  const [sortField, setSortField] = useState<CategorySortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (field: "name" | "created_at") => {
    // Update the parameter type here
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortField(null);
        setSortOrder(null);
      }
    }
  };

  useEffect(() => {
    // 1. Filter the items first
    let result = categories.filter((cat) =>
      cat.r_category_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // 2. Apply Sorting logic
    if (sortField && sortOrder) {
      result = [...result].sort((a, b) => {
        let comparison = 0;

        if (sortField === "name") {
          comparison = a.r_category_name.localeCompare(b.r_category_name);
        } else if (sortField === "created_at") {
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    setFilteredCategories(result);
    setCurrentPage(1);
  }, [searchTerm, categories, sortField, sortOrder]); // Added sort dependencies

  const handleAdd = async (name: string) => {
    setStatus({ processing: true, error: null });
    const { data, error } = await supabase
      .from("r_category")
      .insert({ r_category_name: name })
      .select()
      .single();
    if (error) setStatus({ processing: false, error: error.message });
    else {
      await logCreateAudit(name);
      setCategories((prev) =>
        [...prev, data].sort((a, b) =>
          a.r_category_name.localeCompare(b.r_category_name),
        ),
      );
      setStatus({ processing: false, error: null });
      setPopups((p) => ({ ...p, add: false }));
    }
  };

  const handleEdit = async (newName: string) => {
    if (!selectedCategory) return;
    setStatus({ processing: true, error: null });
    const { error } = await supabase
      .from("r_category")
      .update({ r_category_name: newName })
      .eq("id", selectedCategory.id);
    if (error) setStatus({ processing: false, error: error.message });
    else {
      await logEditAudit(selectedCategory, newName);
      setCategories((prev) =>
        prev
          .map((c) =>
            c.id === selectedCategory.id
              ? { ...c, r_category_name: newName }
              : c,
          )
          .sort((a, b) => a.r_category_name.localeCompare(b.r_category_name)),
      );
      setStatus({ processing: false, error: null });
      setPopups((p) => ({ ...p, edit: false }));
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setStatus({ processing: true, error: null });
    const { error } = await supabase
      .from("r_category")
      .delete()
      .eq("id", selectedCategory.id);
    if (error) setStatus({ processing: false, error: error.message });
    else {
      await logDeleteAudit(
        selectedCategory.id,
        selectedCategory.r_category_name,
      );
      setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
      setStatus({ processing: false, error: null });
      setPopups((p) => ({ ...p, del: false }));
    }
  };

  const openDelete = async (category: Category) => {
    setSelectedCategory(category);
    const [s, t] = await Promise.all([
      supabase
        .from("survey")
        .select("id", { count: "exact", head: true })
        .eq("r_category", category.id),
      supabase
        .from("thesis")
        .select("id", { count: "exact", head: true })
        .eq("r_category", category.id),
    ]);
    setUsageCount({ surveys: s.count || 0, theses: t.count || 0 });
    setPopups((p) => ({ ...p, del: true }));
  };

  //audit log
  const { user } = useUser();
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const loadCurrentUser = async (email: string) => {
    const { data } = await supabase
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

  const logCreateAudit = async (itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Created a new category: "${itemTitle}"`;

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "r_category",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const logEditAudit = async (old: Category, newName: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const changes: string[] = [];

    if (old.r_category_name !== newName) {
      changes.push(
        `category changed from "${old.r_category_name}" to "${newName}"`,
      );
    }

    if (changes.length === 0) return;

    const detailedMessage = `Updated category "${newName}" (ID: ${old.id}). Changes: [${changes.join(", ")}]`;

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "r_category",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write edit audit log:", error);
  };

  const logDeleteAudit = async (recordId?: number, itemTitle?: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Deleted category "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"})`;

    const logEntry = {
      action: "Delete",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "r_category",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);

    if (error) {
      console.error("Failed to log.");
    }
  };

  const itemsPerPage = 5;
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading)
    return (
      <div className="text-center py-20 font-ubuntu-mono text-gray-400">
        Loading Categories...
      </div>
    );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-oswald font-bold text-[#011638]">
          Research Categories
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">
          Classify and organize research data
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 border border-[#011638] rounded-xl bg-[#fbfaf8] text-[#475569] font-ubuntu-mono focus:ring-2 ring-[#011638]/10 outline-none"
          />
          <svg
            className="w-5 h-5 text-[#011638] absolute left-4 top-3"
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
        <button
          onClick={() => {
            setStatus({ processing: false, error: null });
            setPopups((p) => ({ ...p, add: true }));
          }}
          className="w-full md:w-auto bg-[#eec643] text-[#011638] px-8 py-2.5 rounded-xl hover:bg-[#d9b237] flex items-center justify-center gap-2 font-oswald shadow-md transition-all active:scale-95"
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
          New Category
        </button>
      </div>

      <div className="bg-[#fbfaf8] rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#011638] text-[#eff0f2] font-oswald uppercase text-sm tracking-wider">
              <th
                className="w-[30%] px-6 py-4 cursor-pointer hover:bg-[#012a5a] transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center justify-center gap-2">
                  Name
                  <div className="flex flex-col gap-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className={`w-3.5 h-3.5 -mb-1 ${sortField === "name" && sortOrder === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className={`w-3.5 h-3.5 -mt-1 ${sortField === "name" && sortOrder === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>
              </th>

              <th
                className="w-[30%] px-6 py-4 hidden sm:table-cell cursor-pointer hover:bg-[#012a5a] transition-colors"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center justify-center gap-2">
                  Added On
                  <div className="flex flex-col gap-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className={`w-3.5 h-3.5 -mb-1 ${sortField === "created_at" && sortOrder === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className={`w-3.5 h-3.5 -mt-1 ${sortField === "created_at" && sortOrder === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>
              </th>
              <th className="w-[20%] px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-ubuntu-mono text-[#475569]">
            {paginatedItems.map((cat) => (
              <tr
                key={cat.id}
                className="hover:bg-blue-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-oswald font-medium text-[#011638] text-lg">
                  {cat.r_category_name}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {formatDate(cat.created_at)}
                </td>
                <td className="px-6 py-4 gap-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setStatus({ processing: false, error: null });
                        setPopups((p) => ({ ...p, edit: true }));
                      }}
                      className="text-[#0d21a1] hover:scale-110 transition-transform cursor-pointer"
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
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDelete(cat)}
                      className="text-red-600 hover:scale-110 transition-transform cursor-pointer"
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
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            No matching categories found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <CategoryFormPopup
        isOpen={popups.add}
        onClose={() => setPopups((p) => ({ ...p, add: false }))}
        onAction={handleAdd}
        title="Add New Category"
        buttonLabel="Add Category"
        categories={categories}
        isProcessing={status.processing}
        apiError={status.error}
      />

      <CategoryFormPopup
        isOpen={popups.edit}
        onClose={() => setPopups((p) => ({ ...p, edit: false }))}
        onAction={handleEdit}
        title="Edit Category"
        buttonLabel="Save Changes"
        initialValue={selectedCategory?.r_category_name}
        categories={categories}
        isProcessing={status.processing}
        apiError={status.error}
        isEdit
        originalId={selectedCategory?.id}
      />

      <DeleteConfirmPopup
        isOpen={popups.del}
        onClose={() => setPopups((p) => ({ ...p, del: false }))}
        onConfirm={handleDelete}
        name={selectedCategory?.r_category_name || ""}
        usageCount={usageCount}
        isDeleting={status.processing}
        deleteError={status.error}
      />
    </div>
  );
}
