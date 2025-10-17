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
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-red-800 via-red-700 to-amber-600 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative p-6 md:p-8 flex items-start gap-5">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Case Scenario: Maria Aguilar</h2>
                <p className="text-sm md:text-base text-white/90 mt-1 max-w-4xl">
                  Maria Aguilar (she/her) is a 33-year-old Latinx mother of Mateo (9). She is bilingual (Spanish/English, prefers Spanish), undocumented, and recently experienced the detention of her spouse (José) by ICE. She works variable hours as a residential cleaner (cash; no benefits) and lives with Mateo in a rent‑burdened one-bedroom LA apartment. Maria is deeply committed to Mateo, has strong work ethic and community ties, and shows resilience under pressure.
                </p>
              </div>
              {/* Right-side Maria image placeholder */}
              <div className="hidden md:block">
                <img src="/Maria.jpg" alt="Maria" className="h-24 w-24 rounded-xl object-cover ring-2 ring-white/40 shadow" />
              </div>
            </div>
            {/* Removed demographic chips per request */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="instructions" className="">
        <TabsList className="rounded-lg bg-muted/60 p-1 flex flex-wrap gap-1">
          <TabsTrigger value="instructions" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Before You Begin</TabsTrigger>
          <TabsTrigger value="overview" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Overview</TabsTrigger>
          <TabsTrigger value="background" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Case Brief</TabsTrigger>
          
          <TabsTrigger value="rubric" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Rubric</TabsTrigger>
          <TabsTrigger value="slo" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Student Learning Objectives</TabsTrigger>
          <TabsTrigger value="competencies" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Competencies</TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Feedback</TabsTrigger>
          <TabsTrigger value="support" className="rounded-md transition-colors hover:bg-gradient-to-r hover:from-red-900 hover:to-red-700 hover:text-white">Student Support</TabsTrigger>
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
                  <li>Listen for emotions tied to José's detention and Mateo's fear; reflect and normalize.</li>
                  <li>Validate belonging challenges and safety concerns; avoid legal advice—share vetted resources.</li>
                  <li>Invite hopes/strengths (neighbor, church) and co‑author one small plan for this week.</li>
                  <li>Summarize in clear, plain language; check understanding and consent.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="background">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Client Background</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Maria Aguilar (she/her) is a 33-year-old Latinx mother of Mateo (9). She is bilingual (Spanish/English, prefers Spanish), undocumented, and recently experienced the detention of her spouse (José) by ICE. She works variable hours as a residential cleaner (cash; no benefits) and lives with Mateo in a rent‑burdened one-bedroom LA apartment.
                  </p>
                  <p>
                    Maria is deeply committed to Mateo, has strong work ethic and community ties, and shows resilience under pressure. She has been experiencing increased anxiety since José's detention, particularly around Mateo's safety and their housing stability.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Current Challenges</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Family separation due to José's ICE detention</li>
                  <li>Financial stress from single income and rent burden</li>
                  <li>Mateo's behavioral changes and school attendance issues</li>
                  <li>Fear of deportation and family safety concerns</li>
                  <li>Limited access to healthcare and social services</li>
                  <li>Social isolation and loss of community support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Strengths & Resources</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Strong maternal bond and commitment to Mateo</li>
                  <li>Work ethic and determination to provide for family</li>
                  <li>Bilingual abilities and cultural knowledge</li>
                  <li>Connection to local church community</li>
                  <li>Neighbor support network</li>
                  <li>Resilience and adaptability under stress</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Cultural Considerations</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Spanish language preference for emotional expression</li>
                  <li>Family-centered decision making</li>
                  <li>Religious faith as source of strength</li>
                  <li>Community-based support systems</li>
                  <li>Distrust of formal institutions due to immigration status</li>
                  <li>Cultural stigma around mental health services</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        

        <TabsContent value="instructions">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Simulation Experience</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You will watch a short video featuring Maria and respond to three reflective prompts using voice recording. Your responses are captured via speech-to-text technology and saved for evaluation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Technical Requirements</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Modern web browser with microphone access</li>
                  <li>Stable internet connection for video streaming</li>
                  <li>Quiet environment for voice recording</li>
                  <li>Allow microphone permissions when prompted</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Instructions</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Watch the video carefully - it will auto-advance when complete</li>
                  <li>Answer each question by clicking "Start Recording" and speaking your response</li>
                  <li>Review your transcript and re-record if needed</li>
                  <li>Submit all responses for evaluation</li>
                </ol>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Note</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your responses are saved locally for this demo. In a production environment, they would be securely transmitted to your instructor for evaluation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubric">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
              <p>
                This scenario is evaluated across four dimensions: Empathy & Engagement, Cultural Responsiveness, Ethics & Professionalism, and Assessment & Planning. Each is scored 1.0–5.0 with 0.5 increments. Overall reflects a weighted average.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Empathy & Engagement (30%): active listening, reflections, validation.</li>
                <li>Cultural Responsiveness (25%): language preferences, honoring cultural context.</li>
                <li>Ethics & Professionalism (15%): confidentiality limits, scope of role.</li>
                <li>Assessment & Planning (30%): identifying needs/strengths and co‑creating next steps.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slo">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">Student Learning Objectives</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Establish rapport and explain confidentiality/limits in plain language.</li>
                <li>Identify at least three strengths and three needs in Maria's ecological context.</li>
                <li>Co‑design one short, feasible, trauma‑informed plan (sleep routine, school re‑entry, support contact).</li>
                <li>Distinguish information‑sharing from legal advice and document properly.</li>
                <li>Write a concise, neutral progress note with next steps and informed consent captured.</li>
              </ul>

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
                  <li>"What feels most urgent today, so we can decide together where to start?"</li>
                  <li>"How is Mateo sleeping and eating this week? What helps even a little?"</li>
                  <li>"Would it be okay if we talk about school options that feel safe for you both?"</li>
                  <li>"Who are the people or places that feel supportive right now?"</li>
                  <li>"I can share information about community resources. Would you like that?"</li>
                  <li>"How do you prefer we handle language—Spanish, English, or both?"</li>
                  <li>"Can I explain confidentiality and its limits and check your questions?"</li>
                  <li>"What would a good next 3–5 days look like for you and Mateo?"</li>
                  <li>"How would you like me to help with the school—if at all?"</li>
                  <li>"On a scale of 0–10, how confident do you feel about our plan today?"</li>
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

        <TabsContent value="competencies">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">CSWE Competencies (focus)</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ethical & Professional Behavior</li>
                <li>Engage Diversity & Difference</li>
                <li>Advance Human Rights & Social Justice</li>
                <li>Engagement, Assessment, Intervention, Evaluation</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">Feedback</h4>
              <p>
                After submitting your responses, you will receive an AI‑generated evaluation summary along with competency scores and suggestions for improvement. Faculty may also provide additional feedback.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>View your results on the Results page after grading completes.</li>
                <li>Use suggestions to plan your next practice attempt.</li>
                <li>Reach out to your instructor if you have questions about your evaluation.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card className="shadow">
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
              <p>If you encounter challenges, you can:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Review the Instructions tab for step‑by‑step guidance</li>
                <li>Use headphones and a quiet space for recording clarity</li>
                <li>Contact your instructor for accommodations or accessibility support</li>
              </ul>
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
          <Button onClick={() => router.push('/bsw/maria-aguilar/session-1?caseId=bsw-maria-aguilar-s1')} className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-800 hover:via-red-700 hover:to-amber-700 text-white shadow px-6 py-3 text-base md:text-lg">
            Launch Scenario
          </Button>
        </div>
      </div>
    </div>
  );
}


