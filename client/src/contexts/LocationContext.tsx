import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Jurisdiction, Zipcode } from "@shared/schema";

interface LocationInfo {
  zipcode: string;
  city?: string;
  neighborhood?: string;
  jurisdiction?: Jurisdiction;
}

interface LocationContextType {
  location: LocationInfo;
  setZipcode: (zipcode: string) => void;
  isLoading: boolean;
  isSupported: boolean;
  hasJurisdiction: boolean;
}

const defaultLocation: LocationInfo = {
  zipcode: "20902",
  city: "Silver Spring",
  neighborhood: "Wheaton",
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [zipcode, setZipcodeState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("townsquare-zipcode") || "20902";
    }
    return "20902";
  });

  const { data: zipcodeData, isLoading } = useQuery<{
    zipcode: string;
    city: string | null;
    state: string | null;
    neighborhoods: string[] | null;
    jurisdiction?: Jurisdiction;
    supported: boolean;
    hasJurisdiction?: boolean;
    message?: string;
  }>({
    queryKey: ["/api/zipcodes/lookup", zipcode],
    enabled: !!zipcode && zipcode.length === 5,
  });

  const location: LocationInfo = zipcodeData?.supported
    ? {
        zipcode: zipcodeData.zipcode,
        city: zipcodeData.city || undefined,
        neighborhood: zipcodeData.neighborhoods?.[0] || undefined,
        jurisdiction: zipcodeData.jurisdiction,
      }
    : { ...defaultLocation, zipcode };

  const setZipcode = (newZipcode: string) => {
    setZipcodeState(newZipcode);
    if (typeof window !== "undefined") {
      localStorage.setItem("townsquare-zipcode", newZipcode);
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
        isLoading,
        isSupported: zipcodeData?.supported ?? true,
        hasJurisdiction: zipcodeData?.hasJurisdiction ?? false,
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
