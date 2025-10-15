"use client";

interface StaticMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  className?: string;
}

export default function StaticMap({ 
  latitude, 
  longitude, 
  zoom = 15, 
  width = 300, 
  height = 200,
  className = ""
}: StaticMapProps) {
  // Using OpenStreetMap static map service (via external service)
  // Note: For production, you might want to use a dedicated static map service
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+FF0000(${longitude},${latitude})/${longitude},${latitude},${zoom}/${width}x${height}?access_token=YOUR_MAPBOX_TOKEN`;
  
  // Alternative using a simple service that works without API key
  const osmStaticUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
  
  return (
    <div className={`relative overflow-hidden rounded-lg border border-gray-200 ${className}`}>
      <iframe
        src={osmStaticUrl}
        width={width}
        height={height}
        style={{ border: 0 }}
        title="Static Map Preview"
        className="w-full h-full"
      />
      
      {/* Overlay to show coordinates */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </div>
    </div>
  );
}