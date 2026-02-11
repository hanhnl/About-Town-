import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  // For bill/legislation specific pages
  billId?: string;
  billTitle?: string;
  legislationType?: string;
}

const BASE_URL = 'https://abouttown.app';
const DEFAULT_TITLE = 'About Town - Track US State Legislation | Bills Made Simple';
const DEFAULT_DESCRIPTION = 'Track legislation across all 50 US states. About Town simplifies bills, explains their impact, and helps citizens engage with state government. Free, no jargon.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  billId,
  billTitle,
  legislationType,
}: SEOProps) {
  const fullTitle = title ? `${title} | About Town` : DEFAULT_TITLE;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update/create meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta
    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    if (keywords) {
      setMeta('keywords', keywords);
    }

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', fullImage, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:type', type, true);

    // Twitter
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', fullImage);
    setMeta('twitter:url', fullUrl);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Add JSON-LD for bill pages
    if (billId && billTitle) {
      const existingScript = document.querySelector('script[data-seo-bill]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-bill', 'true');
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Legislation',
        name: billTitle,
        identifier: billId,
        legislationType: legislationType || 'Bill',
        legislationJurisdiction: {
          '@type': 'AdministrativeArea',
          name: 'United States',
          addressCountry: 'US',
        },
        url: fullUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'About Town',
          url: BASE_URL,
        },
      });
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const billScript = document.querySelector('script[data-seo-bill]');
      if (billScript) {
        billScript.remove();
      }
    };
  }, [fullTitle, description, fullImage, fullUrl, type, noindex, keywords, billId, billTitle, legislationType]);

  return null;
}

// Pre-defined SEO configs for each page
export const SEO_PAGES = {
  home: {
    title: undefined, // Uses default
    description: 'Track legislation across all 50 US states. About Town simplifies bills, explains their impact, and helps citizens engage with state government. Free, no jargon.',
    keywords: 'state legislation, track bills, civic engagement, US state legislature, bill tracker, legislation tracker',
    url: '/',
  },
  dashboard: {
    title: 'Track Bills',
    description: 'View and track state bills in real-time across all 50 US states. Filter by topic, status, and location. Get plain-English summaries and understand how legislation affects your community.',
    keywords: 'track state bills, legislation tracker, bill status, state legislature, bill updates, California bills, New York bills, Texas bills',
    url: '/dashboard',
  },
  issues: {
    title: 'Browse Issues',
    description: 'Explore state legislation by topic. From housing to healthcare, education to environment - find bills that matter to you and your community.',
    keywords: 'state legislation topics, housing bills, healthcare legislation, education bills, environmental policy, state issues',
    url: '/issues',
  },
  representatives: {
    title: 'Find Your Representatives',
    description: 'Find your state representatives. See their voting records, sponsored bills, and contact information. Connect with your elected officials.',
    keywords: 'state representatives, find my representative, state senator, state assembly, elected officials, voting records',
    url: '/representatives',
  },
  about: {
    title: 'About Us',
    description: 'About Town is a free, non-partisan civic engagement platform. We make state legislation accessible to everyone across all 50 US states. By the people, for the people.',
    keywords: 'about About Town, civic engagement, government transparency, legislation access, civic tech, all 50 states',
    url: '/about',
  },
  signup: {
    title: 'Sign Up',
    description: 'Join About Town to track bills, get personalized updates, and engage with your community. Free forever, no paywall.',
    keywords: 'sign up About Town, create account, legislation alerts, bill notifications',
    url: '/signup',
  },
  profile: {
    title: 'My Profile',
    description: 'Manage your About Town profile, tracked bills, and notification preferences.',
    url: '/profile',
    noindex: true, // Don't index user profile pages
  },
} as const;
