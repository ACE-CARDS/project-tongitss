"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";
import SortIcon from "@/components/ui/sortIcon";
import TableActions from "@/components/ui/tableActions";
import SearchBar from "@/components/ui/searchBar";
import AddButton from "@/components/ui/addButton";
import Popup from "@/components/ui/popup";
import FormActions from "@/components/ui/FormActions";

interface NewsItem {
  id: number;
  title: string | null;
  content: string | null;
  image_url: string | null;
  post_url: string;
  fb_post_date: string;
  created_at: string;
}

export type SortField = "title" | "fb_post_date" | null;
export type SortOrder = "asc" | "desc" | null;

// --- Sub-Component: Expandable Description ---
function NewsDescription({ description }: { description: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!description) return null;
  if (description.length <= 100) {
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
        Are you sure you want to delete the news article
        <span className="font-bold text-[#011638] block py-2 break-words">"{title}"?</span>
        This action cannot be undone.
      </p>
      <FormActions
        onCancelClick={onClose}
        onSubmitClick={onConfirm}
        isStatus={isDeleting}
        variant="red"
        showBorder={false}
        submitLabel="Delete"
        submittingLabel="Deleting..."
      />
    </Popup>
  );
}

// --- MAIN COMPONENT ---
export default function NewsAdmin() {
  const supabase = createClient();
  const router = useRouter();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Pagination Local State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const logDeleteAudit = async (recordId?: number, itemTitle?: string | null) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";

    const logEntry = {
      action: "Delete",
      details: `Deleted media "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"})`,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "news_media",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write audit log", error);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = news.filter((item) =>
      (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortField && sortOrder) {
      filtered.sort((a, b) => {
        let aValue = sortField === "title" ? (a.title || "").toLowerCase() : new Date(a.fb_post_date).getTime();
        let bValue = sortField === "title" ? (b.title || "").toLowerCase() : new Date(b.fb_post_date).getTime();
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFilteredNews(filtered);
    setCurrentPage(1);
  }, [searchTerm, news, sortField, sortOrder]);

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("news_media")
      .select("*")
      .order("created_at", { ascending: false });
    setNews(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedNews) return;
    setIsDeleting(true);

    try {
      await logDeleteAudit(selectedNews.id, selectedNews.title);
      const { error } = await supabase.from("news_media").delete().eq("id", selectedNews.id);

      if (error) {
        console.error("Delete failed:", error);
        return;
      }

      setNews((prev) => prev.filter((item) => item.id !== selectedNews.id));
      setDeletePopupOpen(false);
      setSelectedNews(null);
    } catch (err) {
      console.error("Unexpected removal error:", err);
    } finally {
      setIsDeleting(false);
    }
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

  const totalItems = filteredNews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredNews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNews, validCurrentPage, itemsPerPage]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">
          News Management
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">
          Manage your community updates and announcements
        </p>
      </div>

      {/* Control Bar Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddButton
          href="/dashboard/add/news-media?from=admin"
          label="Add News"
        />
      </div>

      {/* Table / Content Section */}
      <div className="manage_table_div">
        <table className="manage_table">
          <thead className="manage_thead">
            <tr>
              <th className="w-[200px]">Image</th>
              
              <th
                className={`w-[500px] th-sortable ${sortField === "title" ? "is-active" : ""}`}
                onClick={() => handleSort("title")}
              >
                <div>
                  Title & Description
                  <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[150px] th-sortable ${sortField === "fb_post_date" ? "is-active" : ""}`}
                onClick={() => handleSort("fb_post_date")}
              >
                <div>
                  Post Date
                  <SortIcon field="fb_post_date" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[100px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="status">Loading news...</td>
              </tr>
            ) : filteredNews.length === 0 ? (
              <tr>
                <td colSpan={4} className="status">No news found.</td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  {/* Thumbnail Cover */}
                  <td className="">
                    <div className="flex justify-center">
                      <a href={item.post_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={item.image_url || "/assets/logos/ACE CARDS logo.png"}
                          alt="News Media Thumbnail"
                          className="w-16 h-16 object-cover rounded-md border border-gray-100 shadow-sm hover:opacity-80 transition-opacity"
                        />
                      </a>
                    </div>
                  </td>

                  {/* Title and Contents info */}
                  <td className="align-top break-words max-w-full whitespace-normal">
                    <a
                      href={item.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-oswald font-semibold text-[#011638] hover:underline block mb-1 break-words"
                    >
                      {item.title}
                    </a>
                    <NewsDescription description={item.content} />
                  </td>

                  {/* Date Metadata */}
                  <td className="date_col">
                    {formatDate(item.fb_post_date)}
                  </td>

                  {/* Table Context Controls */}
                  <td className="text-center">
                    <TableActions
                      item={item}
                      editHref={`/dashboard/edit/news-media?id=${item.id}&from=admin`}
                      onDeleteClick={(targetItem) => {
                        setSelectedNews(targetItem);
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

      <Pagination
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeletePopupOpen(false);
            setSelectedNews(null);
          }
        }}
        onConfirm={handleDelete}
        title={selectedNews?.title || "this news article"}
      />
    </div>
  );
}