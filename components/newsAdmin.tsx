"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Pagination from "@/components/pagination"; // Ensure this path is correct

interface NewsItem {
  id: number;
  title: string | null;
  content: string | null;
  image_url: string | null;
  post_url: string;
  fb_post_date: string;
  created_at: string;
}

type SortField = 'title' | 'fb_post_date' | null;
type SortOrder = 'asc' | 'desc' | null;

// Read more component for news description
function NewsDescription({ description }: { description: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!description) return null;

  if (description.length <= 100) {
    return <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed break-words">{description}</p>;
  }

  return (
    <div className='w-[100%]'>
      {!isOpen ? (
        <div>
          <p className="text-sm text-[#475569] font-ubuntu-mono line-clamp-2 break-words">{description}</p>
          <button onClick={() => setIsOpen(true)} className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors">
            Read more →
          </button>
        </div>
      ) : (
        <div>
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed h-24 overflow-y-auto pr-2 break-words custom-scrollbar-blue">
            {description}
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors">
            Read less ↑
          </button>
        </div>
      )}
    </div>
  );
}

// Delete confirmation popup
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
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4"><h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Confirm Delete</h3></div>
        <div className="px-6 py-6">
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">Are you sure you want to delete this news article? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638]">Cancel</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-oswald">Delete</button>
          </div>
        </div>
      </div>
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

export default function NewsAdmin() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 5; 
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => { fetchNews(); }, []);

  useEffect(() => {
    let filtered = [...news];
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => item.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortField && sortOrder) {
      filtered.sort((a, b) => {
        let aValue = sortField === 'title' ? (a.title || '').toLowerCase() : new Date(a.fb_post_date).getTime();
        let bValue = sortField === 'title' ? (b.title || '').toLowerCase() : new Date(b.fb_post_date).getTime();
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredNews(filtered);
  }, [searchTerm, news, sortField, sortOrder]);

  // Reset to page 1 on search without polluting history stack
  useEffect(() => {
    if (searchTerm) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');
      router.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [searchTerm]);

  const totalItems = filteredNews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNewsItems = filteredNews.slice(startIndex, startIndex + itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from('news_media').select('*').order('created_at', { ascending: false });
    setNews(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    await supabase.from('news_media').delete().eq('id', id);
    setNews(news.filter(item => item.id !== id));
  };

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder('asc');
    } else {
      if (sortOrder === 'asc') setSortOrder('desc');
      else { setSortField(null); setSortOrder(null); }
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="text-center py-12"><p className="text-gray-500 font-ubuntu-mono">Loading news...</p></div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">News Management</h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">Manage your community updates and announcements</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <Link href="/dashboard/add/news-media?from=admin" className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] flex items-center justify-center gap-2 font-oswald">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add News
        </Link>
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-[#fbfaf8] rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No News Articles</h3>
          <p className="text-gray-500 font-ubuntu-mono">Try searching for something else or create a new article.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-[#011638]">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[120px]">Image</th>
                    
                    <th 
                      className={`px-4 py-3 text-left text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider cursor-pointer hover:bg-[#0d21a1] transition-colors ${sortField === 'title' ? 'bg-[#0d21a1]' : ''}`} 
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Title & Description
                        <div className="flex flex-col gap-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mb-1 ${sortField === 'title' && sortOrder === 'asc' ? 'text-[#eec643]' : 'text-[#eff0f2]/30'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mt-1 ${sortField === 'title' && sortOrder === 'desc' ? 'text-[#eec643]' : 'text-[#eff0f2]/30'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </th>

                    <th 
                      className={`px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider cursor-pointer hover:bg-[#0d21a1] transition-colors w-[180px] ${sortField === 'fb_post_date' ? 'bg-[#0d21a1]' : ''}`} 
                      onClick={() => handleSort('fb_post_date')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Post Date
                        <div className="flex flex-col gap-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mb-1 ${sortField === 'fb_post_date' && sortOrder === 'asc' ? 'text-[#eec643]' : 'text-[#eff0f2]/30'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mt-1 ${sortField === 'fb_post_date' && sortOrder === 'desc' ? 'text-[#eec643]' : 'text-[#eff0f2]/30'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentNewsItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fbfaf8]'}>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <a href={item.post_url} target="_blank" rel="noopener noreferrer">
                            <img src={item.image_url || "/assets/logos/ACE CARDS logo.png"} alt="News" className="w-20 h-20 object-cover rounded-md border border-gray-100" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top break-words max-w-full whitespace-normal">
                        <a href={item.post_url} target="_blank" className="text-sm font-oswald font-semibold text-[#011638] hover:underline block mb-1 break-words">{item.title || "Untitled Post"}</a>
                        <NewsDescription description={item.content} />
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-[#475569] font-ubuntu-mono">{formatDate(item.fb_post_date)}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => router.push(`/dashboard/edit/news-media?id=${item.id}&from=admin`)} className="text-[#0d21a1] hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                          <button onClick={() => { setSelectedNews(item); setDeletePopupOpen(true); }} className="text-red-600 hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-2 gap-2">
                <p className="text-[#475569] font-ubuntu-mono text-xs mb-2">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
                </p>
                <p className="text-[#475569] font-ubuntu-mono text-sm">
                  Page {validCurrentPage} of {totalPages || 1}
                </p>
              </div>
              
              <Pagination 
                currentPage={validCurrentPage} 
                totalPages={totalPages || 1} 
              />
            </>
          )}
        </>
      )}

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        onConfirm={() => selectedNews && handleDelete(selectedNews.id)}
        title={selectedNews?.title || 'this news article'}
      />
    </div>
  );
}