"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/context/userContext";
import Pagination from "@/components/ui/pagination";
import SearchBar from "@/components/ui/searchBar";
import AddButton from "@/components/ui/addButton";
import Popup from "@/components/ui/popup";
import FormActions from "@/components/ui/FormActions";
import TableActions from "@/components/ui/tableActions";

interface Scholarship {
    id: number;
    school: string;
    school_acronym: string;
    province: string;
    courses: string;
    created_at?: string;
    updated_at?: string;
}

interface FAQ {
    id: number;
    question: string;
    answer: string;
    order_index: number;
    created_at?: string;
    updated_at?: string;
}

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
            <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">Are you sure you want to delete <span className="font-bold text-[#011638] py-2 break-words">"{title}"</span>? This action cannot be undone.</p>
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

export default function ScholarshipAdmin() {
    const supabase = createClient();
    const router = useRouter();
    const { user } = useUser();

    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [activeTab, setActiveTab] = useState<"schools" | "faqs">("schools");
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletePopupOpen, setDeletePopupOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Scholarship | FAQ | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination Local State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // User Audit State
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

    const logAudit = async (action: string, details: string, table: string) => {
        const whoDidItName = currentUserName || user?.email || "Unknown User";
        const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";

        const { error } = await supabase.from("audit_log").insert([{
            action,
            details,
            user: whoDidItName,
            user_email: whoDidItEmail,
            table_name: table,
        }]);

        if (error) console.error("Failed to write audit log:", error);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchScholarships(), fetchFaqs()]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchScholarships = async () => {
        const { data, error } = await supabase
            .from("scholarship")
            .select("*")
            .order("school", { ascending: true });

        if (error) throw error;
        setScholarships(data || []);
    };

    const fetchFaqs = async () => {
        const { data, error } = await supabase
            .from("scholarship_faq")
            .select("*")
            .order("order_index", { ascending: true });

        if (error) throw error;
        setFaqs(data || []);
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        setIsDeleting(true);

        try {
            const isSchool = 'school' in selectedItem;
            const table = isSchool ? "scholarship" : "scholarship_faq";
            const itemName = isSchool ? selectedItem.school : selectedItem.question;

            const { error } = await supabase
                .from(table)
                .delete()
                .eq("id", selectedItem.id);

            if (error) throw error;

            await logAudit("Delete",
                `Deleted ${isSchool ? "school" : "FAQ"}: ${itemName}`,
                table
            );

            setDeletePopupOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (err: any) {
            console.error("Delete failed:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReorder = async (id: number, direction: "up" | "down") => {
        const currentIndex = faqs.findIndex(f => f.id === id);
        if (currentIndex === -1) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= faqs.length) return;

        const newFaqs = [...faqs];
        [newFaqs[currentIndex], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[currentIndex]];
        setFaqs(newFaqs);

        try {
            const updates = newFaqs.map((faq, index) => ({
                id: faq.id,
                order_index: index
            }));

            for (const update of updates) {
                const { error } = await supabase
                    .from("scholarship_faq")
                    .update({ order_index: update.order_index })
                    .eq("id", update.id);
                if (error) throw error;
            }

            await logAudit("Update", `Reordered FAQs`, "scholarship_faq");
        } catch (err: any) {
            console.error("Reorder failed:", err);
            fetchFaqs();
        }
    };

    // Filtered data
    const filteredSchools = useMemo(() => {
        if (!searchTerm) return scholarships;
        const term = searchTerm.toLowerCase();
        return scholarships.filter(s =>
            s.school.toLowerCase().includes(term) ||
            s.school_acronym.toLowerCase().includes(term) ||
            s.province.toLowerCase().includes(term) ||
            s.courses.toLowerCase().includes(term)
        );
    }, [scholarships, searchTerm]);

    const filteredFaqs = useMemo(() => {
        if (!searchTerm) return faqs;
        const term = searchTerm.toLowerCase();
        return faqs.filter(f =>
            f.question.toLowerCase().includes(term) ||
            f.answer.toLowerCase().includes(term)
        );
    }, [faqs, searchTerm]);

    const totalItems = activeTab === "schools" ? filteredSchools.length : filteredFaqs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

    const paginatedSchools = useMemo(() => {
        const startIndex = (validCurrentPage - 1) * itemsPerPage;
        return filteredSchools.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSchools, validCurrentPage, itemsPerPage]);

    const paginatedFaqs = useMemo(() => {
        const startIndex = (validCurrentPage - 1) * itemsPerPage;
        return filteredFaqs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFaqs, validCurrentPage, itemsPerPage]);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-oswald font-bold text-[#011638]">
                    Scholarship Management
                </h1>
                <p className="text-[#475569] font-ubuntu-mono mt-1">
                    Manage accredited schools and FAQ entries
                </p>
            </div>

            {/* Control Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                <AddButton
                    href={`/dashboard/add/scholarship?type=${activeTab === "schools" ? "school" : "faq"}`}
                    label={`Add ${activeTab === "schools" ? "School & Courses" : "Frequently Asked Question"}`}
                />
            </div>

            {/* Tabs */}
            <div className="flex w-full border-b border-gray-200 mb-6">
                <button
                    onClick={() => {
                        setActiveTab("schools");
                        setCurrentPage(1);
                    }}
                    className={`flex-1 text-center px-6 py-3 font-oswald font-bold tracking-wide uppercase transition-colors ${activeTab === "schools" ? "border-b-4 border-[#011638] text-[#011638]" : "text-slate-400 hover:text-[#011638]"}`}
                >
                    Schools & Courses
                </button>
                <button
                    onClick={() => {
                        setActiveTab("faqs");
                        setCurrentPage(1);
                    }}
                    className={`flex-1 text-center px-6 py-3 font-oswald font-bold tracking-wide uppercase transition-colors ${activeTab === "faqs" ? "border-b-4 border-[#011638] text-[#011638]" : "text-slate-400 hover:text-[#011638]"}`}
                >
                    Frequently Asked Questions
                </button>
            </div>

            {/* Content */}
            <div className="manage_table_div">
                <table className="manage_table">
                    <thead className="manage_thead">
                        <tr>
                            {activeTab === "schools" ? (
                                <>
                                    <th className="w-[200px]">School</th>
                                    <th className="w-[100px]">Acronym</th>
                                    <th className="w-[120px]">Province</th>
                                    <th className="w-[350px]">Courses</th>
                                    <th className="w-[100px]">Actions</th>
                                </>
                            ) : (
                                <>
                                    <th className="w-[50px]">#</th>
                                    <th className="w-[250px]">Question</th>
                                    <th className="w-[350px]">Answer</th>
                                    <th className="w-[150px]">Actions</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="status">Loading...</td>
                            </tr>
                        ) : activeTab === "schools" ? (
                            paginatedSchools.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="status">No schools found.</td>
                                </tr>
                            ) : (
                                paginatedSchools.map((school) => (
                                    <tr key={school.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="break-words max-w-full whitespace-normal">{school.school}</td>
                                        <td className="font-bold">{school.school_acronym}</td>
                                        <td>{school.province}</td>
                                        <td className="break-words max-w-full whitespace-normal text-sm">{school.courses}</td>
                                        <td>
                                            <TableActions
                                                item={school}
                                                editHref={`/dashboard/edit/scholarship?id=${school.id}&type=school`}
                                                onDeleteClick={(item) => {
                                                    setSelectedItem(item);
                                                    setDeletePopupOpen(true);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            paginatedFaqs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="status">No FAQs found.</td>
                                </tr>
                            ) : (
                                paginatedFaqs.map((faq, index) => {
                                    const globalIndex = (validCurrentPage - 1) * itemsPerPage + index;
                                    return (
                                        <tr key={faq.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="text-center">{globalIndex + 1}</td>
                                            <td className="break-words max-w-full whitespace-normal">{faq.question}</td>
                                            <td className="break-words max-w-full whitespace-normal text-sm">{faq.answer}</td>
                                            <td>
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleReorder(faq.id, "up")}
                                                        disabled={globalIndex === 0}
                                                        className={`p-1 rounded ${globalIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-[#011638] hover:bg-[#011638]/10"}`}
                                                        title="Move up"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleReorder(faq.id, "down")}
                                                        disabled={globalIndex === filteredFaqs.length - 1}
                                                        className={`p-1 rounded ${globalIndex === filteredFaqs.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-[#011638] hover:bg-[#011638]/10"}`}
                                                        title="Move down"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <TableActions
                                                        item={faq}
                                                        editHref={`/dashboard/edit/scholarship?id=${faq.id}&type=faq`}
                                                        onDeleteClick={(item) => {
                                                            setSelectedItem(item);
                                                            setDeletePopupOpen(true);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )
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
                        setSelectedItem(null);
                    }
                }}
                onConfirm={handleDelete}
                title={selectedItem && 'school' in selectedItem ? selectedItem.school : selectedItem && 'question' in selectedItem ? selectedItem.question : "this entry"}
            />
        </div>
    );
}