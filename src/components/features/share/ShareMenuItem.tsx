// frontend/src/components/features/share/ShareMenuItem.tsx
'use client';

import { Share2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui';
import type { ShareableEntity } from './types';
import { useShare } from '@/hooks/useShare';
import { getShareData } from '@/lib/share/share-data';
import { ShareDropdown } from './ShareDropdown';
import { ShareModal } from './ShareModal';

interface ShareMenuItemProps {
  entity: ShareableEntity;
  icon?: boolean;
}

export function ShareMenuItem({ entity, icon = true }: ShareMenuItemProps) {
  const {
    share,
    dropdownOpen,
    setDropdownOpen,
    modalOpen,
    setModalOpen,
  } = useShare({ entity });

  const shareData = getShareData(entity);

  return (
    <>
      <DropdownMenuItem onClick={() => share()}>
        {icon && <Share2 className="mr-2 size-4" />}
        Share
      </DropdownMenuItem>

      <ShareDropdown
        shareData={shareData}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      />

      <ShareModal
        entity={entity}
        shareData={shareData}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
