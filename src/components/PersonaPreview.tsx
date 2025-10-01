'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Persona } from '@prisma/client';
import { useState } from 'react';
import { HEYGEN_AVATAR_OPTIONS, VOICE_OPTIONS } from '@/data/avatarOptions';

interface PersonaPreviewProps {
  persona: Persona;
  onEdit: () => void;
  onDelete: () => void;
}

export function PersonaPreview({ persona, onEdit, onDelete }: PersonaPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const promptLines = persona.promptTemplate?.split('\n') || [];
  const previewLines = promptLines.slice(0, 6);
  const hasMore = promptLines.length > 6;

  // Get display labels for avatar and voice
  const avatarLabel = HEYGEN_AVATAR_OPTIONS.find(opt => opt.id === persona.avatarId)?.label || persona.avatarId;
  const voiceLabel = VOICE_OPTIONS.find(opt => opt.id === persona.voiceId)?.label || persona.voiceId;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{persona.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Badge variant="secondary">{avatarLabel}</Badge>
          <Badge variant="outline">{voiceLabel}</Badge>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">Preview Prompt</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {previewLines.join('\n')}
                {hasMore && !isOpen && '\n...'}
              </pre>
            </div>
            {hasMore && isOpen && (
              <div className="text-xs text-gray-500">
                Showing first 6 lines of {promptLines.length} total lines
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
