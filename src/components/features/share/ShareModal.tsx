// frontend/src/components/features/share/ShareModal.tsx
'use client';

import { Link, Copy } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import type { ShareableEntity, ShareData } from './types';
import { ShareTargetGrid } from './ShareTargetGrid';
import { ShareImagePreview } from './ShareImagePreview';
import { SHARE_TARGETS } from '@/lib/share/share-targets';
import { copyToClipboard, buildShareUrl } from '@/lib/share/share-utils';
import { showSuccessToast } from '@/lib/errors';

interface ShareModalProps {
  entity: ShareableEntity;
  shareData: ShareData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
}

export function ShareModal({
  entity,
  shareData,
  open,
  onOpenChange,
  templateId,
}: ShareModalProps) {
  const fullUrl = buildShareUrl(entity.data.url);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(fullUrl);
    if (success) showSuccessToast('Link copied!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md !rounded-2xl !p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-5">
            {/* Generated image preview + download */}
            <ShareImagePreview entity={entity} templateId={templateId} />

            {/* Template picker — deferred to a separate plan (template management UI) */}

            {/* Share targets grid */}
            <ShareTargetGrid
              shareData={shareData}
              targets={SHARE_TARGETS}
              layout="grid"
              onShareComplete={() => onOpenChange(false)}
            />

            {/* Copy link row */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Link className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-xs text-muted-foreground">
                {fullUrl}
              </span>
              <Button variant="ghost" size="icon-xs" onClick={handleCopyLink}>
                <Copy className="size-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
    </Dialog>
  );
}
