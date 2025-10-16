'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, ArrowRight } from 'lucide-react';

interface CaseItem {
  id: string;
  title: string;
  description: string;
  competencyId: string;
  competency: { name: string };
}

interface Competency {
  id: string;
  name: string;
  desc: string;
}

export default function MswTrackPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [casesByCompetency, setCasesByCompetency] = useState<Record<string, CaseItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cr = await fetch('/api/competencies', { credentials: 'include' });
        const comps: Competency[] = cr.ok ? await cr.json() : [];
        setCompetencies(comps);
        const entries: Array<[string, CaseItem[]]> = await Promise.all(
          comps.map(async (c) => {
            const r = await fetch(`/api/competencies/${c.id}/cases`, { credentials: 'include' });
            const items: CaseItem[] = r.ok ? await r.json() : [];
            // Exclude the BSW video case
            const filtered = items.filter((it) => it.id !== 'maria-aguilar-s1' && it.title !== 'Maria Aguilar — Session 1');
            return [c.id, filtered];
          })
        );
        setCasesByCompetency(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Users className="h-6 w-6 text-indigo-600" />
          <h1 className="text-3xl font-bold">MSW Track</h1>
          <Users className="h-6 w-6 text-violet-600" />
        </div>
        <p className="text-sm text-muted-foreground">Explore MSW experiences, including Parwin scenarios and other cases.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted rounded-t-lg" />
              <CardContent className="space-y-2 p-6">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        competencies.map((comp) => {
          const items = casesByCompetency[comp.id] || [];
          if (items.length === 0) return null;
          return (
            <div key={comp.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">{comp.name}</h2>
                <Badge variant="outline" className="ml-1">{items.length} case{items.length !== 1 ? 's' : ''}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((it) => (
                  <Card key={it.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{it.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">{comp.name}</div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{it.description}</p>
                      <div className="flex justify-end">
                        <Link href={`/student/competency/${comp.id}`}>
                          <Button size="sm">
                            Open <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}


