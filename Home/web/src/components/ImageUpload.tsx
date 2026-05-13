import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDesignStore } from '../store/designStore';

export default function ImageUpload() {
  const { uploadedPreview, setUploadedFile } = useDesignStore();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        return;
      }
      setUploadedFile(file);
    },
    [setUploadedFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const removeImage = useCallback(() => {
    setUploadedFile(null);
  }, [setUploadedFile]);

  return (
    <motion.section
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-text">Upload Your Room</h2>
        <p className="text-text-muted text-sm mt-1">
          Drag & drop a photo or click to browse
        </p>
      </div>

      <AnimatePresence mode="wait">
        {uploadedPreview ? (
          /* ─── Preview ─── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl overflow-hidden group"
          >
            <img
              src={uploadedPreview}
              alt="Uploaded room"
              className="w-full aspect-[16/10] object-cover"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <motion.button
                onClick={removeImage}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20"
                style={{
                  background: 'rgba(239, 68, 68, 0.7)',
                  backdropFilter: 'blur(8px)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕ Remove Image
              </motion.button>
            </div>

            {/* Success badge */}
            <div
              className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
              style={{
                background: 'rgba(34, 197, 94, 0.6)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ready
            </div>
          </motion.div>
        ) : (
          /* ─── Upload Zone ─── */
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            htmlFor="file-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center w-full aspect-[16/10] rounded-2xl cursor-pointer transition-all duration-300 ${
              isDragOver
                ? 'upload-border-active bg-primary/[0.06]'
                : 'upload-border bg-bg-card hover:bg-bg-card-hover'
            }`}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleInputChange}
              className="hidden"
            />

            <motion.div
              animate={isDragOver ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Upload Icon */}
              <div className="w-16 h-16 rounded-2xl glass-chip flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-light">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="text-center">
                <p className="text-text font-medium">
                  {isDragOver ? 'Drop your image here' : 'Drop an image here or click to upload'}
                </p>
                <p className="text-text-muted text-sm mt-1">JPG, PNG • Max 10MB</p>
              </div>

              <div className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/20">
                Browse Files
              </div>
            </motion.div>
          </motion.label>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
