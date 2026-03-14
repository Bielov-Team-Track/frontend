// frontend/src/components/features/share/ShareDropdown.tsx
'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Dialog, DialogPortal, DialogOverlay, DialogContent } from '@/components/ui';
import type { ShareData } from './types';
import { ShareTargetGrid } from './ShareTargetGrid';
import { getDropdownTargets, SHARE_TARGETS } from '@/lib/share/share-targets';

interface ShareDropdownProps {
  shareData: ShareData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Compact share surface for simple entities.
 * Renders as a bottom sheet dialog with top share targets + "More" to expand full list.
 */
export function ShareDropdown({ shareData, open, onOpenChange }: ShareDropdownProps) {
  const [expanded, setExpanded] = useState(false);
  const targets = expanded ? SHARE_TARGETS : getDropdownTargets(5);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setExpanded(false);
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="!max-w-sm !rounded-2xl !p-4">
          <p className="mb-3 text-sm font-medium">Share</p>
          <ShareTargetGrid
            shareData={shareData}
            targets={targets}
            layout="list"
            onShareComplete={() => onOpenChange(false)}
          />
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="size-4" />
              <span>More options</span>
            </button>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
