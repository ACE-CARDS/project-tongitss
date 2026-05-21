"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Pagination from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";

// Types
interface School {
  id: number;
  school_name: string;
  province: number;
  created_at: string;
  province_name?: string;
}

interface Province {
  id: number;
  prov_name: string;
}

type SortOrder = "asc" | "desc" | null;
type SchoolSortField = "name" | "province" | "created_at" | null;

// Helper: Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// --- Sub-Component: Sort Icons ---
function SortIcons({ active, order }: { active: boolean; order: SortOrder }) {
  return (
    <div className="flex flex-col gap-0.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className={`w-3 h-3 -mb-1 ${active && order === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}
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
        className={`w-3 h-3 -mt-1 ${active && order === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    </div>
  );
}

// --- Sub-Component: Delete Confirmation ---
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
  usageCount: {
    members: number;
    surveys: number;
    theses: number;
    organizations: number;
    executives: number;
  };
  isDeleting: boolean;
  deleteError: string | null;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node))
        onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const hasUsage = Object.values(usageCount).some((count) => count > 0);

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden"
      >
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
            Confirm Delete
          </h3>
        </div>
        <div className="px-6 py-6">
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-ubuntu-mono">
              {deleteError}
            </div>
          )}
          {hasUsage ? (
            <>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-4">
                Cannot delete school because it is currently in use:
              </p>
              <ul className="list-disc list-inside mb-6 text-sm text-[#475569] font-ubuntu-mono">
                {usageCount.members > 0 && (
                  <li>{usageCount.members} members</li>
                )}
                {usageCount.surveys > 0 && (
                  <li>{usageCount.surveys} surveys</li>
                )}
                {usageCount.theses > 0 && <li>{usageCount.theses} theses</li>}
                {usageCount.organizations > 0 && (
                  <li>{usageCount.organizations} organizations</li>
                )}
                {usageCount.executives > 0 && (
                  <li>{usageCount.executives} executives</li>
                )}
              </ul>
              <button
                onClick={onClose}
                className="w-full py-2 bg-[#011638] text-white rounded-lg font-oswald"
              >
                OK
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
                Are you sure you want to delete "{name}"? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638]"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-oswald disabled:opacity-50"
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

// --- Sub-Component: Edit Popup ---
function EditPopup({
  isOpen,
  onClose,
  onSave,
  school,
  schools,
  provinces,
  isSaving,
  saveError,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, name: string, provinceId: number) => void;
  school: School | null;
  schools: School[];
  provinces: Province[];
  isSaving: boolean;
  saveError: string | null;
}) {
  const [name, setName] = useState("");
  const [provinceId, setProvinceId] = useState<number>(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && school) {
      setName(school.school_name);
      setProvinceId(school.province);
      setError("");
    }
  }, [isOpen, school]);

  const handleSave = () => {
    if (!name.trim()) return setError("Name is required");
    if (
      schools.some(
        (s) =>
          s.school_name.toLowerCase() === name.trim().toLowerCase() &&
          s.id !== school?.id,
      )
    ) {
      return setError("School name already exists");
    }
    if (school) onSave(school.id, name.trim(), provinceId);
  };

  if (!isOpen || !school) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
            Edit School
          </h3>
        </div>
        <div className="px-6 py-6">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-ubuntu-mono rounded-lg">
              {saveError}
            </div>
          )}
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
            School Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[#94a3b8] rounded-lg mb-4 bg-[#fbfaf8] font-ubuntu-mono"
          />
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
            Province
          </label>
          <select
            value={provinceId}
            onChange={(e) => setProvinceId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#94a3b8] rounded-lg mb-6 bg-[#fbfaf8] font-ubuntu-mono"
          >
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prov_name}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600 mb-4">{error}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 font-ubuntu-mono">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-[#1e4db7] text-white rounded-lg font-oswald disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Component: Add Popup ---
function AddPopup({
  isOpen,
  onClose,
  onAdd,
  schools,
  provinces,
  isAdding,
  addError,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, provinceId: number) => void;
  schools: School[];
  provinces: Province[];
  isAdding: boolean;
  addError: string | null;
}) {
  const [name, setName] = useState("");
  const [provinceId, setProvinceId] = useState<number>(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setProvinceId(1);
      setError("");
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (!name.trim()) return setError("Name is required");
    if (
      schools.some(
        (s) => s.school_name.toLowerCase() === name.trim().toLowerCase(),
      )
    )
      return setError("Already exists");
    onAdd(name.trim(), provinceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
            Add School
          </h3>
        </div>
        <div className="px-6 py-6">
          {addError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-ubuntu-mono rounded-lg">
              {addError}
            </div>
          )}
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
            School Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[#94a3b8] rounded-lg mb-4 bg-[#fbfaf8] font-ubuntu-mono"
          />
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
            Province
          </label>
          <select
            value={provinceId}
            onChange={(e) => setProvinceId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#94a3b8] rounded-lg mb-6 bg-[#fbfaf8] font-ubuntu-mono"
          >
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prov_name}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600 mb-4">{error}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 font-ubuntu-mono">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="px-6 py-2 bg-[#1e4db7] text-white rounded-lg font-oswald disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add School"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function SchoolAdmin() {
  const [schools, setSchools] = useState<School[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // State for Sorting
  const [sortField, setSortField] = useState<SchoolSortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Popups & Processing
  const [popups, setPopups] = useState({ add: false, edit: false, del: false });
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [usageCount, setUsageCount] = useState({
    members: 0,
    surveys: 0,
    theses: 0,
    organizations: 0,
    executives: 0,
  });
  const [status, setStatus] = useState({
    processing: false,
    error: null as string | null,
  });

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [provRes, schoolRes] = await Promise.all([
        supabase.from("province").select("*").order("prov_name"),
        supabase
          .from("school")
          .select(`*, province:province(prov_name)`)
          .order("school_name"),
      ]);
      if (!provRes.error) setProvinces(provRes.data || []);
      if (!schoolRes.error) {
        setSchools(
          (schoolRes.data || []).map((s: any) => ({
            ...s,
            province_name: s.province?.prov_name,
          })),
        );
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSort = (field: Exclude<SchoolSortField, null>) => {
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
    let result = schools.filter((s) =>
      s.school_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    if (sortField && sortOrder) {
      result = [...result].sort((a, b) => {
        let comp = 0;
        if (sortField === "name")
          comp = a.school_name.localeCompare(b.school_name);
        else if (sortField === "province")
          comp = (a.province_name || "").localeCompare(b.province_name || "");
        else if (sortField === "created_at")
          comp =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === "asc" ? comp : -comp;
      });
    }
    setFilteredSchools(result);
    setCurrentPage(1);
  }, [searchTerm, schools, sortField, sortOrder]);

  const checkUsage = async (id: number) => {
    const queries = [
      "member",
      "survey",
      "thesis",
      "organization",
      "executives",
    ].map((table) =>
      supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("school", id),
    );
    const results = await Promise.all(queries);
    return {
      members: results[0].count || 0,
      surveys: results[1].count || 0,
      theses: results[2].count || 0,
      organizations: results[3].count || 0,
      executives: results[4].count || 0,
    };
  };

  const handleAdd = async (name: string, provinceId: number) => {
    setStatus({ processing: true, error: null });
    const { data, error } = await supabase
      .from("school")
      .insert({ school_name: name, province: provinceId })
      .select()
      .single();
    if (error) setStatus({ processing: false, error: error.message });
    else {
      const provName = provinces.find((p) => p.id === provinceId)?.prov_name;
      await logCreateAudit(name);
      setSchools((prev) =>
        [...prev, { ...data, province_name: provName }].sort((a, b) =>
          a.school_name.localeCompare(b.school_name),
        ),
      );
      setPopups((p) => ({ ...p, add: false }));
      setStatus({ processing: false, error: null });
    }
  };

  const handleEdit = async (id: number, name: string, provinceId: number) => {
    const originalSchool = schools.find((s) => s.id === id);
    if (!originalSchool) return;

    setStatus({ processing: true, error: null });
    const { error } = await supabase
      .from("school")
      .update({ school_name: name, province: provinceId })
      .eq("id", id);
    if (error) setStatus({ processing: false, error: error.message });
    else {
      const provName = provinces.find((p) => p.id === provinceId)?.prov_name;
      await logEditAudit(originalSchool, name, provinceId, provName || "N/A");
      setSchools((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                school_name: name,
                province: provinceId,
                province_name: provName,
              }
            : s,
        ),
      );
      setPopups((p) => ({ ...p, edit: false }));
      setStatus({ processing: false, error: null });
    }
  };

  const handleDelete = async () => {
    if (!selectedSchool) return;
    setStatus({ processing: true, error: null });
    const { error } = await supabase
      .from("school")
      .delete()
      .eq("id", selectedSchool.id);
    if (error) setStatus({ processing: false, error: error.message });
    else {
      await logDeleteAudit(selectedSchool.id, selectedSchool.school_name);
      setSchools((prev) => prev.filter((s) => s.id !== selectedSchool.id));
      setPopups((p) => ({ ...p, del: false }));
      setStatus({ processing: false, error: null });
    }
  };

  const itemsPerPage = 5;
  const totalItems = filteredSchools.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

    const detailedMessage = `Created a new school named "${itemTitle}"`;

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "school",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const logEditAudit = async (
    old: School,
    newName: string,
    newProvinceId: number,
    newProvinceName: string,
  ) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const changes: string[] = [];

    if (old.school_name !== newName) {
      changes.push(
        `school name changed from "${old.school_name}" to "${newName}"`,
      );
    }
    if (old.province !== newProvinceId) {
      changes.push(
        `province changed from "${old.province_name || "N/A"}" to "${newProvinceName}"`,
      );
    }

    if (changes.length === 0) return;

    const detailedMessage = `Updated school "${newName}" (ID: ${old.id}). Changes: [${changes.join(", ")}]`;

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "school",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write edit audit log:", error);
  };

  const logDeleteAudit = async (recordId?: number, itemTitle?: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Deleted school "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"})`;

    const logEntry = {
      action: "Delete",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "school",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);

    if (error) {
      console.error("Failed to log.");
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 font-ubuntu-mono text-gray-400">
        Loading Schools...
      </div>
    );

  return (
    <div className="py-4">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 border border-[#011638] rounded-xl bg-[#fbfaf8] text-[#475569] font-ubuntu-mono outline-none"
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
          onClick={() => setPopups((p) => ({ ...p, add: true }))}
          className="w-full md:w-auto bg-[#eec643] text-[#011638] px-8 py-2.5 rounded-xl hover:bg-[#d9b237] font-oswald shadow-md"
        >
          Add School
        </button>
      </div>

      <div className="bg-[#fbfaf8] rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#011638] text-[#eff0f2] font-oswald uppercase text-xs tracking-wider">
              <th
                className="w-[40%] px-6 py-4 cursor-pointer hover:bg-[#012a5a]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center justify-center gap-2">
                  School Name{" "}
                  <SortIcons active={sortField === "name"} order={sortOrder} />
                </div>
              </th>
              <th
                className="w-[30%] px-6 py-4 cursor-pointer hover:bg-[#012a5a]"
                onClick={() => handleSort("province")}
              >
                <div className="flex items-center justify-center gap-2">
                  Province{" "}
                  <SortIcons
                    active={sortField === "province"}
                    order={sortOrder}
                  />
                </div>
              </th>
              <th
                className="w-[20%] px-6 py-4 cursor-pointer hover:bg-[#012a5a] hidden sm:table-cell"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center justify-center gap-2">
                  Date Added{" "}
                  <SortIcons
                    active={sortField === "created_at"}
                    order={sortOrder}
                  />
                </div>
              </th>
              <th className="w-fit px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-ubuntu-mono text-[#475569]">
            {paginatedItems.map((school) => (
              <tr
                key={school.id}
                className="hover:bg-blue-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-oswald font-medium text-[#011638] text-lg text-center">
                  {school.school_name}
                </td>
                <td className="px-6 py-4 text-center">
                  {school.province_name || "N/A"}
                </td>
                <td className="px-6 py-4 text-center hidden sm:table-cell">
                  {formatDate(school.created_at)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedSchool(school);
                        setPopups((p) => ({ ...p, edit: true }));
                      }}
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
                    </button>
                    <button
                      onClick={async () => {
                        const usage = await checkUsage(school.id);
                        setUsageCount(usage);
                        setSelectedSchool(school);
                        setPopups((p) => ({ ...p, del: true }));
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
            ))}
          </tbody>
        </table>
      </div>

      {filteredSchools.length > itemsPerPage && (
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

      <AddPopup
        isOpen={popups.add}
        onClose={() => setPopups((p) => ({ ...p, add: false }))}
        onAdd={handleAdd}
        schools={schools}
        provinces={provinces}
        isAdding={status.processing}
        addError={status.error}
      />
      <EditPopup
        isOpen={popups.edit}
        onClose={() => setPopups((p) => ({ ...p, edit: false }))}
        onSave={handleEdit}
        school={selectedSchool}
        schools={schools}
        provinces={provinces}
        isSaving={status.processing}
        saveError={status.error}
      />
      <DeleteConfirmPopup
        isOpen={popups.del}
        onClose={() => setPopups((p) => ({ ...p, del: false }))}
        onConfirm={handleDelete}
        name={selectedSchool?.school_name || ""}
        usageCount={usageCount}
        isDeleting={status.processing}
        deleteError={status.error}
      />
    </div>
  );
}
