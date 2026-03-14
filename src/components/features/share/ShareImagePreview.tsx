// frontend/src/components/features/share/ShareImagePreview.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui';
import { getOgImageUrl } from '@/lib/share/share-data';
import type { ShareableEntity } from './types';

interface ShareImagePreviewProps {
  entity: ShareableEntity;
  templateId?: string;
}

export function ShareImagePreview({ entity, templateId }: ShareImagePreviewProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const previewUrl = getOgImageUrl(entity, { preview: true, templateId });

  // Reset loading state when preview URL changes (e.g., template switch)
  useEffect(() => {
    setStatus('loading');
  }, [previewUrl]);
  const downloadOgUrl = getOgImageUrl(entity, { width: 1200, height: 630, templateId });
  const downloadStoryUrl = getOgImageUrl(entity, { width: 1080, height: 1920, templateId });

  const handleDownload = async (url: string, filename: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-3">
      {/* Image preview */}
      <div className="relative aspect-[1200/630] overflow-hidden rounded-lg bg-muted">
        {status === 'loading' && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-8" />
            <p className="text-sm">Preview unavailable</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus('loading')}
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              Retry
            </Button>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={previewUrl} // Re-mount on URL change to reset loading state
          src={previewUrl}
          alt={`Share preview for ${entity.data.title}`}
          className={`size-full object-cover transition-opacity ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      </div>

      {/* Download buttons */}
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() =>
            handleDownload(downloadOgUrl, `${entity.type}-${entity.id}.png`)
          }
        >
          <Download className="mr-1.5 size-3.5" />
          Save Image
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() =>
            handleDownload(downloadStoryUrl, `${entity.type}-${entity.id}-story.png`)
          }
        >
          <Download className="mr-1.5 size-3.5" />
          Save for Stories (9:16)
        </Button>
      </div>
    </div>
  );
}
