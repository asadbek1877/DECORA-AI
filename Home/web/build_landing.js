const fs = require('fs');
const content = import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageComparison } from '../components/ImageComparison';
import { User, LogIn, Crown, Sparkles, Image as ImageIcon, ChevronLeft, LayoutGrid } from 'lucide-react';

const DEMOS = [
  {
    id: 1,
    title: 'Modern Living Room',
    before: 'https://images.unsplash.com/photo-1554995207-c18c203602cb',
    thumb: 'https://images.unsplash.com/photo-1554995207-c18c203602cb',
    variants: [
      { name: 'Minimalist', after: 'https://images.unsplash.com/photo-1583847268964-b28ce8f31179' },
      { name: 'Industrial', after: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4' },
      { name: 'Classic', after: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0' },
    ]
  },
  {
    id: 2,
    title: 'Cozy Bedroom',
    before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    variants: [
      { name: 'Scandinavian', after: 'https://images.unsplash.com/photo-1522771730849-478c255827c8' },
      { name: 'Bohemian', after: 'https://images.unsplash.com/photo-1505693314120-0a273b573c71' },
    ]
  },
  {
    id: 3,
    title: 'Kitchen Renovation',
    before: 'https://images.unsplash.com/photo-1556910103-1c02745a828cb',
    thumb: 'https://images.unsplash.com/photo-1556910103-1c02745a828cb',
    variants: [
      { name: 'Modern', after: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d' },
      { name: 'Farmhouse', after: 'https://images.unsplash.com/photo-1556912173-3bb406ef7efc' },
    ]
  }
];

const FALLBACK_BEFORE = 'https://images.unsplash.com/photo-1513694203232-719a280e022f';
const FALLBACK_AFTER = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0';

export default function Landing() {
  const [activeMode, setActiveMode] = useState<'premium' | 'trial'>('trial');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credits] = useState(5);
  const [selectedDemo, setSelectedDemo] = useState<any>(null);
  const [activeVariant, setActiveVariant] = useState<any>(null);

  return (
    <div className='min-h-screen bg-[#050511] text-white overflow-hidden relative font-sans'>
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0'>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className='absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/30 blur-[120px]' 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className='absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[150px]' 
        />
      </div>

      <header className='relative z-10 flex justify-between items-center p-6 lg:px-12'>
        <div className='text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-2'>
          <Sparkles className='text-blue-400' /> Decora AI
        </div>
        <div className='flex gap-4 items-center'>
          {isLoggedIn ? (
             <div className='flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md'>
                <div className='text-sm flex items-center gap-2'>
                  <Crown size={16} className='text-yellow-400' />
                  <span className='font-bold'>{credits} Credits</span>
                </div>
                <div className='w-[1px] h-4 bg-white/20' />
                <button onClick={() => setIsLoggedIn(false)} className='text-sm text-gray-300 hover:text-white'>Logout</button>
             </div>
          ) : (
            <button 
              onClick={() => setIsLoggedIn(true)} 
              className='flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-medium transition-all backdrop-blur-md'
            >
              <LogIn size={18} /> Войти
            </button>
          )}
        </div>
      </header>

      <main className='relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center min-h-[80vh]'>
        
        <motion.div 
           initial={{ y: -20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className='flex p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full box-shadow-glass mb-16'
        >
          <button 
            onClick={() => { setActiveMode(\	rial\); setSelectedDemo(null); }}
            className={\elative px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 \\}
          >
            {activeMode === 'trial' && (
              <motion.div layoutId='mode-bg' className='absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full -z-10' />
            )}
            Попробовать бесплатно
          </button>
          <button 
            onClick={() => { setActiveMode('premium'); setSelectedDemo(null); }}
            className={\elative px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 \\}
          >
            {activeMode === 'premium' && (
              <motion.div layoutId='mode-bg' className='absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full -z-10 shadow-[0_0_20px_rgba(245,158,11,0.3)]' />
            )}
            Premium Mode
          </button>
        </motion.div>

        <AnimatePresence mode='wait'>
          {activeMode === 'premium' ? (
            <motion.div 
              key='premium'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className='w-full max-w-2xl flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl relative'
            >
              <Crown className='text-yellow-400 w-20 h-20 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' />
              <h2 className='text-3xl font-bold mb-4 text-center'>Полный доступ к AI Дизайнеру</h2>
              <p className='text-gray-300 text-center mb-10 max-w-md text-lg'>
                В Premium режиме вы можете загружать свои собственные фотографии интерьера и менять их в любых стилях.
              </p>

              {isLoggedIn ? (
                <div className='flex flex-col items-center w-full'>
                   <div className='bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl w-full flex flex-col items-center mb-8'>
                     <span className='text-gray-400 uppercase tracking-widest text-sm font-bold mb-2'>Ваш баланс</span>
                     <span className='text-5xl font-extrabold text-yellow-400 drop-shadow-md'>{credits}</span>
                     <span className='text-gray-300 mt-2 font-medium'>кредитов доступно</span>
                   </div>
                   <button className='w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-bold text-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-3'>
                     <ImageIcon /> Загрузить свое фото
                   </button>
                </div>
              ) : (
                <div className='flex flex-col items-center w-full'>
                   <div className='p-6 bg-white/5 border border-red-500/30 text-red-200 rounded-xl mb-8 flex items-center gap-4 w-full justify-center'>
                     <User /> <span>Сначала нужно войти в аккаунт</span>
                   </div>
                   <button 
                     onClick={() => setIsLoggedIn(true)}
                     className='w-full py-4 bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-xl transition-all shadow-xl'
                   >
                     Зарегистрироваться / Войти
                   </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
               key='trial'
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.4 }}
               className='w-full'
            >
              {!selectedDemo ? (
                <div className='w-full'>
                  <div className='text-center mb-10'>
                    <h2 className='text-4xl font-bold mb-4 drop-shadow-lg text-white'>Галерея демо вариантов</h2>
                    <p className='text-gray-400 text-lg'>Выберите одно из тестовых изображений, чтобы увидеть До / После эффект.</p>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto'>
                    {DEMOS.map((demo, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={demo.id}
                        onClick={() => {
                          setSelectedDemo(demo);
                          setActiveVariant(demo.variants[0]);
                        }}
                        className='group cursor-pointer flex flex-col'
                      >
                        <div className='relative overflow-hidden rounded-2xl aspect-[4/3] bg-white/10 border border-white/10 transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-2'>
                          <img 
                            src={demo.thumb} 
                            onError={(e) => (e.currentTarget.src = FALLBACK_BEFORE)}
                            alt={demo.title} 
                            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' 
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5'>
                            <h3 className='font-bold text-xl text-white drop-shadow-md'>{demo.title}</h3>
                            <p className='text-blue-300 text-sm'>Нажмите чтобы посмотреть</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='w-full flex flex-col items-center'
                >
                  <div className='w-full max-w-5xl flex flex-col lg:flex-row justify-between items-center mb-8 gap-6'>
                    <button 
                      onClick={() => setSelectedDemo(null)}
                      className='flex items-center gap-2 text-gray-400 hover:text-white bg-white/5 border border-white/10 px-6 py-2.5 rounded-full transition-all backdrop-blur-md hover:bg-white/10'
                    >
                      <ChevronLeft size={20} /> Назад
                    </button>
                    
                    <h2 className='text-3xl font-bold flex items-center gap-3'><LayoutGrid className='text-blue-400'/> {selectedDemo.title}</h2>
                  </div>

                  <div className='w-full max-w-5xl bg-white/5 border border-white/10 p-4 lg:p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative'>
                    
                    <div className='flex flex-wrap justify-center gap-3 mb-8 relative z-20'>
                      {selectedDemo.variants.map((v: any) => (
                        <button
                          key={v.name}
                          onClick={() => setActiveVariant(v)}
                          className={\px-6 py-2 rounded-full font-bold transition-all \\}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>

                    <div className='w-full mx-auto relative rounded-[2rem] overflow-hidden bg-black/50 shadow-2xl ring-1 ring-white/10 aspect-video'>
                       <ImageComparison 
                          beforeSrc={selectedDemo.before || FALLBACK_BEFORE}
                          afterSrc={activeVariant.after || FALLBACK_AFTER}
                          beforeLabel='Оригинал'
                          afterLabel={activeVariant.name}
                       />
                    </div>
                  </div>

                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
;
fs.writeFileSync('src/pages/Landing.tsx', content);

