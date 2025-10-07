import React, { useEffect, useState } from 'react';
import { Search, MapPin, Building, ExternalLink, Copy, Check, TrendingUp } from 'lucide-react';

type JobBoard = {
  name: string;
  icon: string;
  description: string;
  getUrl: (query: string, location: string) => string;
  color: string;
  highlight: string;
  jobs: number;
};

type Company = {
  name: string;
  url: string;
  icon: string;
  location: string;
};

const JobSearchApp: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('Software Engineer');
  const [location, setLocation] = useState('Copenhagen, Denmark');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [searchTerm, location]);

  const getSearchQuery = () => searchTerm.trim() || 'Software Engineer';
  const getLocationQuery = () => location.trim() || 'Copenhagen, Denmark';

  const jobBoards: JobBoard[] = [
    {
      name: 'LinkedIn',
      icon: '💼',
      description: 'Global professional network with daily updates',
      getUrl: (query: string, loc: string) =>
        `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(loc)}&f_TPR=r86400`,
      color: 'from-blue-600 to-blue-700',
      highlight: 'Most active',
      jobs: 104
    },
    {
      name: 'Jobindex.dk',
      icon: '🇩🇰',
      description: 'Comprehensive Scandinavian job board',
      getUrl: (query: string, loc: string) => {
        const combined = `${query} ${loc}`.trim();
        return `https://www.jobindex.dk/jobsoegning?q=${encodeURIComponent(combined)}`;
      },
      color: 'from-red-600 to-red-700',
      highlight: 'Local favorite',
      jobs: 89
    },
    {
      name: 'The Hub',
      icon: '🎯',
      description: 'Tech & startup jobs across the Nordics',
      getUrl: (query: string, loc: string) => {
        const combined = `${query} ${loc}`.trim();
        return `https://thehub.io/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(loc)}&keywords=${encodeURIComponent(combined)}`;
      },
      color: 'from-purple-600 to-purple-700',
      highlight: 'Tech focused',
      jobs: 67
    },
    {
      name: 'DevJobsScanner',
      icon: '🔍',
      description: 'Aggregates 15+ job boards worldwide',
      getUrl: (query: string, loc: string) =>
        `https://www.devjobsscanner.com/jobs/?search=${encodeURIComponent(query)}&location=${encodeURIComponent(loc)}`,
      color: 'from-green-600 to-green-700',
      highlight: 'Aggregator',
      jobs: 1643
    },
    {
      name: 'Glassdoor',
      icon: '🏢',
      description: 'Includes company reviews & salary data',
      getUrl: (query: string, loc: string) => {
        const combined = `${query} ${loc}`.trim();
        return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(query)}&locT=C&locId=&locKeyword=${encodeURIComponent(loc)}&keyword=${encodeURIComponent(combined)}`;
      },
      color: 'from-teal-600 to-teal-700',
      highlight: 'Salary data',
      jobs: 103
    },
    {
      name: 'Indeed',
      icon: '🌐',
      description: 'Global job search engine',
      getUrl: (query: string, loc: string) =>
        `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(loc)}`,
      color: 'from-indigo-600 to-indigo-700',
      highlight: 'International',
      jobs: 156
    },
    {
      name: 'ITJobBank',
      icon: '💻',
      description: 'IT-focused listings in Northern Europe',
      getUrl: (query: string, loc: string) => {
        const combined = `${query} ${loc}`.trim();
        return `https://www.it-jobbank.dk/jobsearch/results?Keywords=${encodeURIComponent(combined)}`;
      },
      color: 'from-orange-600 to-orange-700',
      highlight: 'IT specialist',
      jobs: 78
    },
    {
      name: 'EnglishJobs.dk',
      icon: '🗣️',
      description: 'English-speaking opportunities across Europe',
      getUrl: (query: string, loc: string) => {
        const combined = `${query} ${loc}`.trim();
        return `https://englishjobs.eu/jobs?query=${encodeURIComponent(combined)}`;
      },
      color: 'from-pink-600 to-pink-700',
      highlight: 'English OK',
      jobs: 45
    },
  ];

  const topCompanies: Company[] = [
    { name: 'Novo Nordisk', url: 'https://www.novonordisk.com/careers/find-a-job.html', icon: '💉', location: 'Bagsværd' },
    { name: 'Maersk', url: 'https://careers.maersk.com/search-jobs', icon: '🚢', location: 'Copenhagen' },
    { name: 'Danske Bank', url: 'https://danskebank.com/careers', icon: '🏦', location: 'Copenhagen' },
    { name: 'Saxo Bank', url: 'https://www.home.saxo/careers', icon: '💹', location: 'Copenhagen' },
    { name: 'Vestas', url: 'https://careers.vestas.com/search', icon: '🌬️', location: 'Aarhus/Copenhagen' },
    { name: 'Ørsted', url: 'https://orsted.com/careers', icon: '⚡', location: 'Fredericia' },
    { name: 'Siteimprove', url: 'https://siteimprove.com/careers/', icon: '🔧', location: 'Copenhagen' },
    { name: 'Lunar', url: 'https://lunar.app/careers', icon: '🌙', location: 'Copenhagen' },
    { name: 'Trustpilot', url: 'https://jobs.trustpilot.com/', icon: '⭐', location: 'Copenhagen' },
    { name: 'Unity', url: 'https://careers.unity.com/', icon: '🎮', location: 'Copenhagen' },
    { name: 'Zendesk', url: 'https://jobs.zendesk.com/us/en', icon: '💬', location: 'Copenhagen' },
    { name: 'SimCorp', url: 'https://www.simcorp.com/careers', icon: '📊', location: 'Copenhagen' },
  ];

  const copySearchQuery = () => {
    navigator.clipboard.writeText(`${getSearchQuery()} | ${getLocationQuery()}`);
    setCopiedIndex('query');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const openAllBoards = () => {
    const query = getSearchQuery();
    const locationQuery = getLocationQuery();
    jobBoards.slice(0, 4).forEach((board, idx) => {
      setTimeout(() => {
        window.open(board.getUrl(query, locationQuery), '_blank');
      }, idx * 300);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Custom Tech Job Hub
              </h1>
              <p className="text-gray-600">
                Tailor your search to the roles, skills, and locations that matter to you.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-green-700">2,000+</div>
              <div className="text-xs text-green-600">Live jobs</div>
            </div>
          </div>

          {/* Search Controls */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., Senior Software Engineer OR Frontend"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Copenhagen, Denmark"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Query Display */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-xs font-semibold text-indigo-900 mb-1">Current Search</div>
                <div className="space-y-1 text-sm text-indigo-800 font-mono break-words">
                  <div>Keywords: {getSearchQuery()}</div>
                  <div>Location: {getLocationQuery()}</div>
                </div>
              </div>
              <button
                onClick={copySearchQuery}
                disabled={!getSearchQuery()}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm disabled:bg-gray-300 transition-colors"
              >
                {copiedIndex === 'query' ? (
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

          {/* Quick Action */}
          <button
            onClick={openAllBoards}
            disabled={!getSearchQuery()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl"
          >
            <TrendingUp className="w-5 h-5" />
            Open Top 4 Job Boards (New Tabs)
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">104</div>
            <div className="text-xs text-gray-600">New Listings Today</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">68</div>
            <div className="text-xs text-gray-600">Hybrid Roles</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">127</div>
            <div className="text-xs text-gray-600">Remote Friendly</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">1,643</div>
            <div className="text-xs text-gray-600">Total Listings</div>
          </div>
        </div>

        {/* Job Boards */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-6 h-6" />
            Search Job Boards
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {jobBoards.map((board, idx) => {
              const searchQuery = getSearchQuery();
              const locationQuery = getLocationQuery();
              return (
                <a
                  key={`${idx}-${refreshKey}`}
                  href={board.getUrl(searchQuery, locationQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-r p-0.5 rounded-lg hover:shadow-lg transition-all"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${board.color.split(' ').map(c => `var(--tw-gradient-${c})`).join(', ')})`
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
                      <span className="text-sm font-semibold text-gray-700">
                        ~{board.jobs} jobs
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Company Career Pages */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-6 h-6" />
            Top Companies Hiring
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {topCompanies.map((company, idx) => (
              <a
                key={idx}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
              >
                <span className="text-2xl">{company.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {company.name}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {company.location}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Set up keyword alerts on major job boards to get notified instantly.</li>
            <li>• Track company career pages for roles that may not hit aggregators.</li>
            <li>• Refresh your resume and portfolio to match the skills in your search.</li>
            <li>• Benchmark compensation using Glassdoor, Levels.fyi, or local salary surveys.</li>
            <li>• Join local meetups and online communities related to your focus area.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobSearchApp;
