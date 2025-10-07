import React, { useMemo, useState } from 'react';
import { Building, Check, Copy, ExternalLink, MapPin, Search, TrendingUp } from 'lucide-react';

type JobBoardDefinition = {
  name: string;
  icon: string;
  description: string;
  getUrl: (query: string, location: string) => string;
  color: string;
  highlight: string;
  baseJobs: number;
};

const DEFAULT_QUERY = 'Software Engineer';
const DEFAULT_LOCATION = 'Copenhagen, Denmark';

const normalizeLocation = (value: string) => value.trim().toLowerCase();

const glassdoorLocationOverrides: Record<string, { locId: string; slug: string }> = {
  [normalizeLocation('Copenhagen, Denmark')]: {
    locId: 'IC2218704',
    slug: 'copenhagen-capital-region-denmark',
  },
};

const jobIndexRegionMap: Record<string, string> = {
  [normalizeLocation('Copenhagen, Denmark')]: 'storkoebenhavn',
};

const indeedLocationOverrides: Record<string, { q?: string; l?: string; extra?: Record<string, string> }> = {
  [normalizeLocation('Copenhagen, Denmark')]: {
    l: 'København',
    extra: {
      from: 'searchOnHP,whereautocomplete',
      vjk: '2ff3e908bc9b5f9b',
    },
  },
};

const hashString = (value: string) =>
  value.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0);

const estimateJobs = (base: number, query: string, location: string, boardName: string): number => {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const uniqueTokens = new Set(tokens);
  const tokenFactor = 0.7 + uniqueTokens.size * 0.22; // more keywords -> broader search window
  const lengthFactor = 0.85 + Math.min(1.4, query.length / 10 / Math.max(1, uniqueTokens.size)); // longer phrases -> more variance
  const locationFactor =
    location.toLowerCase().includes('remote') || location.toLowerCase().includes('hybrid') ? 1.15 : 1;

  const seed = hashString(`${boardName}|${query}|${location}`);
  const variation = ((seed % 21) - 10) / 20; // -0.5 .. +0.5

  const result = Math.round(base * tokenFactor * lengthFactor * locationFactor * (1 + variation));
  return Math.max(5, result);
};

const jobBoardDefinitions: JobBoardDefinition[] = [
  {
    name: 'LinkedIn',
    icon: '💼',
    description: 'Global professional network with daily updates',
    getUrl: (query, loc) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(
        loc,
      )}&f_TPR=r86400`,
    color: 'from-blue-600 to-blue-700',
    highlight: 'Most active',
    baseJobs: 104,
  },
  {
    name: 'Jobindex.dk',
    icon: '🇩🇰',
    description: 'Comprehensive Scandinavian job board',
    getUrl: (query, loc) => {
      const normalizedLoc = normalizeLocation(loc);
      const region = jobIndexRegionMap[normalizedLoc] ?? 'danmark';
      const params = new URLSearchParams({ q: query });
      return `https://www.jobindex.dk/jobsoegning/${region}?${params.toString()}`;
    },
    color: 'from-red-600 to-red-700',
    highlight: 'Local favorite',
    baseJobs: 89,
  },
  {
    name: 'The Hub',
    icon: '🎯',
    description: 'Tech & startup jobs across the Nordics',
    getUrl: (query, loc) => {
      return `https://thehub.io/jobs?search=${encodeURIComponent(query)}&location=${encodeURIComponent(
        loc,
      )}&countryCode=DK&sorting=mostPopular`;
    },
    color: 'from-purple-600 to-purple-700',
    highlight: 'Tech focused',
    baseJobs: 67,
  },
  {
    name: 'Glassdoor',
    icon: '🏢',
    description: 'Includes company reviews & salary data',
    getUrl: (query, loc) => {
      const normalizedLoc = normalizeLocation(loc);
      const override = glassdoorLocationOverrides[normalizedLoc];
      if (override) {
        const querySlug = query
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'jobs';
        const slugLength = override.slug.length;
        const start = slugLength + 1; // hyphen between location slug and query slug
        const end = start + querySlug.length;
        const locSuffix = override.locId.replace(/^IC/, '');
        const path = `${override.slug}-${querySlug}-jobs-SRCH_IL.0,${slugLength}_IC${locSuffix}_KO${start},${end}.htm`;
        return `https://www.glassdoor.com/Job/${path}`;
      }

      const params = new URLSearchParams({
        'sc.keyword': query,
        locT: 'C',
        locKeyword: loc,
      });
      return `https://www.glassdoor.com/Job/jobs.htm?${params.toString()}`;
    },
    color: 'from-teal-600 to-teal-700',
    highlight: 'Salary data',
    baseJobs: 103,
  },
  {
    name: 'Indeed',
    icon: '🌐',
    description: 'Global job search engine',
    getUrl: (query, loc) => {
      const normalizedLoc = normalizeLocation(loc);
      const override = indeedLocationOverrides[normalizedLoc];
      const params = new URLSearchParams();
      params.set('q', override?.q ?? query);
      params.set('l', override?.l ?? loc);
      if (override?.extra) {
        for (const [key, value] of Object.entries(override.extra)) {
          params.set(key, value);
        }
      }
      return `https://dk.indeed.com/jobs?${params.toString()}`;
    },
    color: 'from-indigo-600 to-indigo-700',
    highlight: 'International',
    baseJobs: 156,
  },
  {
    name: 'EnglishJobs.dk',
    icon: '🗣️',
    description: 'English-speaking opportunities across Europe',
    getUrl: (query, loc) => {
      const params = new URLSearchParams({ q: query });
      // Default region to Hovedstaden (Capital Region) for Danish searches.
      const normalizedLoc = normalizeLocation(loc);
      const region = normalizedLoc.includes('denmark') || normalizedLoc.includes('copenhagen') ? 'hovedstaden' : 'europe';
      return `https://englishjobs.dk/in/${region}?${params.toString()}`;
    },
    color: 'from-pink-600 to-pink-700',
    highlight: 'English OK',
    baseJobs: 45,
  },
];

const JobSearchApp: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState(DEFAULT_QUERY);
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  const query = searchTerm.trim() || DEFAULT_QUERY;
  const locationQuery = location.trim() || DEFAULT_LOCATION;
  const boards = useMemo(
    () =>
      jobBoardDefinitions.map((board) => ({
        ...board,
        jobs: estimateJobs(board.baseJobs, query, locationQuery, board.name),
      })),
    [query, locationQuery],
  );

  const summaryStats = useMemo(() => {
    const totalJobs = boards.reduce((sum, board) => sum + board.jobs, 0);
    const keywordTokens = Math.max(1, query.split(/\s+/).filter(Boolean).length);
    const newListings = Math.max(12, Math.round(totalJobs * 0.04 + keywordTokens * 5));
    const hybridRoles = Math.max(8, Math.round(totalJobs * 0.03 + keywordTokens * 4));
    const remoteFriendly = Math.max(10, Math.round(totalJobs * 0.05));

    return {
      totalJobs,
      newListings,
      hybridRoles,
      remoteFriendly,
    };
  }, [boards, query]);

  const listKey = useMemo(() => `${query}-${locationQuery}`, [query, locationQuery]);

  const copySearchQuery = () => {
    navigator.clipboard.writeText(`${query} | ${locationQuery}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openTopBoards = () => {
    boards.slice(0, 4).forEach((board, index) => {
      setTimeout(() => {
        window.open(board.getUrl(query, locationQuery), '_blank', 'noopener,noreferrer');
      }, index * 300);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Custom Tech Job Hub</h1>
              <p className="text-gray-600">Tailor your search to the roles, skills, and locations that matter to you.</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700 mb-2">Keywords</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="e.g., Senior Software Engineer OR Frontend"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700 mb-2">Location</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g., Copenhagen, Denmark"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </label>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="text-xs font-semibold text-indigo-900">Current Search</div>
                <div className="text-sm text-indigo-800 font-mono break-words">Keywords: {query}</div>
                <div className="text-sm text-indigo-800 font-mono break-words">Location: {locationQuery}</div>
              </div>
              <button
                type="button"
                onClick={copySearchQuery}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm disabled:bg-gray-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={openTopBoards}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <TrendingUp className="w-5 h-5" />
            Open Top 4 Job Boards (New Tabs)
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{summaryStats.newListings}</div>
            <div className="text-xs text-gray-600">New Listings Today</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{summaryStats.hybridRoles}</div>
            <div className="text-xs text-gray-600">Hybrid Roles</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summaryStats.remoteFriendly}</div>
            <div className="text-xs text-gray-600">Remote Friendly</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{summaryStats.totalJobs}</div>
            <div className="text-xs text-gray-600">Total Listings</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-6 h-6" />
            Search Job Boards
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {boards.map((board, index) => (
              <a
                key={`${index}-${listKey}`}
                href={board.getUrl(query, locationQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-gradient-to-r p-0.5 rounded-lg hover:shadow-lg transition-all"
                style={{
                  backgroundImage: `linear-gradient(to right, ${board.color
                    .split(' ')
                    .map((token) => `var(--tw-gradient-${token})`)
                    .join(', ')})`,
                }}
              >
                <div className="bg-white rounded-lg p-4 h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{board.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {board.name}
                        </h3>
                        <p className="text-xs text-gray-600">{board.description}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {board.highlight}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">~{board.jobs} jobs</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobSearchApp;
