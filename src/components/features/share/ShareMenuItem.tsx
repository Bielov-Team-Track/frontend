// frontend/src/components/features/share/ShareMenuItem.tsx
'use client';

import { Share2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { ShareableEntity } from './types';
import { useShare } from '@/hooks/useShare';
import { getShareData } from '@/lib/share/share-data';
import { ShareModal } from './ShareModal';

interface ShareMenuItemProps {
  entity: ShareableEntity;
  icon?: boolean;
}

/**
 * Share as a dropdown menu item. When clicked, opens the ShareModal
 * (for rich entities) or triggers native share / copies link (for simple entities).
 * Does NOT use ShareDropdown since it's already inside a dropdown menu.
 */
export function ShareMenuItem({ entity, icon = true }: ShareMenuItemProps) {
  const {
    share,
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

      <ShareModal
        entity={entity}
        shareData={shareData}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
