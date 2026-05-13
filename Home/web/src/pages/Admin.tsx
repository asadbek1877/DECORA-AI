import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/useLanguage';
import { Upload, Image as ImageIcon, Settings, Users, Camera } from 'lucide-react';
import AdminGalleryManagement from '../components/AdminGalleryManagement';

export default function Admin() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'images' | 'features' | 'settings' | 'users' | 'gallery'>('images');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [features, setFeatures] = useState<Array<{ id: string; name: string; enabled: boolean }>>([
    { id: '1', name: 'Image Comparison', enabled: true },
    { id: '2', name: 'Dark Mode', enabled: true },
    { id: '3', name: 'Multi-language', enabled: true },
    { id: '4', name: 'Admin Panel', enabled: true },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      setUploadedImages([...uploadedImages, ...Array.from(files)]);
    }
  };

  const handleDeleteImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-on-surface dark:text-white mb-2">{t('admin.title')}</h1>
        <p className="text-on-surface-variant dark:text-gray-400 mb-8">Manage your application settings and content</p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'images', label: t('admin.uploadImages'), icon: ImageIcon },
            { id: 'gallery', label: 'Gallery', icon: Camera },
            { id: 'features', label: t('admin.manageFeatures'), icon: Settings },
            { id: 'settings', label: t('admin.settings'), icon: Settings },
            { id: 'users', label: t('admin.users'), icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'gallery' && !adminPassword) {
                  setShowPasswordPrompt(true);
                } else {
                  setActiveTab(tab.id as any);
                }
              }}
              className={`px-4 py-3 pb-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Admin Password Prompt Modal */}
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-on-surface dark:text-white">Admin Access Required</h2>
              <p className="text-on-surface-variant dark:text-gray-400 mb-6">
                Enter the admin password to access gallery management
              </p>
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-on-surface dark:text-white mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveTab('gallery');
                    setShowPasswordPrompt(false);
                  }}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
                >
                  Access
                </button>
                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-on-surface dark:text-white">Upload Gallery Images</h2>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900/50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <Upload size={32} className="text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">Drop images here or click to upload</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>

              {/* Uploaded Images Grid */}
              {uploadedImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-on-surface dark:text-white">Uploaded Images ({uploadedImages.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedImages.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteImage(index)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <span className="text-white font-bold">Delete</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-on-surface dark:text-white">Manage Features</h2>
              <div className="space-y-3">
                {features.map((feature) => (
                  <motion.div
                    key={feature.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <span className="font-medium text-on-surface dark:text-white">{feature.name}</span>
                    <button
                      onClick={() => {
                        setFeatures(
                          features.map((f) =>
                            f.id === feature.id ? { ...f, enabled: !f.enabled } : f
                          )
                        );
                      }}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        feature.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                        animate={{ x: feature.enabled ? 24 : 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-on-surface dark:text-white">Application Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-2">API Key</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter your API key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface dark:text-white mb-2">Max Upload Size (MB)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white"
                    placeholder="100"
                  />
                </div>
                <button className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-all">
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-on-surface dark:text-white">User Management</h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-semibold text-on-surface dark:text-white">Name</th>
                    <th className="pb-3 font-semibold text-on-surface dark:text-white">Email</th>
                    <th className="pb-3 font-semibold text-on-surface dark:text-white">Status</th>
                    <th className="pb-3 font-semibold text-on-surface dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3 text-on-surface dark:text-white">John Doe</td>
                    <td className="py-3 text-on-surface-variant dark:text-gray-400">john@example.com</td>
                    <td className="py-3">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                        Active
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-primary hover:underline">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && adminPassword && (
          <AdminGalleryManagement adminPassword={adminPassword} />
        )}
      </motion.div>
    </div>
  );
}
