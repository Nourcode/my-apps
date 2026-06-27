"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import catalog, { type App } from "../catalog";
import { Suspense } from "react";

interface ShareData {
  apps: string[];
  customUrls: Record<string, string>;
}

function ShareView() {
  const searchParams = useSearchParams();
  const [myApps, setMyApps] = useState<App[]>([]);
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) { setError(true); return; }
    try {
      const parsed: ShareData = JSON.parse(atob(data));
      const apps = parsed.apps
        .map((name) => catalog.find((a) => a.name === name))
        .filter((a): a is App => !!a);
      setMyApps(apps);
      setCustomUrls(parsed.customUrls ?? {});
    } catch {
      setError(true);
    }
  }, [searchParams]);

  const availableTags = Array.from(new Set(myApps.flatMap((a) => a.tags))).sort();

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f6f3] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Invalid or expired share link.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f3] px-10 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Helio</h1>
        <span className="text-xs text-gray-400 bg-white border border-black/[0.08] px-3 py-1.5 rounded-full">
          Read-only view
        </span>
      </div>

      <div className="flex flex-col gap-10">
        {availableTags.map((tag) => (
          <section key={tag}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-gray-400">
              {tag}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {myApps.filter((a) => a.tags.includes(tag)).map((app) => {
                const url = customUrls[app.name] ?? app.url;
                return (
                  <a
                    key={app.name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={app.description}
                    className="flex flex-col items-center gap-3 bg-white border border-black/[0.08] rounded-2xl p-4 hover:bg-[#eeece8] hover:scale-105 transition-all duration-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl" />
                    <span className="text-xs font-medium text-center leading-tight text-gray-600">
                      {app.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f6f3]" />}>
      <ShareView />
    </Suspense>
  );
}
