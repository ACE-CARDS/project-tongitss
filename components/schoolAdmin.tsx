"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Pagination from "@/components/pagination";

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
  usageCount: { members: number; surveys: number; theses: number; organizations: number; executives: number; };
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

  const hasUsage = usageCount.members > 0 || usageCount.surveys > 0 || usageCount.theses > 0 || usageCount.organizations > 0 || usageCount.executives > 0;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
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
                Cannot delete school because it is currently in use:
              </p>
              <ul className="list-disc list-inside mb-4 text-sm text-[#475569] font-ubuntu-mono">
                {usageCount.members > 0 && (
                  <li>{usageCount.members} {usageCount.members === 1 ? 'member' : 'members'} from this school</li>
                )}
                {usageCount.surveys > 0 && (
                  <li>{usageCount.surveys} {usageCount.surveys === 1 ? 'survey' : 'surveys'} from this school</li>
                )}
                {usageCount.theses > 0 && (
                  <li>{usageCount.theses} {usageCount.theses === 1 ? 'thesis' : 'theses'} from this school</li>
                )}
                {usageCount.organizations > 0 && (
                  <li>{usageCount.organizations} {usageCount.organizations === 1 ? 'organization' : 'organizations'} under this school</li>
                )}
                {usageCount.executives > 0 && (
                  <li>{usageCount.executives} {usageCount.executives === 1 ? 'executive' : 'executives'} from this school</li>
                )}
              </ul>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
                Please reassign or delete these records before deleting this school.
              </p>
              <div className="flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-[#011638] text-white rounded-lg hover:bg-[#012a5a] font-oswald">OK</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
                Are you sure you want to delete school "{name}"? This action cannot be undone.
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
function EditPopup({ isOpen, onClose, onSave, school, schools, provinces, isSaving, saveError }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (id: number, newName: string, provinceId: number) => void; 
  school: School | null; 
  schools: School[];
  provinces: Province[];
  isSaving: boolean;
  saveError: string | null;
}) {
  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState<number>(1);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
  if (isOpen && school) {
    setName(school.school_name);
    setProvinceId(school.province);
    setError('');
    setIsChecking(false);
  }
}, [isOpen, school]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const checkDuplicate = async (value: string) => {
    if (!value.trim() || value.trim() === school?.school_name) {
      setError('');
      return true;
    }

    if (value.trim().length < 2) {
      setError('School name must be at least 2 characters');
      return false;
    }

    setIsChecking(true);
    
    const exists = schools.some(s => 
      s.school_name.toLowerCase() === value.trim().toLowerCase() && s.id !== school?.id
    );
    
    if (exists) {
      setError('School with this name already exists');
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
      setError('School name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('School name must be at least 2 characters');
      return;
    }
    
    const isValid = await checkDuplicate(name);
    if (!isValid) return;
    
    if (school) {
      onSave(school.id, name.trim(), provinceId);
    }
  };

  if (!isOpen || !school) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Edit School</h3>
        </div>
        <div className="px-6 py-6">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-ubuntu-mono">{saveError}</p>
            </div>
          )}
          
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            School Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              maxLength={255}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono ${
                error ? 'border-red-500' : 'border-[#94a3b8]'
              }`}
              placeholder="Enter school name"
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
          {error && <p className="text-xs text-red-600 font-ubuntu-mono mt-1">{error}</p>}
          
          <label className="block text-sm font-oswald font-medium text-[#011638] mt-4 mb-2">
            Province
          </label>
          <select
            key={school.id}
            value={provinceId}
            onChange={(e) => setProvinceId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#94a3b8] rounded-lg focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono mb-6"
          >
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.prov_name}
              </option>
            ))}
          </select>
          
          <div className="flex justify-end gap-3">
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
function AddPopup({ isOpen, onClose, onAdd, schools, provinces, isAdding, addError }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (name: string, provinceId: number) => void; 
  schools: School[];
  provinces: Province[];
  isAdding: boolean;
  addError: string | null;
}) {
  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState<number>(1);
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

  useEffect(() => {
    if (isOpen) {
      setName('');
      setProvinceId(1);
      setError('');
      setIsChecking(false);
    }
  }, [isOpen]);

  const checkDuplicate = async (value: string) => {
    if (!value.trim()) {
      setError('');
      return false;
    }

    if (value.trim().length < 2) {
      setError('School name must be at least 2 characters');
      return false;
    }

    setIsChecking(true);
    
    const exists = schools.some(s => 
      s.school_name.toLowerCase() === value.trim().toLowerCase()
    );
    
    if (exists) {
      setError('School with this name already exists');
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
    
    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    checkTimeoutRef.current = setTimeout(() => {
      checkDuplicate(value);
    }, 300);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setError('School name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('School name must be at least 2 characters');
      return;
    }

    const isValid = await checkDuplicate(name);
    if (!isValid) return;
    
    onAdd(name.trim(), provinceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Add New School</h3>
        </div>
        <div className="px-6 py-6">
          {addError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-ubuntu-mono">{addError}</p>
            </div>
          )}
          
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            School Name
          </label>
          <div className="relative mb-4">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              maxLength={255}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono ${
                error ? 'border-red-500 pr-10' : 'border-[#94a3b8]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter school name"
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
          {error && <p className="text-xs text-red-600 font-ubuntu-mono -mt-3 mb-2">{error}</p>}
          
          <label className="block text-sm font-oswald font-medium text-[#011638] mt-4 mb-2">
            Province
          </label>
          <select
            value={provinceId}
            onChange={(e) => setProvinceId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#94a3b8] rounded-lg focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono mb-6"
          >
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.prov_name}
              </option>
            ))}
          </select>
          
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] disabled:opacity-50">Cancel</button>
            <button 
              onClick={handleAdd} 
              className={`px-4 py-2 rounded-lg font-oswald ${
                isAdding ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1e4db7] text-white hover:bg-[#0d21a1]'
              }`}
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add School'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchoolAdmin() {
  const [schools, setSchools] = useState<School[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usageCount, setUsageCount] = useState({ members: 0, surveys: 0, theses: 0, organizations: 0, executives: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  
  const supabase = createClient();
  const itemsPerPage = 15;

  useEffect(() => {
    fetchProvinces();
    fetchSchools();
  }, []);

  useEffect(() => {
    let filtered = [...schools];
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(school => 
        school.school_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSchools(filtered);
    setCurrentPage(1);
  }, [searchTerm, schools]);

  const fetchProvinces = async () => {
    const { data, error } = await supabase
      .from('province')
      .select('*')
      .order('prov_name');
    
    if (error) {
      console.error('Error fetching provinces:', error);
    } else {
      setProvinces(data || []);
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('school')
      .select(`
        *,
        province:province(prov_name)
      `)
      .order('school_name');
    
    if (error) {
      console.error('Error fetching schools:', error);
    } else {
      const schoolsWithProvince = (data || []).map((school: any) => ({
        ...school,
        province_name: school.province?.prov_name
      }));
      setSchools(schoolsWithProvince);
    }
    setLoading(false);
  };

  // Check if school is being used
  const checkSchoolUsage = async (schoolId: number) => {
    // Check member table
    const { count: memberCount, error: memberError } = await supabase
      .from('member')
      .select('id', { count: 'exact', head: true })
      .eq('school', schoolId);

    if (memberError) {
      console.error('Error checking members:', memberError);
    }

    // Check survey table
    const { count: surveyCount, error: surveyError } = await supabase
      .from('survey')
      .select('id', { count: 'exact', head: true })
      .eq('school', schoolId);

    if (surveyError) {
      console.error('Error checking surveys:', surveyError);
    }

    // Check thesis table
    const { count: thesisCount, error: thesisError } = await supabase
      .from('thesis')
      .select('id', { count: 'exact', head: true })
      .eq('school', schoolId);

    if (thesisError) {
      console.error('Error checking theses:', thesisError);
    }

    // Check organization table
    const { count: orgCount, error: orgError } = await supabase
      .from('organization')
      .select('id', { count: 'exact', head: true })
      .eq('school', schoolId);

    if (orgError) {
      console.error('Error checking organizations:', orgError);
    }

    // Check executives table
    const { count: execCount, error: execError } = await supabase
      .from('executives')
      .select('id', { count: 'exact', head: true })
      .eq('school', schoolId);

    if (execError) {
      console.error('Error checking executives:', execError);
    }

    return {
      members: memberCount || 0,
      surveys: surveyCount || 0,
      theses: thesisCount || 0,
      organizations: orgCount || 0,
      executives: execCount || 0
    };
  };

  const handleAdd = async (name: string, provinceId: number) => {
    setIsAdding(true);
    setAddError(null);
    
    const { data, error } = await supabase
      .from('school')
      .insert({ school_name: name, province: provinceId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        setAddError('School with this name already exists');
      } else {
        setAddError('Error adding school: ' + error.message);
      }
      setIsAdding(false);
    } else {
      // Fetch province name 
      const province = provinces.find(p => p.id === provinceId);
      const newSchool = { ...data, province_name: province?.prov_name };
      setSchools([...schools, newSchool].sort((a, b) => 
        a.school_name.localeCompare(b.school_name)
      ));
      setIsAdding(false);
      setAddPopupOpen(false);
    }
  };

  const handleEdit = async (id: number, newName: string, provinceId: number) => {
    setIsSaving(true);
    setSaveError(null);
    
    const { error } = await supabase
      .from('school')
      .update({ school_name: newName, province: provinceId })
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        setSaveError('School with this name already exists');
      } else {
        setSaveError('Error updating school: ' + error.message);
      }
      setIsSaving(false);
    } else {
      const province = provinces.find(p => p.id === provinceId);
      const updatedSchools = schools.map(school => 
        school.id === id ? { ...school, school_name: newName, province: provinceId, province_name: province?.prov_name } : school
      );
      updatedSchools.sort((a, b) => a.school_name.localeCompare(b.school_name));
      setSchools(updatedSchools);
      setIsSaving(false);
      setEditPopupOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    setDeleteError(null);
    
    const usage = await checkSchoolUsage(id);
    
    if (usage.members > 0 || usage.surveys > 0 || usage.theses > 0 || usage.organizations > 0 || usage.executives > 0) {
      setDeleteError('Cannot delete this school because it is being used by related records. Please reassign or delete those records first.');
      setIsDeleting(false);
      return;
    }
    
    // If not in use, delete
    const { error } = await supabase
      .from('school')
      .delete()
      .eq('id', id);

    if (error) {
      setDeleteError('Error deleting school: ' + error.message);
      setIsDeleting(false);
    } else {
      setSchools(schools.filter(school => school.id !== id));
      setIsDeleting(false);
      setDeletePopupOpen(false);
    }
  };

  const handleDeleteClick = async (school: School) => {
    const usage = await checkSchoolUsage(school.id);
    setUsageCount(usage);
    setSelectedSchool(school);
    setDeleteError(null);
    setDeletePopupOpen(true);
  };

  // Pagination 
  const totalItems = filteredSchools.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSchools = filteredSchools.slice(startIndex, startIndex + itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  if (loading) {
    return <div className="text-center py-12"><p className="text-gray-500 font-ubuntu-mono">Loading schools...</p></div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">School Management</h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">Manage schools and their associated provinces</p>
      </div>

      {/* Search and Add Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search schools..."
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
          Add School
        </button>
      </div>

      {/* Schools Table */}
      {filteredSchools.length === 0 ? (
        <div className="text-center py-12 bg-[#fbfaf8] rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Schools Found</h3>
          <p className="text-gray-500 font-ubuntu-mono">Try searching for something else or add a new school.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#011638]">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">School Name</th>
                    <th className="px-6 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Province</th>
                    <th className="px-6 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentSchools.map((school, index) => (
                    <tr key={school.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fbfaf8]'}>
                      <td className="px-6 py-4 text-left text-sm font-oswald font-medium text-[#011638]">{school.school_name}</td>
                      <td className="px-6 py-4 text-left text-sm text-[#475569] font-ubuntu-mono">
                        {school.province_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-[#475569] font-ubuntu-mono">
                        {formatDate(school.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {/* Edit Button */}
                          <button 
                            onClick={() => {
                              setSelectedSchool(school);
                              setSaveError(null);
                              setEditPopupOpen(true);
                            }} 
                            className="text-[#0d21a1] hover:scale-110 transition-transform"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteClick(school)} 
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

          {/* Pagination */}
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

      {/* Add School Popup */}
      <AddPopup
        isOpen={addPopupOpen}
        onClose={() => {
          if (!isAdding) {
            setAddPopupOpen(false);
            setAddError(null);
          }
        }}
        onAdd={handleAdd}
        schools={schools}
        provinces={provinces}
        isAdding={isAdding}
        addError={addError}
      />

      {/* Edit School Popup */}
      <EditPopup
        key={selectedSchool?.id || 'edit-popup'}
        isOpen={editPopupOpen}
        onClose={() => {
          if (!isSaving) {
            setEditPopupOpen(false);
            setSaveError(null);
          }
        }}
        onSave={handleEdit}
        school={selectedSchool}
        schools={schools}
        provinces={provinces}
        isSaving={isSaving}
        saveError={saveError}
      />

      {/* Delete Confirmation Popup */}
      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeletePopupOpen(false);
            setDeleteError(null);
          }
        }}
        onConfirm={() => selectedSchool && handleDelete(selectedSchool.id)}
        name={selectedSchool?.school_name || ''}
        usageCount={usageCount}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />
    </div>
  );
}