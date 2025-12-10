import * as Location from "expo-location";

export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string; // e.g., "restaurant", "business", "address"
  phoneNumber?: string;
  rating?: number;
}

/**
 * Search for places using Nominatim (OpenStreetMap) - Free, no API key required
 * This works well for addresses and some businesses
 */
export const searchPlacesNominatim = async (
  query: string,
  centerLat?: number,
  centerLon?: number
): Promise<Place[]> => {
  try {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`;
    
    // Add location bias if available
    if (centerLat && centerLon) {
      url += `&lat=${centerLat}&lon=${centerLon}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ZoneApp/1.0", // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch places");
    }

    const data = await response.json();

    return data.map((item: any, index: number) => ({
      id: `nominatim_${item.place_id || index}`,
      name: item.display_name.split(",")[0] || item.display_name,
      address: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || "address",
    }));
  } catch (error) {
    console.error("Error searching places with Nominatim:", error);
    return [];
  }
};

/**
 * Enhanced search using Expo Location geocoding + Nominatim for businesses
 * This combines both approaches for better results
 */
export const searchPlacesEnhanced = async (
  query: string,
  centerLat?: number,
  centerLon?: number
): Promise<Place[]> => {
  const results: Place[] = [];
  const seenIds = new Set<string>();

  try {
    // First, try Expo Location geocoding (good for addresses)
    try {
      const geocodeResults = await Location.geocodeAsync(query);
      for (const result of geocodeResults.slice(0, 5)) {
        const id = `geocode_${result.latitude}_${result.longitude}`;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          
          // Reverse geocode to get address
          let address = query;
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            if (reverseGeocode && reverseGeocode.length > 0) {
              const addr = reverseGeocode[0];
              address = [
                addr.street,
                addr.city,
                addr.region,
                addr.postalCode,
              ]
                .filter(Boolean)
                .join(", ");
            }
          } catch {
            // Keep original query as address
          }

          results.push({
            id,
            name: address.split(",")[0] || query,
            address,
            latitude: result.latitude,
            longitude: result.longitude,
            type: "address",
          });
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }

    // Then, try Nominatim for business/place searches
    // This is especially good for business names like "Taco Bell"
    const nominatimResults = await searchPlacesNominatim(query, centerLat, centerLon);
    
    for (const result of nominatimResults) {
      if (!seenIds.has(result.id)) {
        seenIds.add(result.id);
        results.push({
          ...result,
          type: result.type || "business",
        });
      }
    }

    // Sort by relevance (businesses first, then addresses)
    results.sort((a, b) => {
      const aIsBusiness = a.type === "business" || a.type === "restaurant" || a.type === "shop";
      const bIsBusiness = b.type === "business" || b.type === "restaurant" || b.type === "shop";
      
      if (aIsBusiness && !bIsBusiness) return -1;
      if (!aIsBusiness && bIsBusiness) return 1;
      return 0;
    });

    return results.slice(0, 15); // Limit to 15 results
  } catch (error) {
    console.error("Error in enhanced place search:", error);
    return results;
  }
};

/**
 * Search for nearby businesses using Nominatim
 * This searches for businesses near a location
 */
export const searchNearbyBusinesses = async (
  query: string,
  centerLat: number,
  centerLon: number,
  radius: number = 5000 // meters
): Promise<Place[]> => {
  try {
    // Use Nominatim with proximity search
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&bounded=1&viewbox=${centerLon - 0.1},${centerLat + 0.1},${centerLon + 0.1},${centerLat - 0.1}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ZoneApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch nearby businesses");
    }

    const data = await response.json();

    return data
      .map((item: any, index: number) => ({
        id: `nearby_${item.place_id || index}`,
        name: item.display_name.split(",")[0] || item.display_name,
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type || "business",
      }))
      .filter((place: Place) => {
        // Filter by radius
        const distance = calculateDistance(
          centerLat,
          centerLon,
          place.latitude,
          place.longitude
        );
        return distance <= radius / 1000; // Convert to km
      });
  } catch (error) {
    console.error("Error searching nearby businesses:", error);
    return [];
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

