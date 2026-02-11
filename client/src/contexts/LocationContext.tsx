import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Jurisdiction } from "@shared/schema";

interface LocationInfo {
  zipcode: string;
  city?: string;
  state?: string;
  stateCode?: string;
  neighborhood?: string;
  jurisdiction?: Jurisdiction;
  latitude?: number;
  longitude?: number;
}

interface LocationContextType {
  location: LocationInfo;
  setZipcode: (zipcode: string) => void;
  setStateCode: (stateCode: string) => void;
  detectLocation: () => Promise<void>;
  isLoading: boolean;
  isDetecting: boolean;
  isSupported: boolean;
  hasJurisdiction: boolean;
  locationError: string | null;
}

const defaultLocation: LocationInfo = {
  zipcode: "20902",
  city: "Silver Spring",
  state: "Maryland",
  stateCode: "MD",
  neighborhood: "Wheaton",
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// US State abbreviation to full name mapping
const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia", PR: "Puerto Rico"
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [zipcode, setZipcodeState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("townsquare-zipcode") || "20902";
    }
    return "20902";
  });
  
  const [stateCode, setStateCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("townsquare-state") || "MD";
    }
    return "MD";
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: zipcodeData, isLoading } = useQuery<{
    zipcode: string;
    city: string | null;
    state: string | null;
    stateCode: string | null;
    neighborhoods: string[] | null;
    jurisdiction?: Jurisdiction;
    supported: boolean;
    hasJurisdiction?: boolean;
    message?: string;
  }>({
    queryKey: ["/api/zipcodes/lookup", zipcode],
    enabled: !!zipcode && zipcode.length === 5,
  });

  // Reverse geocode coordinates to get location info
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      // Use Census Geocoding API (free, no API key needed)
      const response = await fetch(
        `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=all&format=json`
      );
      const data = await response.json();
      
      if (data.result?.geographies?.States?.[0]) {
        const stateInfo = data.result.geographies.States[0];
        const newStateCode = stateInfo.STUSAB || stateInfo.STATE;
        
        // Try to get ZIP from Census blocks
        const zipInfo = data.result?.geographies?.["2020 Census ZIP Code Tabulation Areas"]?.[0];
        const newZip = zipInfo?.ZCTA5CE20 || zipcode;
        
        setStateCode(newStateCode);
        setZipcodeState(newZip);
        
        if (typeof window !== "undefined") {
          localStorage.setItem("townsquare-state", newStateCode);
          localStorage.setItem("townsquare-zipcode", newZip);
        }
        
        return { stateCode: newStateCode, zipcode: newZip };
      }
      throw new Error("Could not determine location from coordinates");
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      throw error;
    }
  }, [zipcode]);

  // Detect user's current location
  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lng: longitude });
      
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enter your ZIP code manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable. Please enter your ZIP code manually.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
        }
      } else {
        setLocationError("Could not detect location. Please enter your ZIP code manually.");
      }
    } finally {
      setIsDetecting(false);
    }
  }, [reverseGeocode]);

  const location: LocationInfo = {
    zipcode: zipcodeData?.zipcode || zipcode,
    city: zipcodeData?.city || undefined,
    state: stateNames[zipcodeData?.stateCode || stateCode] || zipcodeData?.state || undefined,
    stateCode: zipcodeData?.stateCode || stateCode,
    neighborhood: zipcodeData?.neighborhoods?.[0] || undefined,
    jurisdiction: zipcodeData?.jurisdiction,
    latitude: coords?.lat,
    longitude: coords?.lng,
  };

  const setZipcode = (newZipcode: string) => {
    setZipcodeState(newZipcode);
    if (typeof window !== "undefined") {
      localStorage.setItem("townsquare-zipcode", newZipcode);
    }
  };

  // Allow manual state selection
  const setStateCodeManual = (newStateCode: string) => {
    setStateCode(newStateCode.toUpperCase());
    if (typeof window !== "undefined") {
      localStorage.setItem("townsquare-state", newStateCode.toUpperCase());
    }
  };

  useEffect(() => {
    if (zipcode && typeof window !== "undefined") {
      localStorage.setItem("townsquare-zipcode", zipcode);
    }
  }, [zipcode]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setZipcode,
        setStateCode: setStateCodeManual,
        detectLocation,
        isLoading,
        isDetecting,
        isSupported: zipcodeData?.supported ?? true,
        hasJurisdiction: zipcodeData?.hasJurisdiction ?? false,
        locationError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useUserLocation must be used within a LocationProvider");
  }
  return context;
}
