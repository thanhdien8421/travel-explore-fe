/**
 * Generate slug from place name (same logic as backend)
 * Used for generating image filenames: slug.jpg
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};
