'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Rubric {
  id: string;
  name: string;
}

interface Competency {
  id: string;
  name: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    culturalContextJson: '{}',
    objectivesJson: '[]',
    learningObjectivesJson: '[]',
    rubricId: '',
    competencyId: ''
  });

  useEffect(() => {
    fetchRubricsAndCompetencies();
  }, []);

  const fetchRubricsAndCompetencies = async () => {
    try {
      // For now, we'll use hardcoded values since we don't have separate APIs
      setRubrics([{ id: 'default', name: 'CSWE EPAS (mini)' }]);
      setCompetencies([
        { id: 'engagement', name: 'Engagement' },
        { id: 'ethics', name: 'Ethics' },
        { id: 'diversity', name: 'Diversity' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          culturalContextJson: JSON.parse(formData.culturalContextJson),
          objectivesJson: JSON.parse(formData.objectivesJson),
          learningObjectivesJson: JSON.parse(formData.learningObjectivesJson),
        }),
      });

      if (response.ok) {
        toast.success('Case created successfully!');
        router.push('/admin/cases');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create case');
      }
    } catch (error) {
      console.error('Error creating case:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/cases">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Case</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Add a new simulation scenario for students to practice
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Case Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter case title..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the scenario..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="rubric">Rubric</Label>
                <Select value={formData.rubricId} onValueChange={(value) => handleInputChange('rubricId', value)}>
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="competency">Competency</Label>
                <Select value={formData.competencyId} onValueChange={(value) => handleInputChange('competencyId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a competency" />
                  </SelectTrigger>
                  <SelectContent>
                    {competencies.map((competency) => (
                      <SelectItem key={competency.id} value={competency.id}>
                        {competency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="culturalContext">Cultural Context (JSON)</Label>
                <Textarea
                  id="culturalContext"
                  value={formData.culturalContextJson}
                  onChange={(e) => handleInputChange('culturalContextJson', e.target.value)}
                  placeholder='{"identity": ["Latinx", "first-gen"], "values": ["family obligation"]}'
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="objectives">Objectives (JSON)</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectivesJson}
                  onChange={(e) => handleInputChange('objectivesJson', e.target.value)}
                  placeholder='["Build rapport", "Explore stressors"]'
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="learningObjectives">Learning Objectives (JSON)</Label>
                <Textarea
                  id="learningObjectives"
                  value={formData.learningObjectivesJson}
                  onChange={(e) => handleInputChange('learningObjectivesJson', e.target.value)}
                  placeholder='["Demonstrate active listening", "Apply cultural humility"]'
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/cases">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Case
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
