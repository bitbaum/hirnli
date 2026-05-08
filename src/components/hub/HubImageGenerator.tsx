'use client';

import { useState } from 'react';
import { HUB_IMAGE_PROMPTS, getMidjourneyPrompt, getDallEPrompt, getPromptConfig } from '@/lib/config/hub-image-prompts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export function HubImageGenerator() {
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const handleCopyPrompt = async (spaceName: string, format: 'midjourney' | 'dalle') => {
    const prompt = format === 'midjourney' ? getMidjourneyPrompt(spaceName) : getDallEPrompt(spaceName);
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(`${spaceName}-${format}`);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const selectedConfig = selectedSpace ? getPromptConfig(selectedSpace) : null;

  return (
    <div className="space-y-6">
      {/* Space Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {HUB_IMAGE_PROMPTS.map((space) => (
          <button
            key={space.space_name}
            onClick={() => setSelectedSpace(space.space_name)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selectedSpace === space.space_name
                ? 'border-success bg-success/10'
                : 'border-border hover:border-success/20 bg-white'
            }`}
          >
            <p className="text-sm font-semibold text-grey-dark">{space.space_name}</p>
            <p className="text-xs text-text-light mt-1">{space.aspect_ratio}</p>
          </button>
        ))}
      </div>

      {/* Prompt Display */}
      {selectedConfig && (
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="heading-card mb-1">{selectedConfig.space_name}</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge color="purple">Aspect: {selectedConfig.aspect_ratio}</Badge>
                {selectedConfig.style_keywords.slice(0, 3).map((keyword) => (
                  <Badge key={keyword} color="gray">{keyword}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Full Prompt */}
          <div className="bg-bg-light p-4 rounded-lg mb-4">
            <p className="text-xs font-semibold text-grey-dark mb-2">AI Generation Prompt:</p>
            <p className="text-sm text-text-light leading-relaxed whitespace-pre-wrap">{selectedConfig.prompt}</p>
          </div>

          {/* Negative Prompt */}
          {selectedConfig.negative_prompt && (
            <div className="bg-danger/10 p-3 rounded-lg mb-4">
              <p className="text-xs font-semibold text-danger mb-1">Negative Prompt (what to avoid):</p>
              <p className="text-sm text-danger">{selectedConfig.negative_prompt}</p>
            </div>
          )}

          {/* Copy Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleCopyPrompt(selectedConfig.space_name, 'midjourney')}
              className="rounded-lg bg-grey-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-grey-dark/85"
            >
              {copiedPrompt === `${selectedConfig.space_name}-midjourney` ? '✓ Copied!' : '📋 Copy for Midjourney'}
            </button>
            <button
              onClick={() => handleCopyPrompt(selectedConfig.space_name, 'dalle')}
              className="rounded-lg bg-grey-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-grey-dark/85"
            >
              {copiedPrompt === `${selectedConfig.space_name}-dalle` ? '✓ Copied!' : '📋 Copy for DALL-E 3'}
            </button>
          </div>

          {/* Suggested Tools */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-grey-dark mb-2">Recommended AI Tools:</p>
            <div className="flex gap-2 flex-wrap">
              {selectedConfig.suggested_tools.map((tool) => (
                <span key={tool} className="text-xs px-2 py-1 bg-bg-light text-grey-dark rounded">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      {!selectedSpace && (
        <Card className="bg-primary/10 border-l-4 border-l-primary">
          <h3 className="text-md font-semibold text-primary mb-2">How to Generate Hub Visualizations</h3>
          <ol className="text-sm text-primary space-y-2 list-decimal list-inside">
            <li><strong>Select a space</strong> from the grid above</li>
            <li><strong>Copy the prompt</strong> for your preferred AI tool (Midjourney or DALL-E 3)</li>
            <li><strong>Paste into the AI tool</strong> and generate the image</li>
            <li><strong>Download the result</strong> and add to your presentations/documents</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm text-primary">
              <strong>Free options:</strong> Use Midjourney free trial, DALL-E 3 via ChatGPT Plus, or Stable Diffusion (free, open-source).
              <br />
              <strong>Coming soon:</strong> Direct API integration for one-click generation.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
