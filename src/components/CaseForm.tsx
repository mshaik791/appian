'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JsonTextarea } from '@/components/JsonTextarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { Rubric } from '@prisma/client';
import { useState, useEffect } from 'react';

interface CaseFormProps {
  initialData?: {
    title?: string;
    description?: string;
    culturalContextJson?: any;
    objectivesJson?: any;
    rubricId?: string;
  };
  rubrics: Rubric[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function CaseForm({
  initialData,
  rubrics,
  onSubmit,
  submitLabel = 'Save Case',
  isLoading = false,
}: CaseFormProps) {
  const [culturalContext, setCulturalContext] = useState(
    initialData?.culturalContextJson
      ? JSON.stringify(initialData.culturalContextJson, null, 2)
      : '{\n  "identity": [],\n  "values": [],\n  "languageNotes": []\n}'
  );
  const [objectives, setObjectives] = useState(
    initialData?.objectivesJson
      ? JSON.stringify(initialData.objectivesJson, null, 2)
      : '[]'
  );
  const [selectedRubricId, setSelectedRubricId] = useState(
    initialData?.rubricId || rubrics[0]?.id || ''
  );

  useEffect(() => {
    if (initialData?.culturalContextJson) {
      setCulturalContext(JSON.stringify(initialData.culturalContextJson, null, 2));
    }
    if (initialData?.objectivesJson) {
      setObjectives(JSON.stringify(initialData.objectivesJson, null, 2));
    }
    if (initialData?.rubricId) {
      setSelectedRubricId(initialData.rubricId);
    } else if (rubrics.length > 0) {
      setSelectedRubricId(rubrics[0].id);
    }
  }, [initialData, rubrics]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const culturalContextJson = JSON.parse(culturalContext);
      const objectivesJson = JSON.parse(objectives);
      
      onSubmit({
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        culturalContextJson,
        objectivesJson,
        rubricId: selectedRubricId,
      });
    } catch (error) {
      console.error('Invalid JSON:', error);
      // Handle JSON parsing error
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Case Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData?.title || ''}
              placeholder="Enter case title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ''}
              placeholder="Enter case description"
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rubricId">Rubric</Label>
            <Select onValueChange={setSelectedRubricId} value={selectedRubricId}>
              <SelectTrigger id="rubricId">
                <SelectValue placeholder="Select a rubric" />
              </SelectTrigger>
              <SelectContent>
                {rubrics.map((rubric) => (
                  <SelectItem key={rubric.id} value={rubric.id}>
                    {rubric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="culturalContextJson">Cultural Context (JSON)</Label>
            <JsonTextarea
              id="culturalContextJson"
              name="culturalContextJson"
              value={culturalContext}
              onChange={setCulturalContext}
              placeholder='{"identity": ["Latinx", "first-gen"], "values": ["family obligation"], "languageNotes": ["bilingual"]}'
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectivesJson">Objectives (JSON Array)</Label>
            <JsonTextarea
              id="objectivesJson"
              name="objectivesJson"
              value={objectives}
              onChange={setObjectives}
              placeholder='["Build rapport", "Explore stressors", "Co-create action plan"]'
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
