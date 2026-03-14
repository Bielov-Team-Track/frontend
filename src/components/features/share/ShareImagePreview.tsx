// frontend/src/components/features/share/ShareImagePreview.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui';
import { getOgImageUrl } from '@/lib/share/share-data';
import { showErrorToast } from '@/lib/errors';
import type { ShareableEntity } from './types';

interface ShareImagePreviewProps {
  entity: ShareableEntity;
  templateId?: string;
}

export function ShareImagePreview({ entity, templateId }: ShareImagePreviewProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const ogUrl = getOgImageUrl(entity, { templateId });
  const previewUrl = retryCount > 0 ? `${ogUrl}?_t=${retryCount}` : ogUrl;

  // Reset loading state when preview URL changes
  useEffect(() => {
    setStatus('loading');
  }, [previewUrl]);

  const handleDownload = async () => {
    try {
      const response = await fetch(ogUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${entity.data.title || 'share'}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      showErrorToast(new Error('Download failed'), { fallback: 'Could not download image' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Image preview */}
      <div className="relative aspect-[1200/630] overflow-hidden rounded-lg bg-foreground/5">
        {status === 'loading' && (
          <div className="absolute inset-0 animate-pulse bg-foreground/5" />
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-8" />
            <p className="text-sm">Preview unavailable</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setRetryCount(c => c + 1); setStatus('loading'); }}
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              Retry
            </Button>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={previewUrl}
          src={previewUrl}
          alt={`Share preview for ${entity.data.title}`}
          className={`size-full object-cover transition-opacity ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      </div>

      {/* Download button */}
      <Button
        variant="default"
        size="sm"
        className="w-full"
        onClick={handleDownload}
      >
        <Download className="mr-1.5 size-3.5" />
        Save Image
      </Button>
    </div>
  );
}
