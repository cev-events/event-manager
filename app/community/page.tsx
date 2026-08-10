'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useCommunities } from '@/lib/hooks/useCommunities';

export default function CommunityPage() {
  const { communities, loading } = useCommunities();
  const [search, setSearch] = useState('');

  const filteredCommunities = communities.filter((c) =>
    c.slug !== 'college' &&
    c.name.toLowerCase() !== 'college' &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col pt-28 md:pt-32 pb-20 md:pb-12 font-sans">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-300 pb-6">
          <div className="flex-1 space-y-2">
            <span className="text-xs font-mono text-neutral-500 uppercase font-bold tracking-widest">
              001 / Technical Organizations
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0a0a0a] font-display leading-[0.95]">
              STUDENT COMMUNITIES
            </h1>
            <p className="text-neutral-600 text-xs sm:text-sm max-w-xl leading-relaxed font-sans">
              Explore student branches and technical organizations at CE Vadakara. Connect, learn, and collaborate across campus initiatives.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search communities..."
              className="w-full bg-white border border-neutral-200 text-[#0a0a0a] pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-neutral-400 placeholder-neutral-400 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs bg-white border border-neutral-200 rounded-2xl italic">
            Loading campus communities...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((comm, idx) => (
              <Link
                key={comm.id}
                href={`/community/${comm.slug || comm.id}`}
                className="p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-neutral-400 transition-all cursor-pointer group bg-white border border-neutral-200 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500">00{idx + 1}</span>
                    <span className="text-[10px] font-mono text-[#6366f1] bg-[#161a29] px-2 py-0.5 rounded border border-[#1e2436]">
                      {comm.slug || 'chapter'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    {comm.logo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={comm.logo_url}
                        alt={comm.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#1e2436]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#161a29] border border-[#1e2436] flex items-center justify-center text-white font-bold text-xl font-display">
                        {comm.initials || comm.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-extrabold text-white font-heading group-hover:text-[#6366f1] transition-colors">{comm.name}</h2>
                      <span className="text-[10px] font-mono text-[#94a3b8]">
                        CEV Chapter
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#94a3b8] line-clamp-3 leading-relaxed">
                    {comm.description || 'Student technical branch at CEV.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1e2436] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#94a3b8]">Organization</span>
                  <span className="text-xs font-bold text-[#6366f1] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Explore</span> &rarr;
                  </span>
                </div>
              </Link>
            ))}

            {filteredCommunities.length === 0 && (
              <div className="col-span-full py-16 text-center text-[#94a3b8] text-xs bg-[#0f121d] border border-[#1e2436] rounded-xl">
                No communities found matching &quot;{search}&quot;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}