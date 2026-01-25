// Jurisdiction lookup service
// Uses database when available, falls back to hardcoded data

import { db, isDatabaseConfigured } from './db';
import { zipcodes, jurisdictions } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { cache, cacheKeys, cacheTTL } from './cache';

export interface JurisdictionInfo {
  zipcode: string;
  city: string | null;
  state: string | null;
  jurisdictionId: number | null;
  jurisdictionSlug: string;
  jurisdictionName: string;
  jurisdictionType: string;
  neighborhoods: string[];
  supported: boolean;
}

// Hardcoded fallback data for Montgomery County
const MONTGOMERY_COUNTY_ZIPCODES: Record<string, { city: string; neighborhoods: string[] }> = {
  '20812': { city: 'Glen Echo', neighborhoods: ['Glen Echo'] },
  '20814': { city: 'Bethesda', neighborhoods: ['Bethesda'] },
  '20815': { city: 'Chevy Chase', neighborhoods: ['Chevy Chase'] },
  '20816': { city: 'Bethesda', neighborhoods: ['Bethesda', 'Glen Echo Heights'] },
  '20817': { city: 'Bethesda', neighborhoods: ['Bethesda', 'Cabin John'] },
  '20818': { city: 'Cabin John', neighborhoods: ['Cabin John'] },
  '20824': { city: 'Bethesda', neighborhoods: ['Bethesda'] },
  '20825': { city: 'Chevy Chase', neighborhoods: ['Chevy Chase'] },
  '20827': { city: 'Bethesda', neighborhoods: ['Bethesda'] },
  '20832': { city: 'Olney', neighborhoods: ['Olney'] },
  '20833': { city: 'Brookeville', neighborhoods: ['Brookeville'] },
  '20837': { city: 'Poolesville', neighborhoods: ['Poolesville'] },
  '20838': { city: 'Barnesville', neighborhoods: ['Barnesville'] },
  '20839': { city: 'Beallsville', neighborhoods: ['Beallsville'] },
  '20841': { city: 'Boyds', neighborhoods: ['Boyds'] },
  '20842': { city: 'Dickerson', neighborhoods: ['Dickerson'] },
  '20850': { city: 'Rockville', neighborhoods: ['Rockville'] },
  '20851': { city: 'Rockville', neighborhoods: ['Rockville', 'Twinbrook'] },
  '20852': { city: 'Rockville', neighborhoods: ['Rockville', 'North Bethesda'] },
  '20853': { city: 'Rockville', neighborhoods: ['Rockville'] },
  '20854': { city: 'Potomac', neighborhoods: ['Potomac'] },
  '20855': { city: 'Derwood', neighborhoods: ['Derwood'] },
  '20860': { city: 'Sandy Spring', neighborhoods: ['Sandy Spring'] },
  '20861': { city: 'Ashton', neighborhoods: ['Ashton'] },
  '20862': { city: 'Brinklow', neighborhoods: ['Brinklow'] },
  '20866': { city: 'Burtonsville', neighborhoods: ['Burtonsville'] },
  '20868': { city: 'Spencerville', neighborhoods: ['Spencerville'] },
  '20871': { city: 'Clarksburg', neighborhoods: ['Clarksburg'] },
  '20872': { city: 'Damascus', neighborhoods: ['Damascus'] },
  '20874': { city: 'Germantown', neighborhoods: ['Germantown'] },
  '20875': { city: 'Germantown', neighborhoods: ['Germantown'] },
  '20876': { city: 'Germantown', neighborhoods: ['Germantown'] },
  '20877': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg'] },
  '20878': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg', 'Quince Orchard'] },
  '20879': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg'] },
  '20880': { city: 'Washington Grove', neighborhoods: ['Washington Grove'] },
  '20882': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg', 'Laytonsville'] },
  '20883': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg'] },
  '20884': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg'] },
  '20885': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg'] },
  '20886': { city: 'Montgomery Village', neighborhoods: ['Montgomery Village'] },
  '20889': { city: 'Bethesda', neighborhoods: ['Bethesda', 'NIH'] },
  '20891': { city: 'Kensington', neighborhoods: ['Kensington'] },
  '20892': { city: 'Bethesda', neighborhoods: ['Bethesda', 'NIH'] },
  '20894': { city: 'Bethesda', neighborhoods: ['Bethesda'] },
  '20895': { city: 'Kensington', neighborhoods: ['Kensington'] },
  '20896': { city: 'Garrett Park', neighborhoods: ['Garrett Park'] },
  '20897': { city: 'Suburb Maryland Fac', neighborhoods: [] },
  '20898': { city: 'Gaithersburg', neighborhoods: ['Gaithersburg'] },
  '20899': { city: 'Gaithersburg', neighborhoods: ['NIST'] },
  '20901': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'Four Corners'] },
  '20902': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'Wheaton'] },
  '20903': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'Colesville'] },
  '20904': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'Colesville'] },
  '20905': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'Burtonsville'] },
  '20906': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'Aspen Hill'] },
  '20907': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
  '20908': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
  '20910': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'Downtown Silver Spring'] },
  '20911': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
  '20912': { city: 'Takoma Park', neighborhoods: ['Takoma Park'] },
  '20913': { city: 'Takoma Park', neighborhoods: ['Takoma Park'] },
  '20914': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
  '20915': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
  '20916': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
  '20918': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
  '20993': { city: 'Silver Spring', neighborhoods: ['Silver Spring', 'FDA'] },
  '20997': { city: 'Silver Spring', neighborhoods: ['Silver Spring'] },
};

// All Maryland zipcodes start with these prefixes
const MARYLAND_ZIPCODE_PREFIXES = ['206', '207', '208', '209', '210', '211', '212', '214', '215', '216', '217', '218', '219'];

/**
 * Look up jurisdiction info for a zipcode
 * Uses database if available, falls back to hardcoded data
 */
export async function getJurisdiction(zipcode: string): Promise<JurisdictionInfo> {
  // Check cache first
  const cacheKey = cacheKeys.jurisdiction(zipcode);
  const cached = await cache.get<JurisdictionInfo>(cacheKey);
  if (cached) {
    return cached;
  }

  let result: JurisdictionInfo;

  // Try database lookup first
  if (isDatabaseConfigured()) {
    try {
      const dbResult = await db
        .select({
          zipcode: zipcodes.zipcode,
          city: zipcodes.city,
          state: zipcodes.state,
          neighborhoods: zipcodes.neighborhoods,
          jurisdictionId: jurisdictions.id,
          jurisdictionSlug: jurisdictions.slug,
          jurisdictionName: jurisdictions.name,
          jurisdictionType: jurisdictions.type,
        })
        .from(zipcodes)
        .leftJoin(jurisdictions, eq(zipcodes.jurisdictionId, jurisdictions.id))
        .where(eq(zipcodes.zipcode, zipcode))
        .limit(1);

      if (dbResult.length > 0) {
        const row = dbResult[0];
        result = {
          zipcode: row.zipcode,
          city: row.city,
          state: row.state,
          jurisdictionId: row.jurisdictionId,
          jurisdictionSlug: row.jurisdictionSlug || 'maryland_state',
          jurisdictionName: row.jurisdictionName || 'Maryland',
          jurisdictionType: row.jurisdictionType || 'state',
          neighborhoods: row.neighborhoods || [],
          supported: true,
        };

        // Cache for 24 hours
        await cache.set(cacheKey, result, cacheTTL.jurisdiction);
        return result;
      }
    } catch (error) {
      console.warn('[JurisdictionService] Database lookup failed:', error);
    }
  }

  // Fallback to hardcoded data
  result = getJurisdictionFallback(zipcode);

  // Cache for 24 hours
  await cache.set(cacheKey, result, cacheTTL.jurisdiction);
  return result;
}

/**
 * Fallback jurisdiction lookup using hardcoded data
 */
function getJurisdictionFallback(zipcode: string): JurisdictionInfo {
  // Check if it's a Montgomery County zipcode
  if (MONTGOMERY_COUNTY_ZIPCODES[zipcode]) {
    const mcData = MONTGOMERY_COUNTY_ZIPCODES[zipcode];
    return {
      zipcode,
      city: mcData.city,
      state: 'MD',
      jurisdictionId: null,
      jurisdictionSlug: 'montgomery_county',
      jurisdictionName: 'Montgomery County',
      jurisdictionType: 'county',
      neighborhoods: mcData.neighborhoods,
      supported: true,
    };
  }

  // Check if it's a Maryland zipcode
  const prefix = zipcode.substring(0, 3);
  if (MARYLAND_ZIPCODE_PREFIXES.includes(prefix)) {
    return {
      zipcode,
      city: null,
      state: 'MD',
      jurisdictionId: null,
      jurisdictionSlug: 'maryland_state',
      jurisdictionName: 'Maryland',
      jurisdictionType: 'state',
      neighborhoods: [],
      supported: true,
    };
  }

  // Non-Maryland zipcode
  return {
    zipcode,
    city: null,
    state: null,
    jurisdictionId: null,
    jurisdictionSlug: 'unsupported',
    jurisdictionName: 'Unsupported',
    jurisdictionType: 'unsupported',
    neighborhoods: [],
    supported: false,
  };
}

/**
 * Check if a zipcode is in Montgomery County
 */
export async function isMongoCountyZipcode(zipcode: string): Promise<boolean> {
  const jurisdiction = await getJurisdiction(zipcode);
  return jurisdiction.jurisdictionSlug === 'montgomery_county';
}

/**
 * Get all supported jurisdiction slugs
 */
export function getSupportedJurisdictions(): string[] {
  return ['montgomery_county', 'maryland_state'];
}

/**
 * Get all Montgomery County zipcodes (for fallback)
 */
export function getMongoCountyZipcodes(): string[] {
  return Object.keys(MONTGOMERY_COUNTY_ZIPCODES);
}
