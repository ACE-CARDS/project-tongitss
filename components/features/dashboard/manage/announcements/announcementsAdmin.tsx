"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";
import SortIcon from "@/components/ui/sortIcon";
import TableActions from "@/components/ui/tableActions";
import SearchBar from "@/components/ui/searchBar";
import AddButton from "@/components/ui/addButton";
import Popup from "@/components/ui/popup";
import TabPill from "@/components/ui/tabPill";

interface AnnouncementItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export type SortField = "title" | "start_date" | null;
export type SortOrder = "asc" | "desc" | null;
type TabType = "landing" | "dashboard";

// --- Sub-Component: Expandable Description ---
function AnnouncementDescription({ description }: { description: string }) {
  const [isOpen, setIsOpen] = useState(false);
  if (description.length <= 120) {
    return (
      <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed break-words">
        {description}
      </p>
    );
  }
  return (
    <div className="w-full">
      {!isOpen ? (
        <div>
          <p className="text-sm text-[#475569] font-ubuntu-mono line-clamp-2 break-words">
            {description}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors cursor-pointer"
          >
            Read more →
          </button>
        </div>
      ) : (
        <div>
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed max-h-32 overflow-y-auto pr-2 break-words custom-scrollbar-blue">
            {description}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors cursor-pointer"
          >
            Read less ↑
          </button>
        </div>
      )}
    </div>
  );
}

// --- Sub-Component: Standardized Delete Portal ---
function DeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <Popup 
      isOpen={isOpen} 
      title="Confirm Delete" 
      onClose={isDeleting ? () => {} : onClose} // Prevent closing overlay while mutating database
      maxWidth="md"
    >
      <span className="form_error">{"\u200b"}</span>
      <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
        Are you sure you want to delete the announcement
        <span className="font-bold text-[#011638] block py-2">"{title}"?</span>
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="form_btn-cancel"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="form_btn-red"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Popup>
  );
}

// --- MAIN COMPONENT ---
export default function AnnouncementsAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabType>("landing");
  const [currentPage, setCurrentPage] = useState(1);

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const tabConfig = useMemo(() => [
    { id: "landing" as const, label: "Landing Page" },
    { id: "dashboard" as const, label: "Member Dashboard" },
  ], []);

  // User Audit State Integration
  const { user } = useUser();
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const loadCurrentUser = async (email: string) => {
    const { data } = await supabase
      .from("member")
      .select("mem_fname, mem_lname, mem_email")
      .eq("mem_email", email)
      .single();

    const fullName = data ? `${data.mem_fname || ""} ${data.mem_lname || ""}`.trim() : email;
    setCurrentUserName(fullName || email);
    setCurrentUserEmail(data?.mem_email || email);
  };

  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  const logDeleteAudit = async (tableName: string, recordId?: number, itemTitle?: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";

    const logEntry = {
      action: "Delete",
      details: `Deleted announcement "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"}) from ${tableName}`,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: tableName,
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write audit log", error);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [activeTab]);

  useEffect(() => {
    let filtered = announcements.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(formatDate(item.start_date || "")).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(formatDate(item.end_date || "")).toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (sortField && sortOrder) {
      filtered.sort((a, b) => {
        let aValue = sortField === "title" ? a.title.toLowerCase() : new Date(a.start_date).getTime();
        let bValue = sortField === "title" ? b.title.toLowerCase() : new Date(b.start_date).getTime();
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  }, [searchTerm, announcements, sortField, sortOrder]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const tableName = activeTab === "landing" ? "announce_landing" : "announce_dash";
    const prefix = activeTab === "landing" ? "announce_landing" : "announce_dash";

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mappedData = data.map((item: any) => ({
        id: item.id,
        title: item[`${prefix}_title`],
        description: item[`${prefix}_desc`],
        start_date: item[`${prefix}_start`],
        end_date: item[`${prefix}_end`],
        created_at: item.created_at,
      }));
      setAnnouncements(mappedData);
    }
    setLoading(false);
  };

  const handleSort = (field: SortField) => {
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

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    setIsDeleting(true);
    const tableName = activeTab === "landing" ? "announce_landing" : "announce_dash";

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", selectedAnnouncement.id);

      if (error) {
        console.error("Delete failed:", error);
        return;
      }

      await logDeleteAudit(tableName, selectedAnnouncement.id, selectedAnnouncement.title);
      setAnnouncements((prev) => prev.filter((item) => item.id !== selectedAnnouncement.id));
      setDeletePopupOpen(false);
      setSelectedAnnouncement(null);
    } catch (err) {
      console.error("Unexpected removal error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const itemsPerPage = 5;
  const totalItems = filteredAnnouncements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8 flex justify-between sm:items-end items-center sm:flex-row flex-col sm:gap-0 gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638]">
            Announcements Management
          </h1>
          <p className="text-[#475569] font-ubuntu-mono mt-1">
            Control active notices for the landing page and member area
          </p>
        </div>

        <TabPill
          tabs={tabConfig} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddButton
          href="/dashboard/add/announcement"
          label="New Announcement"
        />
      </div>

      {/* Table Section */}
      <div className="manage_table_div">
        <table className="manage_table">
          <thead className="manage_thead">
            <tr>
              <th
                className={`w-[250px] th-sortable ${sortField === "title" ? "is-active" : ""}`}
                onClick={() => handleSort("title")}
              >
                <div>
                  Title
                  <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[350px]">Description</th>

              <th
                className={`w-[150px] th-sortable ${sortField === "start_date" ? "is-active" : ""}`}
                onClick={() => handleSort("start_date")}
              >
                <div>
                  Duration
                  <SortIcon field="start_date" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[100px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="status">Loading records...</td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="status">No announcements found.</td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="title">{item.title}</td>

                  <td className="text-sm text-[#475569]">
                    <AnnouncementDescription description={item.description} />
                  </td>

                  <td className="date_col">
                    <span className="block">{formatDate(item.start_date)}</span>
                    <span className="text-gray-400 text-xs">to</span>
                    <span className="block">{formatDate(item.end_date)}</span>
                  </td>

                  <td className="text-center">
                    <TableActions
                      item={item}
                      editHref={`/dashboard/edit/announcement?id=${item.id}&type=${activeTab}`}
                      onDeleteClick={(targetItem) => {
                        setSelectedAnnouncement(targetItem);
                        setDeletePopupOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Standard Portal Modal Layout instance */}
      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeletePopupOpen(false);
            setSelectedAnnouncement(null);
          }
        }}
        onConfirm={handleDelete}
        title={selectedAnnouncement?.title || ""}
      />
    </div>
  );
}