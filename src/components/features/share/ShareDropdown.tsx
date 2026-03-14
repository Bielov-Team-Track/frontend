// frontend/src/components/features/share/ShareDropdown.tsx
'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ShareData } from './types';
import { ShareTargetGrid } from './ShareTargetGrid';
import { getDropdownTargets, SHARE_TARGETS } from '@/lib/share/share-targets';

interface ShareDropdownProps {
  shareData: ShareData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode; // Trigger element (rendered as the menu trigger)
}

/**
 * Compact share popover anchored to the trigger button.
 * Shows top share targets with "More options" to expand.
 * Children are rendered as the dropdown trigger.
 */
export function ShareDropdown({ shareData, open, onOpenChange, children }: ShareDropdownProps) {
  const [expanded, setExpanded] = useState(false);
  const targets = expanded ? SHARE_TARGETS : getDropdownTargets(5);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setExpanded(false);
      }}
    >
      <DropdownMenuTrigger render={children as React.ReactElement} />
      <DropdownMenuContent align="end" side="bottom" className="w-64 p-2">
        <p className="mb-2 px-1.5 text-xs font-medium text-muted-foreground">Share</p>
        <ShareTargetGrid
          shareData={shareData}
          targets={targets}
          layout="list"
          onShareComplete={() => onOpenChange(false)}
        />
        {!expanded && (
          <>
            <DropdownMenuSeparator />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(true);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              <MoreHorizontal className="size-3.5" />
              <span>More options</span>
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
