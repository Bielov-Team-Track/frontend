// frontend/src/components/features/share/ShareTargetGrid.tsx
'use client';

import {
  Link, MessageCircle, Send, Instagram, Facebook,
  Phone, Mail, Twitter, MessageSquare,
} from 'lucide-react';
import type { ShareTarget, ShareData } from './types';
import { SHARE_TARGETS, type ShareTargetConfig } from '@/lib/share/share-targets';
import { copyToClipboard, buildShareUrl } from '@/lib/share/share-utils';
import { showSuccessToast, showErrorToast } from '@/lib/errors';

const enc = encodeURIComponent;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Link, MessageCircle, Send, Instagram, Facebook,
  Phone, Mail, Twitter, MessageSquare,
};

interface ShareTargetGridProps {
  shareData: ShareData;
  targets?: ShareTargetConfig[];
  layout?: 'grid' | 'list';
  onShareComplete?: () => void;
}

export function ShareTargetGrid({
  shareData,
  targets = SHARE_TARGETS,
  layout = 'grid',
  onShareComplete,
}: ShareTargetGridProps) {
  const handleClick = async (target: ShareTargetConfig) => {
    if (target.id === 'clipboard') {
      const success = await copyToClipboard(shareData.url);
      if (success) {
        showSuccessToast('Link copied!');
        onShareComplete?.();
      } else {
        showErrorToast(new Error('Copy failed'), { fallback: "Couldn't copy link" });
      }
      return;
    }

    if (target.id === 'instagram') {
      // Mobile: try Instagram Stories deep link with the share URL
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `instagram-stories://share?url=${enc(shareData.url)}`;
        // If deep link fails (app not installed), fall back to copy
        setTimeout(async () => {
          const success = await copyToClipboard(shareData.url);
          if (success) showSuccessToast('Link copied! Open Instagram to paste.');
        }, 1500);
      } else {
        // Desktop: copy link and instruct
        const success = await copyToClipboard(shareData.url);
        if (success) showSuccessToast('Link copied! Open Instagram to paste.');
      }
      onShareComplete?.();
      return;
    }

    const url = target.buildUrl(shareData);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      onShareComplete?.();
    }
  };

  const Icon = ({ name, className }: { name: string; className?: string }) => {
    const Comp = ICON_MAP[name];
    return Comp ? <Comp className={className} /> : null;
  };

  if (layout === 'list') {
    return (
      <div className="flex flex-col gap-0.5">
        {targets.map((target) => (
          <button
            key={target.id}
            onClick={() => handleClick(target)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <span
              className="flex size-8 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: target.color }}
            >
              <Icon name={target.icon} className="size-4" />
            </span>
            <span>{target.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {targets.map((target) => (
        <button
          key={target.id}
          onClick={() => handleClick(target)}
          className="flex flex-col items-center gap-1.5 rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <span
            className="flex size-10 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: target.color }}
          >
            <Icon name={target.icon} className="size-5" />
          </span>
          <span className="text-[10px] text-muted-foreground">{target.label}</span>
        </button>
      ))}
    </div>
  );
}
