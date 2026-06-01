import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/useLanguage';
import { Camera, Settings, Users } from 'lucide-react';
import AdminGalleryManagement from '../components/AdminGalleryManagement';
import { useAdminData } from '../hooks/useAdminData';

type AdminTab = 'gallery' | 'settings' | 'users';

export default function Admin() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [adminPassword, setAdminPassword] = useState(localStorage.getItem('admin_password') || '');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(!adminPassword);
  const { users, settings, isLoading, isSaving, error, loadUsers, loadSettings, saveSettings } = useAdminData();
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setBeforeImageUrl(settings.beforeImageUrl);
      setAfterImageUrl(settings.afterImageUrl);
    }
  }, [settings]);

  const unlockAdmin = () => {
    localStorage.setItem('admin_password', adminPassword);
    setShowPasswordPrompt(false);
    void loadUsers();
    void loadSettings();
  };

  const handleSaveSettings = async () => {
    await saveSettings({ beforeImageUrl, afterImageUrl });
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
        <p className="text-on-surface-variant dark:text-gray-400 mb-8">Manage live users, settings, and gallery content</p>

        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'users', label: t('admin.users'), icon: Users },
            { id: 'settings', label: t('admin.settings'), icon: Settings },
            { id: 'gallery', label: 'Gallery', icon: Camera },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
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

        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-on-surface dark:text-white">Admin Access Required</h2>
              <p className="text-on-surface-variant dark:text-gray-400 mb-6">Enter the admin password for protected endpoints.</p>
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-on-surface dark:text-white mb-4"
              />
              <button
                onClick={unlockAdmin}
                disabled={!adminPassword.trim()}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                Access
              </button>
            </motion.div>
          </motion.div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-on-surface dark:text-white">User Management</h2>
              {isLoading ? (
                <p className="text-on-surface-variant dark:text-gray-400">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-on-surface-variant dark:text-gray-400">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 font-semibold text-on-surface dark:text-white">Name</th>
                        <th className="pb-3 font-semibold text-on-surface dark:text-white">Email</th>
                        <th className="pb-3 font-semibold text-on-surface dark:text-white">Credits</th>
                        <th className="pb-3 font-semibold text-on-surface dark:text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 text-on-surface dark:text-white">{user.username}</td>
                          <td className="py-3 text-on-surface-variant dark:text-gray-400">{user.email}</td>
                          <td className="py-3 text-on-surface dark:text-white">{user.credits}</td>
                          <td className="py-3">
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-on-surface dark:text-white">Application Settings</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium text-on-surface dark:text-white mb-2">Before Image URL</span>
                  <input
                    value={beforeImageUrl}
                    onChange={(event) => setBeforeImageUrl(event.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-on-surface dark:text-white mb-2">After Image URL</span>
                  <input
                    value={afterImageUrl}
                    onChange={(event) => setAfterImageUrl(event.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white"
                  />
                </label>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !beforeImageUrl || !afterImageUrl}
                  className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'gallery' && adminPassword && (
          <AdminGalleryManagement adminPassword={adminPassword} />
        )}
      </motion.div>
    </div>
  );
}
