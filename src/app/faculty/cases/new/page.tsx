'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { CaseForm } from '@/components/CaseForm';
import { Rubric } from '@prisma/client';

export default function NewCasePage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      const response = await fetch('/api/rubrics');
      if (response.ok) {
        const data = await response.json();
        setRubrics(data);
      }
    } catch (error) {
      console.error('Error fetching rubrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (formData: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCase = await response.json();
        router.push(`/faculty/cases/${newCase.id}`);
      } else {
        const error = await response.json();
        console.error('Error creating case:', error);
        // Show error toast
      }
    } catch (error) {
      console.error('Error creating case:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/faculty/cases">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Case</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseForm
            rubrics={rubrics}
            onSubmit={handleCreateCase}
            submitLabel="Create Case"
            isLoading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
