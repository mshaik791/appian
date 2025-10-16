'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BswLandingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">BSW Track</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Select a case to begin.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold">Maria Aguilar — Session 1</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Video + Q&A experience</p>
          </div>
          <div className="mt-4">
            <Link href="/bsw/maria-aguilar">
              <Button>Open</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


