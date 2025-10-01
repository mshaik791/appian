'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Loader2, Trash2 } from 'lucide-react';
import { CaseForm } from '@/components/CaseForm';
import { PersonaPreview } from '@/components/PersonaPreview';
import { PersonaEditModal } from '@/components/PersonaEditModal';
import { Persona, Rubric } from '@prisma/client';

interface CaseWithDetails {
  id: string;
  title: string;
  description: string;
  culturalContextJson: Record<string, unknown>;
  objectivesJson: unknown[];
  rubricId: string;
  personas: Persona[];
  creator: { email: string };
  rubric: { name: string };
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [caseData, setCaseData] = useState<CaseWithDetails | null>(null);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPersona, setGeneratingPersona] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  const fetchCaseData = async () => {
    try {
      const response = await fetch(`/api/cases/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setCaseData(data);
      } else if (response.status === 404) {
        router.push('/faculty/cases');
      }
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRubrics = async () => {
    try {
      const response = await fetch('/api/rubrics');
      if (response.ok) {
        const data = await response.json();
        setRubrics(data);
      }
    } catch (error) {
      console.error('Error fetching rubrics:', error);
    }
  };

  useEffect(() => {
    fetchCaseData();
    fetchRubrics();
  }, [resolvedParams.id]);

  const handleSaveCase = async (formData: Record<string, unknown>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/cases/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCase = await response.json();
        setCaseData(updatedCase);
        // Show success toast
      } else {
        const error = await response.json();
        console.error('Error updating case:', error);
        // Show error toast
      }
    } catch (error) {
      console.error('Error updating case:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePersona = async () => {
    setGeneratingPersona(true);
    try {
      const response = await fetch(`/api/cases/${resolvedParams.id}/persona/generate`, {
        method: 'POST',
      });

      if (response.ok) {
        const newPersona = await response.json();
        setCaseData(prev => prev ? {
          ...prev,
          personas: [...prev.personas, newPersona]
        } : null);
        
        // Immediately open the edit modal for the new persona
        setEditingPersona(newPersona);
        setIsEditModalOpen(true);
      } else {
        const error = await response.json();
        console.error('Error generating persona:', error);
        // Show error toast
      }
    } catch (error) {
      console.error('Error generating persona:', error);
    } finally {
      setGeneratingPersona(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!confirm('Are you sure you want to delete this case?')) return;

    try {
      const response = await fetch(`/api/cases/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/faculty/cases');
      } else {
        const error = await response.json();
        console.error('Error deleting case:', error);
      }
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  const handleEditPersona = (personaId: string) => {
    const persona = caseData?.personas.find(p => p.id === personaId);
    if (persona) {
      setEditingPersona(persona);
      setIsEditModalOpen(true);
    }
  };

  const handleSavePersona = async (personaId: string, data: {
    name: string;
    avatarId: string;
    voiceId: string;
    promptTemplate: string;
    backgroundJson: Record<string, unknown>;
    safetyJson: Record<string, unknown>;
  }) => {
    try {
      const response = await fetch(`/api/personas/${personaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedPersona = await response.json();
        setCaseData(prev => prev ? {
          ...prev,
          personas: prev.personas.map(p => p.id === personaId ? updatedPersona : p)
        } : null);
        setIsEditModalOpen(false);
        setEditingPersona(null);
      } else {
        const error = await response.json();
        console.error('Error updating persona:', error);
      }
    } catch (error) {
      console.error('Error updating persona:', error);
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    if (!confirm('Are you sure you want to delete this persona?')) return;

    try {
      const response = await fetch(`/api/personas/${personaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCaseData(prev => prev ? {
          ...prev,
          personas: prev.personas.filter(p => p.id !== personaId)
        } : null);
      } else {
        const error = await response.json();
        console.error('Error deleting persona:', error);
      }
    } catch (error) {
      console.error('Error deleting persona:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading case...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Case not found</h1>
          <Link href="/faculty/cases">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/faculty/cases">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{caseData.title}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Edit case details and manage personas
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDeleteCase}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Case
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Form */}
        <div>
          <CaseForm
            initialData={{
              title: caseData.title,
              description: caseData.description,
              culturalContextJson: caseData.culturalContextJson,
              objectivesJson: caseData.objectivesJson,
              rubricId: caseData.rubricId,
            }}
            rubrics={rubrics}
            onSubmit={handleSaveCase}
            submitLabel="Save Changes"
            isLoading={saving}
          />
        </div>

        {/* Personas */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Personas ({caseData.personas.length})</CardTitle>
              <Button 
                onClick={handleGeneratePersona} 
                disabled={generatingPersona}
              >
                {generatingPersona ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Generate Persona
              </Button>
            </CardHeader>
            <CardContent>
              {caseData.personas.length === 0 ? (
                <p className="text-center text-muted-foreground">No personas for this case yet. Generate one!</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {caseData.personas.map(persona => (
                    <PersonaPreview
                      key={persona.id}
                      persona={persona}
                      onEdit={() => handleEditPersona(persona.id)}
                      onDelete={() => handleDeletePersona(persona.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Persona Edit Modal */}
      <PersonaEditModal
        persona={editingPersona}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPersona(null);
        }}
        onSave={handleSavePersona}
      />
    </div>
  );
}