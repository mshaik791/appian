'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Save, X } from 'lucide-react';
import { Persona } from '@prisma/client';
import { HEYGEN_AVATAR_OPTIONS, VOICE_OPTIONS } from '@/data/avatarOptions';

interface PersonaEditModalProps {
  persona: Persona | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (personaId: string, data: {
    name: string;
    avatarId: string;
    voiceId: string;
    promptTemplate: string;
    backgroundJson: Record<string, unknown>;
    safetyJson: Record<string, unknown>;
  }) => Promise<void>;
}

export function PersonaEditModal({ persona, isOpen, onClose, onSave }: PersonaEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    avatarId: '',
    voiceId: '',
    promptTemplate: '',
    backgroundJson: '{}',
    safetyJson: '{}',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (persona) {
      setFormData({
        name: persona.name,
        avatarId: persona.avatarId,
        voiceId: persona.voiceId,
        promptTemplate: persona.promptTemplate,
        backgroundJson: JSON.stringify(persona.backgroundJson, null, 2),
        safetyJson: JSON.stringify(persona.safetyJson, null, 2),
      });
    }
  }, [persona]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona) return;

    setIsLoading(true);
    try {
      const backgroundJson = JSON.parse(formData.backgroundJson);
      const safetyJson = JSON.parse(formData.safetyJson);

      await onSave(persona.id, {
        name: formData.name,
        avatarId: formData.avatarId,
        voiceId: formData.voiceId,
        promptTemplate: formData.promptTemplate,
        backgroundJson,
        safetyJson,
      });

      onClose();
    } catch (error) {
      console.error('Error saving persona:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundJsonChange = (value: string) => {
    setFormData(prev => ({ ...prev, backgroundJson: value }));
  };

  const handleSafetyJsonChange = (value: string) => {
    setFormData(prev => ({ ...prev, safetyJson: value }));
  };

  if (!persona) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {persona.name === 'Persona A' || persona.name.startsWith('Persona ') 
              ? 'Customize New Persona' 
              : `Edit Persona: ${persona.name}`}
          </DialogTitle>
          {(persona.name === 'Persona A' || persona.name.startsWith('Persona ')) && (
            <DialogDescription>
              A new persona has been generated with default settings. Customize the name, avatar, voice, and prompt to fit your case.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Persona name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarId">Avatar</Label>
              <Select
                value={formData.avatarId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, avatarId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select avatar" />
                </SelectTrigger>
                <SelectContent>
                  {HEYGEN_AVATAR_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voiceId">Voice</Label>
            <Select
              value={formData.voiceId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, voiceId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promptTemplate">Prompt Template</Label>
            <Textarea
              id="promptTemplate"
              value={formData.promptTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, promptTemplate: e.target.value }))}
              placeholder="Enter the persona's prompt template"
              className="min-h-[200px] font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundJson">Background JSON</Label>
            <Textarea
              id="backgroundJson"
              value={formData.backgroundJson}
              onChange={(e) => handleBackgroundJsonChange(e.target.value)}
              placeholder='{"age": 30, "identity": ["individual"], "context": "case context"}'
              className="min-h-[120px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safetyJson">Safety JSON</Label>
            <Textarea
              id="safetyJson"
              value={formData.safetyJson}
              onChange={(e) => handleSafetyJsonChange(e.target.value)}
              placeholder='{"blockedTopics": ["diagnosis", "legal advice"]}'
              className="min-h-[120px] font-mono text-sm"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
