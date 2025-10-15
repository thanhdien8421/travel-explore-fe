/**
 * Utility functions for working with geographical coordinates
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param coord1 First coordinate point
 * @param coord2 Second coordinate point
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Number(distance.toFixed(2));
}

/**
 * Format coordinates for display
 * @param coords Coordinates object
 * @param precision Number of decimal places (default: 6)
 * @returns Formatted coordinate string
 */
export function formatCoordinates(coords: Coordinates, precision: number = 6): string {
  return `${coords.latitude.toFixed(precision)}, ${coords.longitude.toFixed(precision)}`;
}

/**
 * Check if coordinates are valid
 * @param coords Coordinates object
 * @returns True if coordinates are valid
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    coords.latitude >= -90 && coords.latitude <= 90 &&
    coords.longitude >= -180 && coords.longitude <= 180
  );
}

/**
 * Generate various map URLs for external services
 * @param coords Coordinates object
 * @param placeName Optional place name for the marker
 * @returns Object containing URLs for different map services
 */
export function generateMapUrls(coords: Coordinates, placeName?: string) {
  const { latitude, longitude } = coords;
  const encodedName = placeName ? encodeURIComponent(placeName) : '';
  
  return {
    googleMaps: `https://www.google.com/maps?q=${latitude},${longitude}${placeName ? `+(${encodedName})` : ''}`,
    openStreetMap: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16`,
    appleMaps: `https://maps.apple.com/?q=${latitude},${longitude}`,
    bingMaps: `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=16${placeName ? `&sp=point.${latitude}_${longitude}_${encodedName}` : ''}`,
  };
}

/**
 * Get the center point of multiple coordinates
 * @param coordinates Array of coordinate points
 * @returns Center coordinate point
 */
export function getCenterPoint(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length === 0) {
    throw new Error('Cannot calculate center of empty coordinates array');
  }
  
  if (coordinates.length === 1) {
    return coordinates[0];
  }
  
  const totalLat = coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
  const totalLon = coordinates.reduce((sum, coord) => sum + coord.longitude, 0);
  
  return {
    latitude: totalLat / coordinates.length,
    longitude: totalLon / coordinates.length
  };
}