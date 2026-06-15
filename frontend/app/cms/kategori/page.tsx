'use client';

import { useState, useEffect } from 'react';
import {
  getCmsCategories,
  createCmsCategory,
  updateCmsCategory,
  deleteCmsCategory,
  CategoryItem,
  getCmsTags,
  createCmsTag,
  updateCmsTag,
  deleteCmsTag,
  TagItem,
} from '@/lib/api/taxonomy';
import { Plus, Edit3, Trash2, Hash, LayoutGrid, X } from 'lucide-react';

type Tab = 'category' | 'tag';

export default function KategoriPage() {
  const [activeTab, setActiveTab] = useState<Tab>('category');

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Tags
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState('');
  
  const [showTagModal, setShowTagModal] = useState(false);
  const [editTag, setEditTag] = useState<TagItem | null>(null);
  const [tagName, setTagName] = useState('');

  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCmsCategories();
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const res = await getCmsTags();
      setTags(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  // ─── Category Actions ───────────────────────────────────────────────────

  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    setLoadingAction(true);
    try {
      if (editCat) {
        await updateCmsCategory(editCat.id, { name: catName });
      } else {
        await createCmsCategory({ name: catName });
      }
      setShowCatModal(false);
      setCatName('');
      setEditCat(null);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await deleteCmsCategory(id);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  const openEditCat = (cat: CategoryItem) => {
    setEditCat(cat);
    setCatName(cat.name);
    setShowCatModal(true);
  };

  const openAddCat = () => {
    setEditCat(null);
    setCatName('');
    setShowCatModal(true);
  };

  // ─── Tag Actions ────────────────────────────────────────────────────────

  const handleSaveTag = async () => {
    if (!tagName.trim()) return;
    setLoadingAction(true);
    try {
      if (editTag) {
        await updateCmsTag(editTag.id, { name: tagName });
      } else {
        await createCmsTag({ name: tagName });
      }
      setShowTagModal(false);
      setTagName('');
      setEditTag(null);
      fetchTags();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Gagal menyimpan tag');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tag ini?')) return;
    try {
      await deleteCmsTag(id);
      fetchTags();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Gagal menghapus tag');
    }
  };

  const openEditTag = (tag: TagItem) => {
    setEditTag(tag);
    setTagName(tag.name);
    setShowTagModal(true);
  };

  const openAddTag = () => {
    setEditTag(null);
    setTagName('');
    setShowTagModal(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
          Kategori dan Tag
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Kelola kategori berita dan tagar (hashtag) untuk mempermudah navigasi portal.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden max-w-5xl">
          
          {/* Tabs */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('category')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === 'category' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid size={16} />
              Kategori
            </button>
            <button
              onClick={() => setActiveTab('tag')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === 'tag' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Hash size={16} />
              Tag
            </button>
          </div>

          {/* Action Bar */}
          <div className="p-4 flex justify-end bg-gray-50/50 border-b border-gray-100">
            <button
              onClick={activeTab === 'category' ? openAddCat : openAddTag}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} />
              Tambah {activeTab === 'category' ? 'Kategori' : 'Tag'}
            </button>
          </div>

          {/* Content */}
          <div className="p-0">
            {activeTab === 'category' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-extrabold">
                      <th className="px-5 py-4 w-10">No</th>
                      <th className="px-5 py-4">Nama Kategori</th>
                      <th className="px-5 py-4">Slug</th>
                      <th className="px-5 py-4 text-center">Sub-Kategori</th>
                      <th className="px-5 py-4 text-right w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] font-semibold text-gray-700 divide-y divide-gray-100">
                    {loadingCategories ? (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Memuat kategori...</td></tr>
                    ) : categories.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Belum ada kategori.</td></tr>
                    ) : (
                      categories.map((cat, idx) => (
                        <tr key={cat.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-4 text-gray-400">{idx + 1}</td>
                          <td className="px-5 py-4 text-gray-900 font-bold">{cat.name}</td>
                          <td className="px-5 py-4 text-gray-500">{cat.slug}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs font-bold">
                              {cat.children_count || 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => openEditCat(cat)} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <Edit3 size={18} strokeWidth={2.5} />
                              </button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600" title="Hapus">
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tag' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-extrabold">
                      <th className="px-5 py-4 w-10">No</th>
                      <th className="px-5 py-4">Nama Tag</th>
                      <th className="px-5 py-4">Slug</th>
                      <th className="px-5 py-4 text-right w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] font-semibold text-gray-700 divide-y divide-gray-100">
                    {loadingTags ? (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Memuat tag...</td></tr>
                    ) : tags.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Belum ada tag.</td></tr>
                    ) : (
                      tags.map((tag, idx) => (
                        <tr key={tag.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-4 text-gray-400">{idx + 1}</td>
                          <td className="px-5 py-4 text-gray-900 font-bold flex items-center gap-1.5">
                            <Hash size={14} className="text-blue-500" />
                            {tag.name}
                          </td>
                          <td className="px-5 py-4 text-gray-500">{tag.slug}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => openEditTag(tag)} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <Edit3 size={18} strokeWidth={2.5} />
                              </button>
                              <button onClick={() => handleDeleteTag(tag.id)} className="text-red-400 hover:text-red-600" title="Hapus">
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Kategori */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editCat ? 'Edit Kategori' : 'Tambah Kategori'}
              </h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Nama Kategori</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Contoh: Pendidikan"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold outline-none text-black"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowCatModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={loadingAction || !catName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loadingAction ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tag */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editTag ? 'Edit Tag' : 'Tambah Tag'}
              </h3>
              <button onClick={() => setShowTagModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Nama Tag</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      placeholder="Contoh: KulinerMalang"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold outline-none text-black"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveTag}
                disabled={loadingAction || !tagName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loadingAction ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
