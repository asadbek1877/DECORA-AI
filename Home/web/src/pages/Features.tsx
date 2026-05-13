import { motion } from 'motion/react';
import { useLanguage } from '../i18n/useLanguage';
import { Lightbulb, CheckCircle, Clock, Zap } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'Image Comparison Slider',
    description: 'Smooth before/after image comparison with draggable slider and transparency effects',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: 2,
    title: 'Multi-Language Support',
    description: 'Support for Russian, Uzbek, English, and Japanese with persistent language selection',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: 3,
    title: 'Dark Mode Theme',
    description: 'Complete dark mode implementation with smooth transitions and full UI coverage',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: 4,
    title: 'Admin Panel',
    description: 'Comprehensive admin dashboard for image management, feature control, and user management',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: 5,
    title: 'Smooth Animations',
    description: 'Enhanced animations using Motion.js with liquid effects and smooth transitions',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: 6,
    title: 'Transparency & Liquid Effects',
    description: 'Modern glassmorphism design with transparent elements and fluid interactions',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: 7,
    title: 'AI Background Removal',
    description: 'Automatic background removal for uploaded images with AI processing',
    status: 'in-progress',
    icon: Clock,
  },
  {
    id: 8,
    title: 'Real-time Collaboration',
    description: 'Allow multiple users to collaborate on designs in real-time',
    status: 'planned',
    icon: Zap,
  },
  {
    id: 9,
    title: 'AR Preview',
    description: 'View designs in augmented reality using device camera',
    status: 'planned',
    icon: Zap,
  },
  {
    id: 10,
    title: 'Smart Furniture Placement',
    description: 'AI-powered furniture recommendations and placement suggestions',
    status: 'planned',
    icon: Zap,
  },
  {
    id: 11,
    title: 'Color Palette Generator',
    description: 'Automatically generate harmonious color palettes from uploaded images',
    status: 'planned',
    icon: Zap,
  },
  {
    id: 12,
    title: 'Material & Texture Library',
    description: 'Extensive library of materials and textures for realistic rendering',
    status: 'planned',
    icon: Zap,
  },
];

export default function Features() {
  const { t } = useLanguage();

  const statusConfig = {
    completed: {
      label: 'Completed',
      color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      icon: '✓',
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      icon: '◐',
    },
    planned: {
      label: 'Planned',
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      icon: '◯',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            className="flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Lightbulb className="text-primary" size={32} />
            <h1 className="text-5xl font-bold text-on-surface dark:text-white">Features & Ideas</h1>
          </motion.div>
          <p className="text-xl text-on-surface-variant dark:text-gray-400 max-w-2xl mx-auto">
            Track all implemented features and upcoming ideas for the Decora AI platform
          </p>
        </div>

        {/* Status Summary */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { status: 'completed', count: features.filter((f) => f.status === 'completed').length },
            { status: 'in-progress', count: features.filter((f) => f.status === 'in-progress').length },
            { status: 'planned', count: features.filter((f) => f.status === 'planned').length },
          ].map((item) => (
            <div key={item.status} className={`p-4 rounded-lg border ${statusConfig[item.status as keyof typeof statusConfig].color}`}>
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="text-sm">{statusConfig[item.status as keyof typeof statusConfig].label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const status = statusConfig[feature.status as keyof typeof statusConfig];

            return (
              <motion.div
                key={feature.id}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all shadow-sm hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="text-primary" size={24} />
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
                </div>

                <h3 className="text-lg font-bold text-on-surface dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Progress Bar */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            feature.status === 'completed'
                              ? '100%'
                              : feature.status === 'in-progress'
                                ? '50%'
                                : '0%',
                        }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      />
                    </div>
                    <span className="text-xs text-on-surface-variant dark:text-gray-500">
                      {feature.status === 'completed' ? '100%' : feature.status === 'in-progress' ? '50%' : '0%'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-20 p-12 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 rounded-2xl border border-primary/20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-on-surface dark:text-white mb-4">Have an Idea?</h2>
          <p className="text-on-surface-variant dark:text-gray-400 mb-6">
            We're always looking for ways to improve Decora AI. Share your feature ideas and feedback with us!
          </p>
          <button className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all">
            Send Feedback
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
