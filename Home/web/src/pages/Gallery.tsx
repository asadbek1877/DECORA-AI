import React from 'react';
import BeforeAfterGallery from '../components/BeforeAfterGallery';

export default function GalleryPage() {
  return (
    <div className="w-full bg-gradient-to-b from-background to-gray-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BeforeAfterGallery showTitle={true} autoSlide={false} />
      </div>
    </div>
  );
}
