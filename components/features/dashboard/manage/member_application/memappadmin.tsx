"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MemAppItem {
  id: number;
  type: string;
  description: string;
  order_index: number;
}

function Toast({ message, type, onClose }: { message: string | null; type: 'error' | 'success'; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg font-ubuntu-mono font-bold z-[100] flex items-center gap-3 ${type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-xl leading-none">&times;</button>
    </div>
  );
}

function DeleteConfirmPopup({ isOpen, onClose, onConfirm, title }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; }) {
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
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8] uppercase tracking-wide">Confirm Delete</h3>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
            Are you sure you want to delete <span className="font-bold text-[#011638]">&quot;{title}&quot;</span>? This action will hide it from the public view.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] transition-colors">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-oswald tracking-widest uppercase font-bold">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) {
  return (
    <div className="relative flex-1">
      <input type="text" placeholder="Search content..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
      <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}

export default function MemAppAdmin() {
  const [items, setItems] = useState<MemAppItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MemAppItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deadlineItem, setDeadlineItem] = useState<MemAppItem | null>(null);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [savingDeadline, setSavingDeadline] = useState(false);

  const [signupLinkItem, setSignupLinkItem] = useState<MemAppItem | null>(null);
  const [signupLink, setSignupLink] = useState("");
  const [savingLink, setSavingLink] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  // Set default Google Form link if it doesn't exist
  useEffect(() => {
    if (!loading && !signupLinkItem && signupLink === "") {
        setSignupLink("https://docs.google.com/forms/d/e/1FAIpQLSe62P_W6Z3hW7UFqDQjFIqrN1K015lX7ECl75B9psF2yC0IXA/viewform?pli=1");
    }
  }, [loading, signupLinkItem, signupLink]);

  useEffect(() => {
    let filtered = items.filter(item => item.type !== 'deadline' && item.type !== 'signup_link'); 
    if (typeFilter !== 'ALL') filtered = filtered.filter(item => item.type === typeFilter);
    if (searchTerm.trim() !== '') filtered = filtered.filter(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredItems(filtered);
  }, [searchTerm, typeFilter, items]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announce_memapp')
        .select('*')
        .order('type', { ascending: true })
        .order('order_index', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw new Error(error.message);
      
      if (data) {
        setItems(data);
        
        const dl = data.find(d => d.type === 'deadline');
        if (dl) {
          setDeadlineItem(dl);
          try {
            const parsed = new Date(dl.description);
            if (!isNaN(parsed.getTime())) setDeadlineDate(parsed.toISOString().split('T')[0]);
          } catch (e) {}
        }

        const sl = data.find(d => d.type === 'signup_link');
        if (sl) {
          setSignupLinkItem(sl);
          setSignupLink(sl.description);
        }
      }
    } catch (err: any) {
      setToast({ message: "Failed to load database: " + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveDeadline = async () => {
    if (!deadlineDate) return setToast({ message: "Please select a date first.", type: 'error' });
    setSavingDeadline(true);
    
    try {
      const formattedDate = new Date(deadlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();

      if (deadlineItem) {
        const { error } = await supabase.from('announce_memapp').update({ description: formattedDate }).eq('id', deadlineItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announce_memapp').insert([{ type: 'deadline', description: formattedDate, order_index: 0 }]);
        if (error) throw error;
      }
      
      setToast({ message: "Deadline updated successfully!", type: 'success' });
      fetchItems();
    } catch (err: any) {
      setToast({ message: "Failed to save deadline: " + err.message, type: 'error' });
    } finally {
      setSavingDeadline(false);
    }
  };

  const saveSignupLink = async () => {
    if (!signupLink.trim()) return setToast({ message: "Link cannot be empty.", type: 'error' });
    setSavingLink(true);
    
    try {
      if (signupLinkItem) {
        const { error } = await supabase.from('announce_memapp').update({ description: signupLink.trim() }).eq('id', signupLinkItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announce_memapp').insert([{ type: 'signup_link', description: signupLink.trim(), order_index: 0 }]);
        if (error) throw error;
      }
      
      setToast({ message: "Signup Link saved successfully!", type: 'success' });
      fetchItems();
    } catch (err: any) {
      setToast({ message: "Failed to save link: " + err.message, type: 'error' });
    } finally {
      setSavingLink(false);
    }
  };

  const handleSetActiveVideo = async (id: number) => {
    try {
      const { error: resetError } = await supabase.from('announce_memapp').update({ order_index: 0 }).eq('type', 'video');
      if (resetError) throw new Error("Could not reset old videos: " + resetError.message);

      const { error: activeError } = await supabase.from('announce_memapp').update({ order_index: 1 }).eq('id', id);
      if (activeError) throw new Error("Could not set active video: " + activeError.message);

      setToast({ message: "Video is now active!", type: 'success' });
      fetchItems(); 
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const itemToDelete = items.find(i => i.id === selectedId);
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase.from('announce_memapp').delete().eq('id', selectedId);
      if (error) throw error;
      
      if (itemToDelete.type === 'instruction') {
          const remaining = items
             .filter(i => i.type === itemToDelete.type && i.id !== selectedId)
             .sort((a,b) => a.order_index - b.order_index);
             
          for (let i = 0; i < remaining.length; i++) {
              const newIndex = i + 1;
              if (remaining[i].order_index !== newIndex) {
                  await supabase.from('announce_memapp').update({ order_index: newIndex }).eq('id', remaining[i].id);
              }
          }
      }

      setToast({ message: "Content deleted successfully.", type: 'success' });
      setDeletePopupOpen(false);
      setSelectedId(null);
      fetchItems(); 
    } catch (err: any) {
      setToast({ message: "Failed to delete: " + err.message, type: 'error' });
    }
  };

  const renderTableBody = () => {
    if (loading) return <tr><td colSpan={4} className="py-10 text-center font-ubuntu-mono text-[#475569] animate-pulse">Loading content...</td></tr>;
    if (filteredItems.length === 0) return <tr><td colSpan={4} className="py-10 text-center font-ubuntu-mono text-[#475569]">No content found.</td></tr>;

    const videos = items.filter(i => i.type === 'video');
    const hasActiveVideo = videos.some(v => v.order_index === 1);
    if (videos.length > 0 && !hasActiveVideo && !loading) {
       handleSetActiveVideo(videos[videos.length - 1].id);
    }

    return filteredItems.map((item, index) => {
      return (
        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fbfaf8]'}>
          <td className="px-4 py-4 text-center font-bold text-[#011638] text-sm font-ubuntu-mono align-top pt-5">
            {item.type === 'video' ? (
              item.order_index === 1 ? (
                <span className="text-green-700 text-[10px] tracking-widest uppercase bg-green-100 px-2 py-1 rounded-md border border-green-200">Active</span>
              ) : (
                <span className="text-slate-400 text-[10px] tracking-widest uppercase bg-slate-100 px-2 py-1 rounded-md border border-slate-200">History</span>
              )
            ) : item.type === 'reminder' ? (
                <span className="text-slate-400 text-lg">•</span> 
            ) : (
              item.order_index 
            )}
          </td>
          <td className="px-4 py-4 text-left align-top pt-5">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-widest rounded-full font-ubuntu-mono
              ${item.type === 'video' ? 'bg-purple-100 text-purple-800' : 
                item.type === 'reminder' ? 'bg-orange-100 text-orange-800' : 
                'bg-blue-100 text-blue-800'}`}>
              {item.type}
            </span>
          </td>
          
          <td className="px-4 py-4 text-sm text-[#475569] font-ubuntu-mono align-top pt-5">
            {item.type === 'video' ? (
              <a 
                href={item.description} 
                target="_blank" 
                className="text-[#0d21a1] hover:text-[#011638] underline break-all line-clamp-2 max-w-[150px] sm:max-w-xs md:max-w-sm"
              >
                {item.description}
              </a>
            ) : (
              <div className="break-words whitespace-pre-wrap max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg">
                {item.description}
              </div>
            )}
          </td>
          
          <td className="px-4 py-4 align-top pt-4">
            <div className="grid grid-cols-[85px_65px] gap-3 mx-auto w-[162px]">
              <div className="w-[85px] h-[30px] flex items-center justify-end">
                {item.type === 'video' && item.order_index !== 1 ? (
                  <button 
                    onClick={() => handleSetActiveVideo(item.id)}
                    className="bg-[#011638] text-white hover:bg-[#eec643] hover:text-[#011638] transition-colors px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-widest shadow-sm whitespace-nowrap"
                    title="Make this the currently displayed video"
                  >
                    Set Active
                  </button>
                ) : null}
              </div>

              <div className="w-[65px] h-[30px] flex items-center justify-start gap-3">
                <Link href={`/dashboard/edit/mem-app?id=${item.id}`} className="text-[#0d21a1] hover:text-[#011638] transition-colors" title="Edit Item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                </Link>
                <button onClick={() => { setSelectedId(item.id); setDeletePopupOpen(true); }} className="text-red-600 hover:text-red-800 transition-colors" title="Delete Item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                </button>
              </div>

            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full overflow-hidden">
      <Toast message={toast?.message || null} type={toast?.type || 'success'} onClose={() => setToast(null)} />
      
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638] uppercase tracking-wide">Membership App Content</h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">Control instructions, reminders, deadlines, and videos</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col gap-4">
        
        {/* Deadline Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
                <span className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest min-w-[120px]">Set Deadline:</span>
                <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#011638] focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
                <button onClick={saveDeadline} disabled={savingDeadline} className="w-full sm:w-auto px-6 py-2 bg-[#011638] text-white rounded-lg hover:bg-[#0d21a1] transition-colors flex items-center justify-center font-oswald uppercase tracking-widest whitespace-nowrap shadow-sm disabled:opacity-50">
                    {savingDeadline ? "Saving..." : "Save Deadline"}
                </button>
            </div>
            {deadlineItem && (
                <span className="text-xs text-[#475569] font-ubuntu-mono whitespace-nowrap mt-2 sm:mt-0">Current: <strong className="text-red-600">{deadlineItem.description}</strong></span>
            )}
        </div>

        <hr className="border-gray-100" />

        {/* Signup Link Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto flex-1">
                <span className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest min-w-[120px]">Google Form:</span>
                <input 
                    type="url" 
                    value={signupLink} 
                    onChange={(e) => setSignupLink(e.target.value)} 
                    placeholder="https://docs.google.com/forms/..."
                    className="w-full max-w-lg px-4 py-2 rounded-lg border border-[#011638] focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" 
                />
                <button onClick={saveSignupLink} disabled={savingLink} className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-oswald uppercase tracking-widest whitespace-nowrap shadow-sm disabled:opacity-50">
                    {savingLink ? "Saving..." : "Save Link"}
                </button>
            </div>
        </div>

      </div>

      {/* FILTER & ADD BUTTON */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto flex-1">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono min-w-[160px]">
            <option value="ALL">All Types</option>
            <option value="instruction">Instructions</option>
            <option value="reminder">Reminders</option>
            <option value="video">Videos</option>
            </select>
        </div>
        <Link href="/dashboard/add/mem-app" className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald uppercase tracking-widest whitespace-nowrap shadow-sm shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Content
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200 w-full">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full table-fixed">
            <thead className="bg-[#011638]">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[10%]">Seq</th>
                <th className="px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[15%]">Type</th>
                <th className="px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[50%]">Content</th>
                <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[25%] min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmPopup isOpen={deletePopupOpen} onClose={() => setDeletePopupOpen(false)} onConfirm={handleDelete} title={items.find(i => i.id === selectedId)?.type || "this content"} />
    </div>
  );
}