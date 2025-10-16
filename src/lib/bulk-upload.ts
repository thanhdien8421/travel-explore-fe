import { placesData } from './seed-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PlaceData {
  name: string;
  description: string;
  addressText: string;
  district: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  openingHours: string;
  priceInfo: string;
  tipsNotes: string;
  isFeatured?: boolean;
}

/**
 * Create a place via the backend API
 */
const createPlace = async (placeData: PlaceData) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: placeData.name,
      description: placeData.description,
      addressText: placeData.addressText,           // camelCase for backend
      district: placeData.district,
      city: 'TP. Hồ Chí Minh',
      latitude: placeData.latitude,
      longitude: placeData.longitude,
      coverImageUrl: placeData.coverImageUrl,       // camelCase for backend (filename only)
      openingHours: placeData.openingHours,         // camelCase for backend
      priceInfo: placeData.priceInfo,               // camelCase for backend
      tipsNotes: placeData.tipsNotes,               // camelCase for backend
      isFeatured: placeData.isFeatured ?? false,    // camelCase for backend
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create place: ${error}`);
  }
  
  return await response.json();
};

/**
 * Bulk upload all places from seed data
 * Note: Images must be manually uploaded to Supabase Storage first
 * Image filenames should match the coverImageUrl in seed data (slug.jpg)
 */
export const bulkUploadPlaces = async () => {
  console.log('🌱 Starting bulk upload...\n');
  console.log('📝 Note: Make sure images are already uploaded to Supabase Storage!\n');
  console.log(`📍 Processing ${placesData.length} places...\n`);
  
  let successCount = 0;
  let failedCount = 0;
  const failedPlaces: string[] = [];
  
  for (let i = 0; i < placesData.length; i++) {
    const placeData = placesData[i];
    const progress = `[${i + 1}/${placesData.length}]`;
    
    console.log(`${progress} Creating: ${placeData.name}`);
    console.log(`  📷 Image: ${placeData.coverImageUrl || 'No image'}`);
    
    try {
      // Create place via backend API
      // Images are already uploaded manually to Supabase Storage
      console.log(`  💾 Creating place in database...`);
      await createPlace(placeData);
      console.log(`  ✅ Place created successfully\n`);
      
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error:`, error);
      failedCount++;
      failedPlaces.push(placeData.name);
      console.log(''); // Empty line for readability
    }
  }
  
  console.log('✅ Bulk upload completed!\n');
  console.log('📊 Summary:');
  console.log(`   • Successful: ${successCount}`);
  console.log(`   • Failed: ${failedCount}`);
  if (failedPlaces.length > 0) {
    console.log(`   • Failed places:`, failedPlaces);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).bulkUploadPlaces = bulkUploadPlaces;
}
