// frontend/src/components/features/share/ShareButton.tsx
'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ShareableEntity } from './types';
import { isRichEntity } from './types';
import { useShare } from '@/hooks/useShare';
import { getShareData } from '@/lib/share/share-data';
import { ShareDropdown } from './ShareDropdown';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  entity: ShareableEntity;
  action?: 'share' | 'copy';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm';
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({
  entity,
  action = 'share',
  variant = 'outline',
  size = 'sm',
  className,
  children,
}: ShareButtonProps) {
  const {
    share,
    copyLink,
    dropdownOpen,
    setDropdownOpen,
    modalOpen,
    setModalOpen,
  } = useShare({ entity });

  const shareData = getShareData(entity);
  const isIconSize = size?.toString().startsWith('icon');

  const handleClick = async () => {
    if (action === 'copy') {
      await copyLink();
    } else {
      await share();
    }
  };

  // For simple entities: wrap button in DropdownMenu so it anchors properly
  // For rich entities or copy mode: just a plain button (modal/toast, no dropdown)
  if (!isRichEntity(entity.type) && action === 'share') {
    return (
      <>
        <ShareDropdown
          shareData={shareData}
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
        >
          <Button
            variant={variant}
            size={size}
            className={className}
          >
            <Share2 className={isIconSize ? 'size-4' : 'size-3.5'} />
            {isIconSize ? null : (children ?? 'Share')}
          </Button>
        </ShareDropdown>

        <ShareModal
          entity={entity}
          shareData={shareData}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    );
  }

  // Rich entities or copy mode: plain button, no dropdown wrapper
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
      >
        <Share2 className={isIconSize ? 'size-4' : 'size-3.5'} />
        {isIconSize ? null : (children ?? 'Share')}
      </Button>

      <ShareModal
        entity={entity}
        shareData={shareData}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
