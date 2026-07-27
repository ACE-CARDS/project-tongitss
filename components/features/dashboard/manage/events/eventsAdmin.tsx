"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";
import SortIcon from "@/components/ui/sortIcon";
import AddButton from "@/components/ui/addButton";
import TableActions from "@/components/ui/tableActions";
import SearchBar from "@/components/ui/searchBar";
import Popup from "@/components/ui/popup";

interface EventItem {
  id: number;
  title: string;
  short_title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  location: string;
  status: string;
  year: string;
  partnerships: string | null;
}

type SortField = "title" | "start_date" | "location" | "status" | null;
type SortOrder = "asc" | "desc" | null;

// Helper: Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

function EventDescription({ description }: { description: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!description) return null;
  if (description.length <= 100) {
    return (
      <p className="text-sm text-[#475569] font-ubuntu-mono break-words">
        {description}
      </p>
    );
  }
  return (
    <div className="w-[100%]">
      {!isOpen ? (
        <div>
          <p className="text-sm text-[#475569] font-ubuntu-mono line-clamp-2 break-words">
            {description}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[#0d21a1] ml-auto text-xs font-ubuntu-mono hover:text-[#011638] mt-1 flex transition-colors cursor-pointer"
          >
            Read more
          </button>
        </div>
      ) : (
        <div>
          <div className="text-sm text-[#475569] font-ubuntu-mono h-24 overflow-y-auto pr-2 break-words custom-scrollbar-blue">
            {description}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#0d21a1] ml-auto text-xs font-ubuntu-mono hover:text-[#011638] mt-1 flex transition-colors cursor-pointer"
          >
            Read less
          </button>
        </div>
      )}
    </div>
  );
}


function EventPartnerships({ partnerships }: { partnerships: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!partnerships) return null;
  if (partnerships.length <= 100) {
    return (
      <div className="flex flex-col w-full whitespace-pre-line">
        <p className="text-[10px] font-black tracking-widest uppercase pt-2 text-slate-400 mb-1">
          Partnered with:
        </p>
        <p className="text-sm text-[#475569] font-ubuntu-mono">
          {partnerships}
        </p>
      </div>
    );
  }
  return (
    <div className="w-[100%]">
      {!isOpen ? (
        <div className="flex flex-col w-full whitespace-pre-line">
          <p className="text-[10px] font-black tracking-widest uppercase pt-2 text-slate-400 mb-1">
            Partnered with:
          </p>
          <p className="text-sm text-[#475569] font-ubuntu-mono line-clamp-2 break-words">
            {partnerships}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[#0d21a1] justify-right ml-auto text-xs font-ubuntu-mono hover:text-[#011638] mt-1 transition-colors cursor-pointer"
          >
            Read more
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full whitespace-pre-line">
          <p className="text-[10px] font-black tracking-widest uppercase pt-2 text-slate-400 mb-1">
            Partnered with:
          </p>
          <div className="text-sm text-[#475569] font-ubuntu-mono h-24 overflow-y-auto pr-2 break-words custom-scrollbar-blue">
            {partnerships}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#0d21a1] justify-right ml-auto text-xs font-ubuntu-mono hover:text-[#011638] mt-1 transition-colors cursor-pointer"
          >
            Read less
          </button>
        </div>
      )}
    </div>
  );
}

// --- Standardized Delete Portal ---
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
      onClose={isDeleting ? () => {} : onClose}
      maxWidth="md"
    >
      <span className="form_error">{"\u200b"}</span>
      <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
        Are you sure you want to delete the event
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

export default function EventsAdmin() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Pagination Local State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.short_title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (sortField && sortOrder) {
      filtered.sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        switch (sortField) {
          case "title":
            aValue = (a.title || "").toLowerCase();
            bValue = (b.title || "").toLowerCase();
            break;
          case "start_date":
            aValue = new Date(a.start_date).getTime();
            bValue = new Date(b.start_date).getTime();
            break;
          case "location":
            aValue = (a.location || "").toLowerCase();
            bValue = (b.location || "").toLowerCase();
            break;
          case "status":
            aValue = (a.status || "").toLowerCase();
            bValue = (b.status || "").toLowerCase();
            break;
          default:
            break;
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [searchTerm, events, sortField, sortOrder]);

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, validCurrentPage, itemsPerPage]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_deleted", false)
      .order("start_date", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setIsDeleting(true);

    try {
      await logDeleteAudit(selectedEvent.id, selectedEvent.title);
      const { error } = await supabase
        .from("events")
        .update({ is_deleted: true })
        .eq("id", selectedEvent.id);

      if (error) {
        console.error("Delete failed:", error);
        return;
      }

      setEvents((prev) => prev.filter((item) => item.id !== selectedEvent.id));
      setDeletePopupOpen(false);
      setSelectedEvent(null);
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

  const formatSchedule = (start: string, end: string) => {
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const startDate = new Date(start);
    const d1 = startDate.toLocaleDateString("en-US", opts);

    if (!end || start === end) return d1;

    const endDate = new Date(end);
    const d2 = endDate.toLocaleDateString("en-US", opts);

    if (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth()
    ) {
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const monthYearStr = startDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const [month, year] = monthYearStr.split(" ");
      return `${month} ${startDay}-${endDay}, ${year}`;
    }

    return `${d1} - ${d2}`;
  };

  // audit log
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

  const logDeleteAudit = async (recordId?: number, itemTitle?: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Deleted event "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"})`;

    const logEntry = {
      action: "Delete",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "events",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to log.");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">
          Event Management
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">
          Manage and moderate all community event schedules
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddButton
          href="/dashboard/add/event?from=admin"
          label="Add Event"
        />
      </div>

      <div className="manage_table_div">
        <table className="manage_table">
          <thead className="manage_thead">
            <tr>
              <th className="w-[150px]">Media</th>

              <th
                className={`w-[400px] th-sortable ${sortField === "title" ? "is-active" : ""}`}
                onClick={() => handleSort("title")}
              >
                <div>
                  Title & Info
                  <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[150px] th-sortable ${sortField === "start_date" ? "is-active" : ""}`}
                onClick={() => handleSort("start_date")}
              >
                <div>
                  Schedule
                  <SortIcon field="start_date" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[150px] th-sortable ${sortField === "location" ? "is-active" : ""}`}
                onClick={() => handleSort("location")}
              >
                <div>
                  Location
                  <SortIcon field="location" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[110px] th-sortable ${sortField === "status" ? "is-active" : ""}`}
                onClick={() => handleSort("status")}
              >
                <div>
                  Status
                  <SortIcon field="status" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[100px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="status">Loading events...</td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="status">No events found.</td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <img
                        src={item.image_url || "/assets/logos/ACE CARDS logo.png"}
                        alt="Event Media Thumbnail"
                        className="w-16 h-16 object-cover rounded-md border border-gray-100 shadow-sm hover:opacity-80 transition-opacity"
                      />
                    </div>
                  </td>
                  <td className="align-top break-words max-w-full">
                    <div className="text-sm font-oswald font-semibold text-[#011638] mb-1">
                      {item.title}
                    </div>
                    {item.short_title && (
                      <div className="text-xs text-gray-500 font-ubuntu-mono mb-1">
                        {item.short_title}
                      </div>
                    )}
                    <EventDescription description={item.description} />
                    <EventPartnerships partnerships={item.partnerships} />
                  </td>


                  {item.end_date && item.start_date !== item.end_date ? (
                    <td className="date_col">
                      <span className="block">{formatDate(item.start_date)}</span>
                      <span className="text-gray-400 text-xs">to</span>
                      <span className="block">{formatDate(item.end_date)}</span>
                    </td>
                  ) : (
                    <td className="date_col">
                      <span className="block">{formatDate(item.start_date)}</span>
                    </td>
                  )}

                  <td className="date_col">
                    <span>{item.location || "N/A"}</span>
                  </td>

                  <td className="text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${item.status?.toUpperCase() === "COMPLETED" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="text-center">
                    <TableActions
                      item={item}
                      editHref={`/dashboard/edit/event/${item.id}`}
                      onDeleteClick={(targetItem) => {
                        setSelectedEvent(targetItem);
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

      {totalPages > 1 && (
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeletePopupOpen(false);
            setSelectedEvent(null);
          }
        }}
        onConfirm={handleDelete}
        title={selectedEvent?.title || "this event"}
      />
    </div>
  );
}