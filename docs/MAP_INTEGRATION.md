# Map Integration Documentation

## Overview
The travel-explore-fe application now includes interactive map functionality using OpenStreetMap and Leaflet.js. This integration displays place locations on detailed pages when latitude and longitude coordinates are available from the API.

## Components

### LocationMap Component (`src/components/location-map.tsx`)
Interactive map component that displays a place's location with the following features:
- **Interactive Map**: Users can zoom, pan, and interact with the map
- **Marker with Popup**: Shows place name, address, and coordinates
- **Loading States**: Displays loading indicator while map initializes
- **Error Handling**: Shows error message if map fails to load
- **Responsive Design**: Adapts to different screen sizes

**Props:**
- `latitude`: number - Place latitude coordinate
- `longitude`: number - Place longitude coordinate  
- `placeName`: string - Name of the place for marker popup
- `address?`: string - Optional address for display in popup

### StaticMap Component (`src/components/static-map.tsx`)
Simple static map preview component using iframe embed:
- **Static Preview**: Shows map as embedded iframe
- **Coordinate Display**: Shows coordinates overlay
- **Customizable Size**: Configurable width and height
- **No API Key Required**: Uses OpenStreetMap embed service

### Geo Utilities (`src/lib/geo-utils.ts`)
Helper functions for geographical operations:
- `calculateDistance()`: Calculate distance between two points
- `formatCoordinates()`: Format coordinates for display
- `isValidCoordinates()`: Validate coordinate values
- `generateMapUrls()`: Generate URLs for external map services
- `getCenterPoint()`: Calculate center of multiple coordinates

## Integration Points

### Detail Page (`src/app/locations/[id]/page.tsx`)
The map is integrated into the location detail page with:

1. **Main Map Section**: Large interactive map in the content area
2. **Address Information**: Formatted address and coordinates below map
3. **External Map Links**: Buttons to open location in Google Maps and OpenStreetMap
4. **Sidebar Coordinates**: Shows coordinates in the quick facts sidebar
5. **Conditional Rendering**: Only shows map when coordinates are available

### Map Section Features:
- **Full-size Interactive Map**: 384px height with zoom/pan controls
- **Place Marker**: Red marker with popup showing place details
- **Address Card**: Gray box below map with formatted address and coordinates
- **Action Buttons**: Links to external map services (Google Maps, OpenStreetMap)
- **Fallback UI**: Shows placeholder when coordinates are not available

## Dependencies

### NPM Packages
```json
{
  "leaflet": "^1.9.4",
  "@types/leaflet": "^1.9.8"
}
```

### CSS Imports
```css
@import "leaflet/dist/leaflet.css";
```

## API Requirements

The map integration requires the place detail API to return:
```typescript
interface PlaceDetail {
  latitude?: number | null;    // Place latitude
  longitude?: number | null;   // Place longitude
  name: string;               // Place name for marker
  address_text?: string;      // Full address
  district?: string;          // District name
  city?: string;             // City name
  // ... other fields
}
```

## Usage Examples

### Basic Map Usage
```tsx
import LocationMap from '@/components/location-map';

<LocationMap
  latitude={10.772461}
  longitude={106.698055}
  placeName="Chợ Bến Thành"
  address="Lê Lợi, Phường Bến Thành, Quận 1"
/>
```

### Generate External Map URLs
```tsx
import { generateMapUrls } from '@/lib/geo-utils';

const coords = { latitude: 10.772461, longitude: 106.698055 };
const urls = generateMapUrls(coords, "Chợ Bến Thành");

// urls.googleMaps - Google Maps URL
// urls.openStreetMap - OpenStreetMap URL
// urls.appleMaps - Apple Maps URL
// urls.bingMaps - Bing Maps URL
```

### Calculate Distance
```tsx
import { calculateDistance } from '@/lib/geo-utils';

const distance = calculateDistance(
  { latitude: 10.772461, longitude: 106.698055 },
  { latitude: 10.776889, longitude: 106.700806 }
);
// Returns distance in kilometers
```

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Android Chrome
- **Map Features**: Requires JavaScript enabled
- **Performance**: Lazy loads map only when component mounts

## Future Enhancements

Potential improvements for the map integration:

1. **Nearby Places**: Show other places on the same map
2. **Directions**: Integration with routing services
3. **Street View**: Add street view integration
4. **Custom Markers**: Different marker styles for different place types
5. **Clustering**: Group nearby places when zoomed out
6. **Offline Support**: Cache map tiles for offline viewing
7. **GPS Integration**: Show user's current location
8. **Area Boundaries**: Highlight district or city boundaries

## Troubleshooting

### Common Issues:

1. **Map Not Loading**
   - Check internet connection
   - Verify Leaflet CSS is imported
   - Check browser console for errors

2. **Marker Not Showing**
   - Verify coordinates are valid numbers
   - Check marker icon URLs are accessible
   - Ensure coordinates are within valid ranges

3. **Performance Issues**
   - Map initializes after component mount to avoid SSR issues
   - Uses dynamic imports to reduce bundle size
   - Cleanup map instance on unmount to prevent memory leaks

### Debug Mode:
Add debug logging to map component for troubleshooting:
```tsx
console.log('Initializing map with coords:', latitude, longitude);
```

## Security Considerations

- **External URLs**: All external map links use `rel="noopener noreferrer"`
- **XSS Protection**: Coordinate values are validated before display
- **HTTPS Only**: All map tile requests use HTTPS
- **No API Keys**: Uses free OpenStreetMap service without authentication