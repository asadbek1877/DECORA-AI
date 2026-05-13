import { DesignStyleInput } from '../services/replicate.service';

export type DesignStyle = DesignStyleInput;

export const designStyles: DesignStyle[] = [
  {
    name: 'minimalizm',
    displayName: 'Minimalizm',
    colorPalette: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#333333', '#000000'],
    lightingMood: 'Clean, natural daylight with soft ambient fill lighting',
    furnitureType: 'Low-profile, simple geometric forms, Scandinavian-inspired pieces',
    materials: ['Smooth concrete', 'Light oak wood', 'White lacquer', 'Glass', 'Linen'],
    cameraPerspective: 'Wide-angle, eye-level, centered composition',
    description: 'Toza chiziqlar, ochiq makon va monoxromatik palitra bilan funktsional go\'zallik.',
  },
  {
    name: 'hi-tech',
    displayName: 'Hi-Tech',
    colorPalette: ['#0A0A0A', '#1E1E2E', '#00D4FF', '#7B2FBE', '#FF6B00'],
    lightingMood: 'Cool white LED ambient with neon accent strips, futuristic glow',
    furnitureType: 'Modular smart furniture, floating shelves, LED-integrated pieces',
    materials: ['Brushed steel', 'Carbon fiber', 'Tempered glass', 'Chrome', 'Acrylic'],
    cameraPerspective: 'Dramatic wide-angle with clean geometric lines, high contrast',
    description: 'Zamonaviy texnologiyalar va futuristik estetikaning go\'zal uyg\'unligi.',
  },
  {
    name: 'loft',
    displayName: 'Loft',
    colorPalette: ['#2C2C2C', '#8B7355', '#A0A0A0', '#4A3728', '#D4D4D4'],
    lightingMood: 'Exposed Edison bulbs, metallic pendant lights, raw warm atmosphere',
    furnitureType: 'Reclaimed wood tables, metal stools, exposed shelving, brick walls',
    materials: ['Exposed brick', 'Raw steel', 'Reclaimed wood', 'Concrete', 'Iron pipes'],
    cameraPerspective: 'Wide-angle showing exposed structure, dramatic industrial lighting',
    description: 'Ko\'hna fabrika estetikasi — qo\'pol materiallar va sanoat xarakteri.',
  },
  {
    name: 'neoklassika',
    displayName: 'Neoklassika',
    colorPalette: ['#F5F0E1', '#C9A84C', '#3C2A1A', '#D4AF37', '#8B6914'],
    lightingMood: 'Warm chandelier lighting, golden sconces, regal and inviting ambiance',
    furnitureType: 'Wingback chairs, carved wood tables, ornate cabinets, classical columns',
    materials: ['Marble', 'Dark wood', 'Gold leaf', 'Silk', 'Damask fabric'],
    cameraPerspective: 'Elevated symmetrical perspective emphasizing grand proportions',
    description: 'Klassik me\'morchilik va zamonaviy dizaynning mukammal uyg\'unligi.',
  },
  {
    name: 'skandinavcha',
    displayName: 'Skandinavcha',
    colorPalette: ['#FFFFFF', '#F0EDE5', '#C4B9A4', '#5C5C5C', '#2E3A23'],
    lightingMood: 'Soft natural light, warm white pendant lamps, hygge cozy atmosphere',
    furnitureType: 'Clean-lined wooden furniture, cozy textiles, functional Scandinavian design',
    materials: ['Light birch wood', 'Wool', 'Cotton', 'Ceramic', 'Sheepskin'],
    cameraPerspective: 'Eye-level, warm composition with natural light emphasis',
    description: 'Issiq minimalizm, tabiiy materiallar va qulay, funktsional dizayn.',
  },
  {
    name: 'modern',
    displayName: 'Modern',
    colorPalette: ['#FFFFFF', '#F2F2F2', '#333333', '#0066CC', '#E8E8E8'],
    lightingMood: 'Bright, clean recessed lighting with architectural accent strips',
    furnitureType: 'Sleek contemporary sofas, glass tables, mid-century modern chairs',
    materials: ['Polished concrete', 'Glass', 'Chrome', 'Engineered wood', 'Microfiber'],
    cameraPerspective: 'Clean wide-angle, balanced symmetry, architectural focus',
    description: 'Zamonaviy toza dizayn, aqlli tartib va nozik materiallar bilan.',
  },
  {
    name: 'klassika',
    displayName: 'Klassika',
    colorPalette: ['#FDF8F0', '#8B6914', '#3C2A1A', '#D4AF37', '#FFFFF0'],
    lightingMood: 'Warm chandelier lighting, wall sconces, timeless elegant ambiance',
    furnitureType: 'Antique carved furniture, Persian rugs, crystal chandeliers, ornate mirrors',
    materials: ['Dark mahogany', 'Silk', 'Marble', 'Brass', 'Velvet'],
    cameraPerspective: 'Elevated grand perspective, classical symmetry and balance',
    description: 'Abadiy nafosatli bezaklar, boy yog\'ochlar va issiq ranglar bilan.',
  },
  {
    name: 'art-deko',
    displayName: 'Art Deko',
    colorPalette: ['#0D0D0D', '#C9A84C', '#1A3C40', '#F5E6CC', '#8B4513'],
    lightingMood: 'Warm amber with geometric light fixtures and dramatic shadows',
    furnitureType: 'Geometric shapes, curved velvet sofas, sunburst mirrors, lacquered cabinets',
    materials: ['Polished brass', 'Lacquered wood', 'Velvet', 'Mirror panels', 'Terrazzo'],
    cameraPerspective: 'Symmetrical, slightly low angle emphasizing geometric patterns',
    description: '1920-yillarning hashamatli geometriyasi va boy metalik materiallar.',
  },
  {
    name: 'provans',
    displayName: 'Provans',
    colorPalette: ['#F5E6D3', '#C4956A', '#8FAF7E', '#E8D5B7', '#7B9E87'],
    lightingMood: 'Warm soft natural sunlight with vintage linen shades, romantic atmosphere',
    furnitureType: 'Distressed painted wood furniture, floral fabrics, wicker baskets, lavender accents',
    materials: ['Washed linen', 'Whitewashed wood', 'Terracotta', 'Natural stone', 'Wicker'],
    cameraPerspective: 'Soft warm angle with natural light, cozy and romantic composition',
    description: 'Frantsuz qishlog\'ining romantik nafosati — og\'ir toshtahta va lavanda rangi.',
  },
  {
    name: 'japandi',
    displayName: 'Japandi',
    colorPalette: ['#F5F0EB', '#D4C5B2', '#6B705C', '#3A3A3A', '#B7A99A'],
    lightingMood: 'Soft diffused natural light, paper lantern accents, zen-like calm',
    furnitureType: 'Low wooden furniture, tatami elements, wabi-sabi natural imperfections',
    materials: ['Natural wood', 'Bamboo', 'Linen', 'Stone', 'Rice paper'],
    cameraPerspective: 'Low angle, floor-level perspective, zen-like stillness and balance',
    description: 'Yapon minimalizmi va Skandinaviya issiqligi — sokin va muvozanatli.',
  },
  {
    name: 'luxury',
    displayName: 'Luxury',
    colorPalette: ['#2C1810', '#D4AF37', '#1A1A1A', '#C0A080', '#8B7355'],
    lightingMood: 'Warm chandelier lighting with accent spotlights, golden uplighting, dramatic and opulent ambiance',
    furnitureType: 'High-end upholstered pieces, statement seating, designer furniture, luxury leather sofas, ornamental accents',
    materials: ['Velvet', 'Marble', 'Gold leaf', 'Premium leather', 'Brass fixtures', 'Crystal', 'Silk'],
    cameraPerspective: 'Elevated symmetrical angle emphasizing spaciousness and grandeur, luxury showcase framing',
    description: 'Premium materiallar, hashamatli bezaklar, boyalgan teksturalar va zamonaviy go\'zallik.',
  },
  // English aliases for frontend compatibility
  {
    name: 'minimal',
    displayName: 'Minimal',
    colorPalette: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#333333', '#000000'],
    lightingMood: 'Clean, natural daylight with soft ambient fill lighting',
    furnitureType: 'Low-profile, simple geometric forms, Scandinavian-inspired pieces',
    materials: ['Smooth concrete', 'Light oak wood', 'White lacquer', 'Glass', 'Linen'],
    cameraPerspective: 'Wide-angle, eye-level, centered composition',
    description: 'Essential elements only, monochromatic colors, and geometric simplicity.',
  },
  {
    name: 'scandinavian',
    displayName: 'Scandinavian',
    colorPalette: ['#FFFFFF', '#F0EDE5', '#C4B9A4', '#5C5C5C', '#2E3A23'],
    lightingMood: 'Soft natural light, warm white pendant lamps, hygge cozy atmosphere',
    furnitureType: 'Clean-lined wooden furniture, cozy textiles, functional Scandinavian design',
    materials: ['Light birch wood', 'Wool', 'Cotton', 'Ceramic', 'Sheepskin'],
    cameraPerspective: 'Eye-level, warm composition with natural light emphasis',
    description: 'Light wood, cozy textiles, functional design, and hygge atmosphere.',
  },
  {
    name: 'classic',
    displayName: 'Classic',
    colorPalette: ['#FDF8F0', '#8B6914', '#3C2A1A', '#D4AF37', '#FFFFF0'],
    lightingMood: 'Warm chandelier lighting, wall sconces, timeless elegant ambiance',
    furnitureType: 'Antique carved furniture, Persian rugs, crystal chandeliers, ornate mirrors',
    materials: ['Dark mahogany', 'Silk', 'Marble', 'Brass', 'Velvet'],
    cameraPerspective: 'Elevated grand perspective, classical symmetry and balance',
    description: 'Timeless elegance, traditional furniture, and refined sophistication.',
  },
  {
    name: 'japanese',
    displayName: 'Japanese',
    colorPalette: ['#F5F0EB', '#D4C5B2', '#6B705C', '#3A3A3A', '#B7A99A'],
    lightingMood: 'Soft diffused natural light, paper lantern accents, zen-like calm',
    furnitureType: 'Low wooden furniture, tatami elements, wabi-sabi natural imperfections',
    materials: ['Natural wood', 'Bamboo', 'Linen', 'Stone', 'Rice paper'],
    cameraPerspective: 'Low angle, floor-level perspective, zen-like stillness and balance',
    description: 'Natural materials, zen aesthetics, minimalist philosophy, and peaceful ambiance.',
  },
  {
    name: 'industrial',
    displayName: 'Industrial',
    colorPalette: ['#2C2C2C', '#8B7355', '#A0A0A0', '#4A3728', '#D4D4D4'],
    lightingMood: 'Exposed Edison bulbs, metallic pendant lights, raw warm atmosphere',
    furnitureType: 'Reclaimed wood tables, metal stools, exposed shelving, brick walls',
    materials: ['Exposed brick', 'Raw steel', 'Reclaimed wood', 'Concrete', 'Iron pipes'],
    cameraPerspective: 'Wide-angle showing exposed structure, dramatic industrial lighting',
    description: 'Raw materials, exposed brick, metal fixtures, and vintage warehouse aesthetics.',
  },
];

export function getStyleByName(name: string): DesignStyle | undefined {
  return designStyles.find((s) => s.name === name.toLowerCase());
}

export function getAllStyles(): DesignStyle[] {
  return designStyles;
}

export function getStyleNames(): string[] {
  return designStyles.map((s) => s.name);
}
