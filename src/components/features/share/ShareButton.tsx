// frontend/src/components/features/share/ShareButton.tsx
'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { ShareableEntity } from './types';
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

  const handleClick = async () => {
    if (action === 'copy') {
      await copyLink();
    } else {
      await share();
    }
  };

  return (
    <>
      <ShareDropdown
        shareData={shareData}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <DropdownMenuTrigger
          render={
            <Button
              variant={variant}
              size={size}
              className={className}
              onClick={handleClick}
            >
              <Share2 className={size?.toString().startsWith('icon') ? 'size-4' : 'size-3.5'} />
              {size?.toString().startsWith('icon') ? null : (children ?? 'Share')}
            </Button>
          }
        />
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
