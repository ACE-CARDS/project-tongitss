"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Pagination from "@/components/pagination";

interface Category {
  id: number;
  r_category_name: string;
  created_at: string;
}

// Format date as "Month Day, Year"
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Delete confirmation popup
function DeleteConfirmPopup({ isOpen, onClose, onConfirm, name, usageCount, isDeleting, deleteError }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  name: string; 
  usageCount: { surveys: number; theses: number; };
  isDeleting: boolean;
  deleteError: string | null;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasUsage = usageCount.surveys > 0 || usageCount.theses > 0;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Confirm Delete</h3>
        </div>
        <div className="px-6 py-6">
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-ubuntu-mono">{deleteError}</p>
            </div>
          )}
          
          {hasUsage ? (
            <>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-4">
                Cannot delete category because it is currently in use:
              </p>
              <ul className="list-disc list-inside mb-4 text-sm text-[#475569] font-ubuntu-mono">
                {usageCount.surveys > 0 && (
                  <li>{usageCount.surveys} {usageCount.surveys === 1 ? 'survey' : 'surveys'} using this category</li>
                )}
                {usageCount.theses > 0 && (
                  <li>{usageCount.theses} {usageCount.theses === 1 ? 'thesis' : 'theses'} using this category</li>
                )}
              </ul>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
                Please reassign or delete these records before deleting this category.
              </p>
              <div className="flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-[#011638] text-white rounded-lg hover:bg-[#012a5a] font-oswald">OK</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
                Are you sure you want to delete category "{name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] disabled:opacity-50">Cancel</button>
                <button 
                  onClick={onConfirm} 
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit popup 
function EditPopup({ isOpen, onClose, onSave, category, categories, isSaving, saveError }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (id: number, newName: string) => void; 
  category: Category | null; 
  categories: Category[];
  isSaving: boolean;
  saveError: string | null;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (category) {
      setName(category.r_category_name);
      setError('');
    }
  }, [category]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Real-time duplicate check
  const checkDuplicate = async (value: string) => {
    if (!value.trim() || value.trim() === category?.r_category_name) {
      setError('');
      return true;
    }

    setIsChecking(true);
    
    // Check for duplicates
    const exists = categories.some(cat => 
      cat.r_category_name.toLowerCase() === value.trim().toLowerCase() && cat.id !== category?.id
    );
    
    if (exists) {
      setError('Category with this name already exists');
      setIsChecking(false);
      return false;
    }
    
    setError('');
    setIsChecking(false);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    checkTimeoutRef.current = setTimeout(() => {
      checkDuplicate(value);
    }, 300);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }
    
    const isValid = await checkDuplicate(name);
    if (!isValid) return;
    
    if (category) {
      onSave(category.id, name.trim());
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Edit Category</h3>
        </div>
        <div className="px-6 py-6">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-ubuntu-mono">{saveError}</p>
            </div>
          )}
          
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            Category Name
          </label>
          <div className="relative">
            <input
            type="text"
            value={name}
            onChange={handleNameChange}
            maxLength={50}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono ${
              error ? 'border-red-500' : 'border-[#94a3b8]'
            }`}
            placeholder="Enter category name"
          />
            {isChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {error && <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">{error}</p>}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] disabled:opacity-50">Cancel</button>
            <button 
              onClick={handleSave} 
              className={`px-4 py-2 rounded-lg font-oswald ${
                isSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1e4db7] text-white hover:bg-[#0d21a1]'
              }`}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add popup
function AddPopup({ isOpen, onClose, onAdd, categories, isAdding, addError }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (name: string) => void; 
  categories: Category[];
  isAdding: boolean;
  addError: string | null;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Reset form 
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setIsChecking(false);
    }
  }, [isOpen]);

  // Duplicate check
  const checkDuplicate = async (value: string) => {
    if (!value.trim()) {
      setError('');
      return false;
    }

    if (value.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return false;
    }

    setIsChecking(true);
    
    const exists = categories.some(cat => 
      cat.r_category_name.toLowerCase() === value.trim().toLowerCase()
    );
    
    if (exists) {
      setError('Category with this name already exists');
      setIsChecking(false);
      return false;
    }
    
    setError('');
    setIsChecking(false);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    checkTimeoutRef.current = setTimeout(() => {
      checkDuplicate(value);
    }, 300);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }
    
    const isValid = await checkDuplicate(name);
    if (!isValid) return;
    
    onAdd(name.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Add New Category</h3>
        </div>
        <div className="px-6 py-6">
          {addError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-ubuntu-mono">{addError}</p>
            </div>
          )}
          
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            Category Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              maxLength={50}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono ${
                error ? 'border-red-500 pr-10' : 'border-[#94a3b8]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter category name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !error && name.trim() && !isAdding) handleAdd();
              }}
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {error && <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">{error}</p>}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] disabled:opacity-50">Cancel</button>
            <button 
              onClick={handleAdd} 
              className={`px-4 py-2 rounded-lg font-oswald ${
                isAdding ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1e4db7] text-white hover:bg-[#0d21a1]'
              }`}
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usageCount, setUsageCount] = useState({ surveys: 0, theses: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  
  const supabase = createClient();
  const itemsPerPage = 15;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = [...categories];
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(cat => 
        cat.r_category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('r_category')
      .select('*')
      .order('r_category_name');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const checkCategoryUsage = async (categoryId: number) => {
    // Check surveys table
    const { count: surveyCount, error: surveyError } = await supabase
      .from('survey')
      .select('id', { count: 'exact', head: true })
      .eq('r_category', categoryId);

    if (surveyError) {
      console.error('Error checking surveys:', surveyError);
    }

    // Check theses table
    const { count: thesisCount, error: thesisError } = await supabase
      .from('thesis')
      .select('id', { count: 'exact', head: true })
      .eq('r_category', categoryId);

    if (thesisError) {
      console.error('Error checking theses:', thesisError);
    }

    return {
      surveys: surveyCount || 0,
      theses: thesisCount || 0
    };
  };

  const handleAdd = async (name: string) => {
    setIsAdding(true);
    setAddError(null);
    
    const { data, error } = await supabase
      .from('r_category')
      .insert({ r_category_name: name })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        setAddError('Category with this name already exists');
      } else {
        setAddError('Error adding category: ' + error.message);
      }
      setIsAdding(false);
    } else {
      setCategories([...categories, data].sort((a, b) => 
        a.r_category_name.localeCompare(b.r_category_name)
      ));
      setIsAdding(false);
      setAddPopupOpen(false);
    }
  };

  const handleEdit = async (id: number, newName: string) => {
    setIsSaving(true);
    setSaveError(null);
    
    const { error } = await supabase
      .from('r_category')
      .update({ r_category_name: newName })
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        setSaveError('Category with this name already exists');
      } else {
        setSaveError('Error updating category: ' + error.message);
      }
      setIsSaving(false);
    } else {
      const updatedCategories = categories.map(cat => 
        cat.id === id ? { ...cat, r_category_name: newName } : cat
      );
      updatedCategories.sort((a, b) => a.r_category_name.localeCompare(b.r_category_name));
      setCategories(updatedCategories);
      setIsSaving(false);
      setEditPopupOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    setDeleteError(null);
    
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey')
      .select('id')
      .eq('r_category', id)
      .limit(1);

    if (surveyError) {
      setDeleteError('Error checking category usage: ' + surveyError.message);
      setIsDeleting(false);
      return;
    }

    const { data: thesisData, error: thesisError } = await supabase
      .from('thesis')
      .select('id')
      .eq('r_category', id)
      .limit(1);

    if (thesisError) {
      setDeleteError('Error checking category usage: ' + thesisError.message);
      setIsDeleting(false);
      return;
    }

    if (surveyData && surveyData.length > 0) {
      setDeleteError('Cannot delete this category because it is being used by one or more surveys. Please reassign or delete those surveys first.');
      setIsDeleting(false);
      return;
    }

    if (thesisData && thesisData.length > 0) {
      setDeleteError('Cannot delete this category because it is being used by one or more theses. Please reassign or delete those theses first.');
      setIsDeleting(false);
      return;
    }

    // If not in use, delete
    const { error } = await supabase
      .from('r_category')
      .delete()
      .eq('id', id);

    if (error) {
      setDeleteError('Error deleting category: ' + error.message);
      setIsDeleting(false);
    } else {
      setCategories(categories.filter(cat => cat.id !== id));
      setIsDeleting(false);
      setDeletePopupOpen(false);
    }
  };

  const handleDeleteClick = async (category: Category) => {
    const usage = await checkCategoryUsage(category.id);
    setUsageCount(usage);
    setSelectedCategory(category);
    setDeleteError(null);
    setDeletePopupOpen(true);
  };

  // Pagination
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  if (loading) {
    return <div className="text-center py-12"><p className="text-gray-500 font-ubuntu-mono">Loading categories...</p></div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Category Management</h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">Manage research categories for surveys and theses</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
          />
          <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={() => {
            setAddError(null);
            setAddPopupOpen(true);
          }}
          className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] flex items-center justify-center gap-2 font-oswald"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-[#fbfaf8] rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Categories Found</h3>
          <p className="text-gray-500 font-ubuntu-mono">Try searching for something else or add a new category.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#011638]">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentCategories.map((category, index) => (
                    <tr key={category.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fbfaf8]'}>
                      <td className="px-6 py-4 text-center text-sm font-oswald font-medium text-[#011638]">{category.r_category_name}</td>
                      <td className="px-6 py-4 text-center text-sm text-[#475569] font-ubuntu-mono">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedCategory(category);
                              setSaveError(null);
                              setEditPopupOpen(true);
                            }} 
                            className="text-[#0d21a1] hover:scale-110 transition-transform"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(category)} 
                            className="text-red-600 hover:scale-110 transition-transform"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
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
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </>
      )}

      <AddPopup
        isOpen={addPopupOpen}
        onClose={() => {
          if (!isAdding) {
            setAddPopupOpen(false);
            setAddError(null);
          }
        }}
        onAdd={handleAdd}
        categories={categories}
        isAdding={isAdding}
        addError={addError}
      />

      <EditPopup
        isOpen={editPopupOpen}
        onClose={() => {
          if (!isSaving) {
            setEditPopupOpen(false);
            setSaveError(null);
          }
        }}
        onSave={handleEdit}
        category={selectedCategory}
        categories={categories}
        isSaving={isSaving}
        saveError={saveError}
      />

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeletePopupOpen(false);
            setDeleteError(null);
          }
        }}
        onConfirm={() => selectedCategory && handleDelete(selectedCategory.id)}
        name={selectedCategory?.r_category_name || ''}
        usageCount={usageCount}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />
    </div>
  );
}