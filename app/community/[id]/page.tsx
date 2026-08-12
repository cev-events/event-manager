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
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] font-sans pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-28 md:pt-32">
        <div className="max-w-[1280px] mx-auto">
          <button
            onClick={handleBackClick}
            className="group inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          <section className="relative min-h-[430px] sm:min-h-[500px] lg:min-h-[560px] bg-white rounded-[28px] overflow-hidden flex flex-col items-center justify-center text-center px-6 sm:px-12 lg:px-20 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-neutral-100 blur-[100px] opacity-70 pointer-events-none" />

            <div className="relative z-10 mb-10">
              {community.logo_url ? (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-white border border-neutral-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex items-center justify-center overflow-hidden">
                  <img
                    src={community.logo_url}
                    alt={community.name}
                    className="w-[72%] h-[72%] object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-[#0a0a0a] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {community.initials ||
                      community.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <h1 className="relative z-10 text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-[-0.055em] leading-[0.9] font-display text-[#0a0a0a]">
              {community.name}
            </h1>

            <p className="relative z-10 mt-8 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-neutral-500">
              {community.description ||
                "Campus student technical branch & community at CEV."}
            </p>
          </section>

          <section className="mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-neutral-300 pb-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] font-bold text-neutral-500">
                  Events by {community.name}
                </span>

                <h2 className="mt-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.05em] leading-none font-display text-[#0a0a0a]">
                  EVENTS
                </h2>
              </div>

              <span className="text-xs font-mono text-neutral-400 pb-1">
                {communityEvents.length}{" "}
                {communityEvents.length === 1 ? "EVENT" : "EVENTS"}
              </span>
            </div>

            <div className="mt-2">
              {communityEvents.length > 0 ? (
                communityEvents.map((event, index) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug || event.id}`}
                    className="group block border-b border-neutral-300 py-8 sm:py-10 lg:py-12 transition-all duration-500 hover:px-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                      <div className="md:col-span-1">
                        <span className="text-xs font-mono text-neutral-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366f1]">
                          {event.category || "Workshop"}
                        </span>
                      </div>

                      <div className="md:col-span-6">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.035em] leading-tight font-display text-[#0a0a0a] transition-colors duration-300 group-hover:text-neutral-500">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-neutral-500 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-3 flex md:flex-col md:items-end justify-between gap-5">
                        <span className="text-xs font-mono text-neutral-500">
                          {event.event_date}
                        </span>

                        <span className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 transition-all duration-300 group-hover:bg-[#0a0a0a] group-hover:border-[#0a0a0a] group-hover:text-white group-hover:translate-x-1">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 md:ml-[8.333%] flex items-center gap-2 text-[11px] font-mono text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Event Assistant
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-24 text-center border-b border-neutral-300 text-sm text-neutral-500">
                  No active live events hosted by {community.name} right now.
                </div>
              )}
            </div>
          </section>

          <div className="mt-20 pt-6 border-t border-neutral-300 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            <span>CE Vadakara</span>
            <span>Community / {community.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}