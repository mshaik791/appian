"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Minimal UI notifications to avoid extra deps; replace with your toast lib if desired

// Helper function to collect transcript from DOM
function collectTranscriptFromDOM(): string | null {
  // Try multiple selectors to find transcript container
  const selectors = [
    '[data-transcript-root]',
    '[id*="transcript"]',
    '[class*="transcript"]',
    '[class*="messages"]',
    '[class*="chat"]',
    '[class*="MessageHistory"]'
  ];

  let container: Element | null = null;
  for (const selector of selectors) {
    container = document.querySelector(selector);
    if (container) break;
  }

  if (!container) {
    console.warn('No transcript container found');
    return null;
  }

  // Preferred: use our explicit message nodes with data-role
  let messages: Element[] = Array.from(container.querySelectorAll('[data-role]'));

  // Fallback: try some general message-like selectors
  if (messages.length === 0) {
    const messageSelectors = [
      'div[class*="message"]',
      'div[class*="Message"]',
      'div[class*="chat"]',
      'div[class*="bubble"]',
      'div[class*="text"]'
    ];
    for (const selector of messageSelectors) {
      const found = Array.from(container.querySelectorAll(selector));
      if (found.length > 0) {
        messages = found;
        break;
      }
    }
  }

  // Final fallback: any text elements under the container
  if (messages.length === 0) {
    const textElements = Array.from(container.querySelectorAll('p, span, div'));
    messages = textElements.filter(el => el.textContent?.trim());
  }

  if (messages.length === 0) {
    console.warn('No message elements found in transcript container');
    return null;
  }

  // Extract and normalize messages
  const normalizedMessages: string[] = [];
  
  for (let i = 0; i < messages.length; i++) {
    const element = messages[i] as HTMLElement;

    // Determine role
    let role = 'student';
    const dataRole = element.getAttribute('data-role');
    if (dataRole) {
      role = dataRole === 'student' || dataRole === 'user' ? 'student' : 'avatar';
    } else {
      const textAll = (element.textContent || '').trim().toLowerCase();
      if (textAll.startsWith('avatar') || textAll.startsWith('assistant') || textAll.startsWith('ai')) {
        role = 'avatar';
      } else if (textAll.startsWith('you') || textAll.startsWith('student') || textAll.startsWith('me')) {
        role = 'student';
      } else {
        role = i % 2 === 0 ? 'student' : 'avatar';
      }
    }

    // Prefer the content paragraph inside the message (avoid label line)
    const contentP = element.querySelector('p.text-sm');
    let text = contentP?.textContent?.trim() || element.textContent?.trim() || '';
    if (!text) continue;

    // Remove any accidental labels at start
    text = text.replace(/^(you|student|me)\s*:?\s*/i, '')
               .replace(/^(avatar|assistant|ai)\s*:?\s*/i, '')
               .trim();

    normalizedMessages.push(`${role}: ${text}`);
  }

  return normalizedMessages.join('\n');
}

export default function EndOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const caseId = searchParams.get('caseId');
  const sid = searchParams.get('sid');

  const handleEndSimulation = async () => {
    if (isSubmitting) return;

    const confirmed = confirm("End the simulation and view results?");
    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      // Collect transcript from DOM
      const transcriptText = collectTranscriptFromDOM();
      
      if (!transcriptText) {
        alert("Could not find transcript. Please try again.");
        setIsSubmitting(false);
        return;
      }

      console.log('Collected transcript:', transcriptText);

      // Prepare request body
      const requestBody: any = {};
      if (caseId) requestBody.caseId = caseId;
      if (sid) requestBody.simSessionId = sid;
      requestBody.transcriptText = transcriptText;

      // POST to MSW grading API
      const response = await fetch('/api/msw/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Navigate to results loading page
        const params = new URLSearchParams();
        if (caseId) params.set('caseId', caseId);
        if (sid) params.set('sid', sid);
        
        router.replace(`/sim/results-loading?${params.toString()}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to submit: ${errorData.error || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error ending simulation:', error);
      alert('Failed to end simulation. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleEndSimulation}
        disabled={isSubmitting}
        className={`
          px-4 py-2 rounded-lg shadow-lg font-medium text-sm
          ${isSubmitting 
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 text-white'
          }
          transition-colors duration-200
        `}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            Submitting...
          </div>
        ) : (
          'End Simulation'
        )}
      </button>
    </div>
  );
}
