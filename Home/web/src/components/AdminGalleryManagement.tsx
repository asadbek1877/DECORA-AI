import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/toastStore';

interface GalleryItem {
  id: string;
  title?: string;
  beforeImageUrl: string;
  order: number;
  isActive: boolean;
  variants: GalleryVariant[];
  createdAt: string;
}

interface GalleryVariant {
  id: string;
  styleName: string;
  styleCategory?: string;
  afterImageUrl: string;
  order: number;
  createdAt: string;
}

interface AdminGalleryManagementProps {
  adminPassword: string;
}

export default function AdminGalleryManagement({ adminPassword }: AdminGalleryManagementProps) {
  const { showToast } = useStore();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ═══════════════════════════════════════════
  // FETCH GALLERY
  // ═══════════════════════════════════════════

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Failed to fetch gallery');
      const data = await res.json();
      setGalleryItems(data.data);
    } catch (error) {
      console.error(error);
      showToast('Failed to load gallery', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  // CREATE GALLERY ITEM
  // ═══════════════════════════════════════════

  const handleCreateGalleryItem = async () => {
    if (!selectedFile || !newItemTitle.trim()) {
      showToast('Please select image and enter title', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', newItemTitle);

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'X-Admin-Password': adminPassword,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create gallery item');

      const data = await res.json();
      setGalleryItems([...galleryItems, data.data]);
      setNewItemTitle('');
      setSelectedFile(null);
      setShowNewItemForm(false);
      showToast('Gallery item created successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to create gallery item', 'error');
    }
  };

  // ═══════════════════════════════════════════
  // DELETE GALLERY ITEM
  // ═══════════════════════════════════════════

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });

      if (!res.ok) throw new Error('Failed to delete gallery item');

      setGalleryItems(galleryItems.filter((item) => item.id !== id));
      showToast('Gallery item deleted', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete gallery item', 'error');
    }
  };

  // ═══════════════════════════════════════════
  // ADD VARIANT
  // ═══════════════════════════════════════════

  const [showVariantForm, setShowVariantForm] = useState<string | null>(null);
  const [variantData, setVariantData] = useState({
    styleName: '',
    styleCategory: '',
    image: null as File | null,
  });

  const handleAddVariant = async (galleryItemId: string) => {
    if (!variantData.image || !variantData.styleName) {
      showToast('Please select image and enter style name', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', variantData.image);
      formData.append('styleName', variantData.styleName);
      formData.append('styleCategory', variantData.styleCategory);

      const res = await fetch(`/api/gallery/${galleryItemId}/variants`, {
        method: 'POST',
        headers: {
          'X-Admin-Password': adminPassword,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add variant');

      const data = await res.json();
      setGalleryItems(
        galleryItems.map((item) =>
          item.id === galleryItemId
            ? { ...item, variants: [...item.variants, data.data] }
            : item
        )
      );

      setVariantData({ styleName: '', styleCategory: '', image: null });
      setShowVariantForm(null);
      showToast('Variant added successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to add variant', 'error');
    }
  };

  // ═══════════════════════════════════════════
  // DELETE VARIANT
  // ═══════════════════════════════════════════

  const handleDeleteVariant = async (variantId: string, galleryItemId: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const res = await fetch(`/api/gallery/variants/${variantId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });

      if (!res.ok) throw new Error('Failed to delete variant');

      setGalleryItems(
        galleryItems.map((item) =>
          item.id === galleryItemId
            ? { ...item, variants: item.variants.filter((v) => v.id !== variantId) }
            : item
        )
      );

      showToast('Variant deleted', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete variant', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-on-surface dark:text-white">Gallery Management</h2>
        <button
          onClick={() => setShowNewItemForm(!showNewItemForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus size={20} />
          New Gallery Item
        </button>
      </div>

      {/* Create New Gallery Item Form */}
      {showNewItemForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 text-on-surface dark:text-white">Create New Gallery Item</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Gallery Item Title (e.g., Living Room Design)"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-on-surface dark:text-white"
            />

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="new-item-upload"
              />
              <label htmlFor="new-item-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={32} className="text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedFile ? selectedFile.name : 'Click to upload Before image'}
                </p>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateGalleryItem}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewItemForm(false);
                  setNewItemTitle('');
                  setSelectedFile(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gallery Items List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : galleryItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No gallery items yet</div>
      ) : (
        <div className="space-y-4">
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Item Header */}
              <div
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-on-surface dark:text-white">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant dark:text-gray-400">
                    {item.variants.length} style variants
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGalleryItem(item.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedItem === item.id ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedItem === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4"
                >
                  {/* Before Image Preview */}
                  <div>
                    <p className="text-sm font-semibold text-on-surface dark:text-white mb-2">Before Image</p>
                    <img
                      src={item.beforeImageUrl}
                      alt="Before"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>

                  {/* Variants */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold text-on-surface dark:text-white">Style Variants</p>
                      <button
                        onClick={() =>
                          setShowVariantForm(showVariantForm === item.id ? null : item.id)
                        }
                        className="text-xs px-3 py-1 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
                      >
                        <Plus size={16} className="inline mr-1" />
                        Add Style
                      </button>
                    </div>

                    {/* Add Variant Form */}
                    {showVariantForm === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4 space-y-3"
                      >
                        <input
                          type="text"
                          placeholder="Style Name (e.g., Modern, Minimalism)"
                          value={variantData.styleName}
                          onChange={(e) =>
                            setVariantData({ ...variantData, styleName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-on-surface dark:text-white text-sm"
                        />

                        <select
                          value={variantData.styleCategory}
                          onChange={(e) =>
                            setVariantData({ ...variantData, styleCategory: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-on-surface dark:text-white text-sm"
                        >
                          <option value="">Select Category</option>
                          <option value="minimalism">Minimalism</option>
                          <option value="luxury">Luxury</option>
                          <option value="modern">Modern</option>
                          <option value="classic">Classic</option>
                          <option value="industrial">Industrial</option>
                          <option value="bohemian">Bohemian</option>
                        </select>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setVariantData({
                              ...variantData,
                              image: e.target.files?.[0] || null,
                            })
                          }
                          className="w-full"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddVariant(item.id)}
                            className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-all"
                          >
                            Add Variant
                          </button>
                          <button
                            onClick={() => setShowVariantForm(null)}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-on-surface dark:text-white px-3 py-2 rounded-lg text-sm hover:bg-opacity-80 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Variants Grid */}
                    {item.variants.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {item.variants.map((variant) => (
                          <motion.div
                            key={variant.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group rounded-lg overflow-hidden"
                          >
                            <img
                              src={variant.afterImageUrl}
                              alt={variant.styleName}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-lg">
                              <p className="text-white text-sm font-semibold mb-2">
                                {variant.styleName}
                              </p>
                              <button
                                onClick={() => handleDeleteVariant(variant.id, item.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant dark:text-gray-400">
                        No style variants added yet
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
