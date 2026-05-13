-- AddGalleryDemoData migration
-- Adds sample gallery items to inspire users

-- Insert sample gallery items
INSERT INTO GalleryItem (id, title, description, createdAt, updatedAt) VALUES
  ('demo-1', 'Modern Living Room', 'Contemporary design with neutral tones', datetime('now'), datetime('now')),
  ('demo-2', 'Scandinavian Bedroom', 'Minimalist Nordic style bedroom', datetime('now'), datetime('now')),
  ('demo-3', 'Industrial Kitchen', 'Urban industrial kitchen design', datetime('now'), datetime('now'));

-- Insert before/after images for demo-1
INSERT INTO GalleryImage (id, galleryItemId, imageUrl, path, type, style, order, createdAt) VALUES
  ('demo-1-before', 'demo-1', 'https://via.placeholder.com/600x400?text=Before+Living+Room', '/gallery/demo-1-before.jpg', 'before', NULL, 0, datetime('now')),
  ('demo-1-after-1', 'demo-1', 'https://via.placeholder.com/600x400?text=Modern+Living+Room', '/gallery/demo-1-after-1.jpg', 'after', 'Contemporary', 1, datetime('now')),
  ('demo-1-after-2', 'demo-1', 'https://via.placeholder.com/600x400?text=Luxury+Living+Room', '/gallery/demo-1-after-2.jpg', 'after', 'Luxury', 2, datetime('now'));

-- Insert before/after images for demo-2
INSERT INTO GalleryImage (id, galleryItemId, imageUrl, path, type, style, order, createdAt) VALUES
  ('demo-2-before', 'demo-2', 'https://via.placeholder.com/600x400?text=Before+Bedroom', '/gallery/demo-2-before.jpg', 'before', NULL, 0, datetime('now')),
  ('demo-2-after-1', 'demo-2', 'https://via.placeholder.com/600x400?text=Scandinavian+Bedroom', '/gallery/demo-2-after-1.jpg', 'after', 'Scandinavian', 1, datetime('now')),
  ('demo-2-after-2', 'demo-2', 'https://via.placeholder.com/600x400?text=Cozy+Bedroom', '/gallery/demo-2-after-2.jpg', 'after', 'Cozy', 2, datetime('now'));

-- Insert before/after images for demo-3
INSERT INTO GalleryImage (id, galleryItemId, imageUrl, path, type, style, order, createdAt) VALUES
  ('demo-3-before', 'demo-3', 'https://via.placeholder.com/600x400?text=Before+Kitchen', '/gallery/demo-3-before.jpg', 'before', NULL, 0, datetime('now')),
  ('demo-3-after-1', 'demo-3', 'https://via.placeholder.com/600x400?text=Industrial+Kitchen', '/gallery/demo-3-after-1.jpg', 'after', 'Industrial', 1, datetime('now')),
  ('demo-3-after-2', 'demo-3', 'https://via.placeholder.com/600x400?text=Modern+Kitchen', '/gallery/demo-3-after-2.jpg', 'after', 'Modern', 2, datetime('now'));
