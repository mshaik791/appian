'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, MessageSquare, Activity } from 'lucide-react';

export default function MariaCaseDetailPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header / Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative p-6 md:p-8 flex items-start gap-5">
          <Avatar className="h-16 w-16 ring-4 ring-white/20">
            <AvatarImage src="/images/maria_aguilar.jpg" alt="Maria Aguilar" />
            <AvatarFallback>MA</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">About Your Client</h2>
                <p className="text-sm md:text-base text-white/90 mt-1 max-w-4xl">
                  Maria Aguilar (she/her) is a 33-year-old Latinx mother of Mateo (9). She is bilingual (Spanish/English, prefers Spanish), undocumented, and recently experienced the detention of her spouse (José) by ICE. She works variable hours as a residential cleaner (cash; no benefits) and lives with Mateo in a rent‑burdened one-bedroom LA apartment. Maria is deeply committed to Mateo, has strong work ethic and community ties, and shows resilience under pressure.
                </p>
              </div>
              <Button onClick={() => router.push('/bsw/maria-aguilar/session-1?caseId=maria-aguilar-s1')} className="bg-white text-indigo-700 hover:bg-white/90 shadow">
                Start Experience
              </Button>
            </div>
            {/* Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 text-xs">
              <div className="flex flex-col"><span className="text-white/80">Age</span><Badge className="bg-white/15 text-white border-white/20">33</Badge></div>
              <div className="flex flex-col"><span className="text-white/80">Pronouns</span><Badge className="bg-white/15 text-white border-white/20">She/Her</Badge></div>
              <div className="flex flex-col"><span className="text-white/80">Ethnicity</span><Badge className="bg-white/15 text-white border-white/20">Latinx</Badge></div>
              <div className="flex flex-col"><span className="text-white/80">Role</span><Badge className="bg-white/15 text-white border-white/20">Mother of Mateo (9)</Badge></div>
              <div className="flex flex-col"><span className="text-white/80">Language</span><Badge className="bg-white/15 text-white border-white/20">Spanish preferred</Badge></div>
              <div className="flex flex-col"><span className="text-white/80">Admission Date</span><Badge className="bg-white/15 text-white border-white/20">Oct 13, 2025</Badge></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="">
        <TabsList className="rounded-lg bg-muted/60 p-1">
          <TabsTrigger value="overview" className="rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="objectives" className="rounded-md">Objectives</TabsTrigger>
          <TabsTrigger value="access" className="rounded-md">How to Access</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                You will support Maria, who feels isolated and is seeking counseling to navigate discrimination, family separation, and loss of community. Your task is to engage, assess strengths and needs, and co‑create immediate, feasible next steps while honoring cultural and legal sensitivities.
              </p>

              <div>
                <h3 className="font-semibold mb-2">Key Tasks</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5" /><span><span className="font-semibold">OBSERVE:</span> Note verbal/non‑verbal cues (affect, pacing, avoidance, scanning, hand wringing) without judgment.</span></li>
                  <li className="flex items-start gap-2"><MessageSquare className="h-4 w-4 mt-0.5" /><span><span className="font-semibold">COMMUNICATE:</span> Use open questions, reflections, validations; explain confidentiality and its limits clearly. Offer choices.</span></li>
                  <li className="flex items-start gap-2"><Activity className="h-4 w-4 mt-0.5" /><span><span className="font-semibold">INTERVENE:</span> Apply brief, evidence‑based strategies (psychoeducation on trauma reactions, sleep routine cueing, school re‑entry plan, consented referral info).</span></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Strategies for Success</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Listen for emotions tied to José’s detention and Mateo’s fear; reflect and normalize.</li>
                  <li>Validate belonging challenges and safety concerns; avoid legal advice—share vetted resources.</li>
                  <li>Invite hopes/strengths (neighbor, church) and co‑author one small plan for this week.</li>
                  <li>Summarize in clear, plain language; check understanding and consent.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objectives">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-1">Learning Objectives</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Establish rapport and explain confidentiality/limits in plain language.</li>
                  <li>Identify at least three strengths and three needs in Maria’s ecological context.</li>
                  <li>Co‑design one short, feasible, trauma‑informed plan (sleep routine, school re‑entry, support contact).</li>
                  <li>Distinguish information‑sharing from legal advice and document properly.</li>
                  <li>Write a concise, neutral progress note with next steps and informed consent captured.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">CSWE Competencies (focus)</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ethical & Professional Behavior (confidentiality, boundaries, documentation)</li>
                  <li>Engage Diversity & DEI (language preference, assumptions check)</li>
                  <li>Advance Human Rights & Social Justice (rights/resources; empowerment)</li>
                  <li>Engagement, Assessment, Intervention, Evaluation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Student Prompts</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>“What feels most urgent today, so we can decide together where to start?”</li>
                  <li>“How is Mateo sleeping and eating this week? What helps even a little?”</li>
                  <li>“Would it be okay if we talk about school options that feel safe for you both?”</li>
                  <li>“Who are the people or places that feel supportive right now?”</li>
                  <li>“I can share information about community resources. Would you like that?”</li>
                  <li>“How do you prefer we handle language—Spanish, English, or both?”</li>
                  <li>“Can I explain confidentiality and its limits and check your questions?”</li>
                  <li>“What would a good next 3–5 days look like for you and Mateo?”</li>
                  <li>“How would you like me to help with the school—if at all?”</li>
                  <li>“On a scale of 0–10, how confident do you feel about our plan today?”</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Plan & Disposition (for reference)</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Evaluation: brief needs screen (food/rent, school coordination, legal aid info—no advice).</li>
                  <li>Safety: door/phone plan; 2–3 coping skills (breathing, routine, neighbor check‑in).</li>
                  <li>Collaborative care (with consent): school counselor re‑entry, vetted immigrant‑rights orgs, community supports.</li>
                  <li>Disposition: safe to remain in community with supports and a written mini‑plan.</li>
                  <li>Follow‑up: 1‑week check‑in; homework—bedtime routine, two calming activities, decide about school contact.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card className="shadow">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              You will watch a short video and respond to three reflective prompts. Your responses are saved locally for this demo.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer actions */}
      <div className="flex items-center justify-between py-6">
        <Link href="/bsw">
          <Button variant="outline">Back to Cases</Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button variant="outline">Export Note (PDF)</Button>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white">Start Simulation</Button>
        </div>
      </div>
    </div>
  );
}


