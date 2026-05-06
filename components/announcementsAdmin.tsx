"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AnnouncementItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

// New Read more component for Announcement description
function AnnouncementDescription({ description }: { description: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (description.length <= 120) {
    return <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed break-words">{description}</p>;
  }

  return (
    <div className="w-full">
      {!isOpen ? (
        <div>
          <p className="text-sm text-[#475569] font-ubuntu-mono line-clamp-3 break-words">
            {description}
          </p>
          <button 
            onClick={() => setIsOpen(true)} 
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors"
          >
            Read more →
          </button>
        </div>
      ) : (
        <div>
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed max-h-32 overflow-y-auto pr-2 break-words custom-scrollbar">
            {description}
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors"
          >
            Read less ↑
          </button>
        </div>
      )}
    </div>
  );
}

function SearchBar({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
      />
      <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}

function DeleteConfirmPopup({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; }) {
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4"><h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Confirm Delete</h3></div>
        <div className="px-6 py-6">
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">Are you sure you want to delete this announcement? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638]">Cancel</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-oswald">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsAdmin() {
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard'>('landing');
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 5;
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchAnnouncements();
  }, [activeTab]);

  useEffect(() => {
    const filtered = announcements.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnnouncements(filtered);
  }, [searchTerm, announcements]);

  useEffect(() => {
    if (searchTerm) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');
      router.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [searchTerm]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const tableName = activeTab === 'landing' ? 'announce_landing' : 'announce_dash';
    const prefix = activeTab === 'landing' ? 'announce_landing' : 'announce_dash';

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedData = data.map((item: any) => ({
        id: item.id,
        title: item[`${prefix}_title`],
        description: item[`${prefix}_desc`],
        start_date: item[`${prefix}_start`],
        end_date: item[`${prefix}_end`],
        created_at: item.created_at
      }));
      setAnnouncements(mappedData);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const tableName = activeTab === 'landing' ? 'announce_landing' : 'announce_dash';
    const { error } = await supabase.from(tableName).delete().eq('id', selectedId);
    if (!error) {
        setAnnouncements(prev => prev.filter(item => item.id !== selectedId));
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  // Function to handle tab switching and page reset
  const handleTabChange = (tab: 'landing' | 'dashboard') => {
    setActiveTab(tab);
    setSearchTerm('');
    // Reset page to 1 in URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const currentItems = filteredAnnouncements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between sm:items-end items-center sm:flex-row flex-col sm:gap-0 gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638]">Announcements Management</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-1">Control active notices for the landing page and member area</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-gray-100 w-fit rounded-lg border border-gray-200">
            <button 
                onClick={() => handleTabChange('landing')}
                className={`px-4 py-2 rounded-md font-ubuntu-mono text-sm transition-all ${activeTab === 'landing' ? 'bg-[#011638] text-white shadow-md' : 'text-[#475569] hover:bg-gray-200'}`}
            >
                Landing Page
            </button>
            <button 
                onClick={() => handleTabChange('dashboard')}
                className={`px-4 py-2 rounded-md font-ubuntu-mono text-sm transition-all ${activeTab === 'dashboard' ? 'bg-[#011638] text-white shadow-md' : 'text-[#475569] hover:bg-gray-200'}`}
            >
                Member Dashboard
            </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <Link href="/dashboard/add/announcement" className="bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] flex items-center gap-2 font-oswald">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Announcement
        </Link>
      </div>

      <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-[#011638]">
              <tr>
                <th className="w-[30%] px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider ">Title</th>
                <th className="w-[40%] px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Description</th>
                <th className="w-[18%] px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Duration</th>
                <th className="w-[12%] px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center font-ubuntu-mono text-gray-400">Loading records...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center font-ubuntu-mono text-gray-400">No announcements found.</td></tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white transition-colors">
                    <td className="px-4 py-4 font-semibold text-[#011638] text-sm break-words">{item.title}</td>
                    <td className="px-4 py-4 text-sm text-[#475569] font-ubuntu-mono">
                      <AnnouncementDescription description={item.description} />
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-ubuntu-mono text-[#475569]">
                      <span className="block">{formatDate(item.start_date)}</span>
                      <span className="text-gray-300">to</span>
                      <span className="block">{formatDate(item.end_date)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link 
                          href={`/dashboard/edit/announcement?id=${item.id}&type=${activeTab}`}
                          className="text-[#0d21a1] hover:scale-110 transition-transform"
                          title="Edit Announcement"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => { setSelectedId(item.id); setDeletePopupOpen(true); }} 
                          className="text-red-600 hover:scale-110 transition-transform"
                          title="Delete Announcement"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 font-ubuntu-mono">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`w-10 h-10 rounded-lg transition-colors ${
                currentPage === i + 1 
                ? 'bg-[#011638] text-white shadow-md' 
                : 'text-[#475569] hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}