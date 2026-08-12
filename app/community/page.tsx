// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import { useCommunities } from '@/lib/hooks/useCommunities';

export default function CommunityPage() {
  const { communities, loading } = useCommunities();
  const [search, setSearch] = useState('');

  const filteredCommunities = communities.filter(
    (c) =>
      c.slug !== 'college' &&
      c.name.toLowerCase() !== 'college' &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '')
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col pt-28 md:pt-32 pb-20 md:pb-12 font-sans">
      <main className="flex-1 w-[96%] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-300 pb-6">
          <div className="flex-1 space-y-2">
            <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">
              Technical Organizations
            </span>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0a0a0a] font-display leading-[0.9]">
              COMMUNITIES
            </h1>

            <p className="text-neutral-600 text-xs sm:text-sm max-w-xl leading-relaxed font-sans">
              Explore student branches and technical organizations at CE
              Vadakara. Connect, learn, and collaborate across campus
              initiatives.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              placeholder="Search communities..."
              className="w-full bg-white border border-neutral-200 text-[#0a0a0a] pl-9 pr-4 py-3 rounded-full text-xs focus:outline-none focus:border-neutral-400 placeholder-neutral-400 shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center text-neutral-500 text-xs bg-white rounded-[24px]">
            Loading campus communities...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {filteredCommunities.map((comm, idx) => (
              <Link
                key={comm.id}
                href={`/community/${comm.slug || comm.id}`}
                className="group relative min-h-[430px] overflow-hidden rounded-[24px] bg-white border border-neutral-100 p-6 sm:p-7 lg:p-8 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400">
                    {String(idx + 1).padStart(3, '0')}
                  </span>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 border border-neutral-200 px-2.5 py-1 rounded-full">
                    {comm.slug || 'chapter'}
                  </span>
                </div>

                <div className="space-y-7">
                  <div className="flex items-center justify-between">
                    {comm.logo_url ? (
                      <img
                        src={comm.logo_url}
                        alt={comm.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-neutral-200 bg-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#0a0a0a] flex items-center justify-center text-white font-bold text-2xl font-display transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                        {comm.initials ||
                          comm.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <span className="w-11 h-11 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center transition-all duration-500 group-hover:bg-neutral-200 group-hover:text-black group-hover:rotate-[-45deg]">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                      CEV Chapter
                    </span>

                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#0a0a0a] font-display leading-[0.95] tracking-[-0.035em] group-hover:translate-x-1 transition-transform duration-500">
                      {comm.name}
                    </h2>
                  </div>

                  <p className="text-sm text-neutral-500 leading-relaxed line-clamp-4 max-w-md">
                    {comm.description ||
                      'Student technical branch at CEV.'}
                  </p>
                </div>

                <div className="pt-5 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    Organization
                  </span>

                  <span className="text-xs font-bold text-[#0a0a0a] flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-500">
                    Explore
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}

            {filteredCommunities.length === 0 && (
              <div className="col-span-full min-h-[400px] flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-neutral-200">
                <p className="text-sm font-bold text-[#0a0a0a]">
                  No communities found
                </p>

                <p className="text-xs text-neutral-500 mt-1">
                  No results matching &quot;{search}&quot;
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}