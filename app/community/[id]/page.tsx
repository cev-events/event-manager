// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface PageParams {
  id: string;
}

export default function SingleCommunityPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const communityId = resolvedParams.id;
  const router = useRouter();

  const [community, setCommunity] = useState<any>(null);
  const [communityEvents, setCommunityEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/community');
    }
  };

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const supabase = createClient();
        
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityId);
        let commData = null;

        if (isUuid) {
          const res = await supabase.from("communities").select("*").eq("id", communityId).maybeSingle();
          commData = res.data;
        } else {
          const resSlug = await supabase.from("communities").select("*").eq("slug", communityId).maybeSingle();
          commData = resSlug.data;
          if (!commData) {
            const resName = await supabase.from("communities").select("*").ilike("name", communityId).maybeSingle();
            commData = resName.data;
          }
        }

        if (commData) {
          setCommunity(commData);

          const { data: evtsData } = await supabase
            .from("events")
            .select("*")
            .eq("community_id", commData.id)
            .eq("status", "live")
            .order("event_date", { ascending: true });

          if (evtsData) {
            setCommunityEvents(evtsData);
          }
        }
      } catch (err) {
        console.error("Error fetching community:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [communityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-[#94a3b8] flex items-center justify-center text-xs">
        Loading community details...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-[#08090d] text-[#f8fafc] flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-xs text-[#94a3b8]">Community not found.</p>
        <Link href="/community" className="brutalist-btn-primary px-4 py-2 rounded-lg text-xs">
          &larr; Back to Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-0 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header Card */}
        <div className="p-6 sm:p-10 rounded-2xl space-y-6 relative overflow-hidden text-center bg-white border border-neutral-200 shadow-sm">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r ${community.color || 'from-blue-600 to-cyan-400'} opacity-15 blur-[100px] -z-10`} />

          {community.logo_url ? (
            <img
              src={community.logo_url}
              alt={community.name}
              className="w-24 h-24 mx-auto rounded-3xl object-cover border-2 border-[#1e2436] shadow-2xl"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${community.color || 'from-blue-600 to-cyan-400'} flex items-center justify-center shadow-2xl`}>
              <span className="text-4xl font-bold text-white">
                {community.initials || community.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold text-white font-display">{community.name}</h1>
          <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed max-w-2xl mx-auto">
            {community.description || 'Campus student technical branch & community at CEV.'}
          </p>
        </div>

        {/* Events Grid */}
        <div className="space-y-6 pt-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Events by {community.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityEvents.length > 0 ? (
              communityEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.slug || event.id}`} className="group block h-full">
                  <div className="brutalist-card p-6 rounded-2xl h-full hover:border-[#6366f1] transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-[#6366f1] uppercase tracking-wider">
                          {event.category || 'Workshop'}
                        </span>
                        <span className="text-xs font-mono text-[#94a3b8] border border-[#1e2436] px-2 py-1 rounded">
                          {event.event_date}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-[#6366f1] transition-colors font-display">
                        {event.title}
                      </h3>
                      <p className="text-[#94a3b8] text-xs line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#1e2436] flex items-center justify-between text-xs font-semibold text-[#94a3b8]">
                      <span className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Event Assistant
                      </span>
                      <span className="text-[#6366f1] font-bold">&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-[#1e2436] rounded-2xl text-[#94a3b8] text-xs">
                No active live events hosted by {community.name} right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}