'use client';

import { useState, useCallback } from 'react';
import type { ShareableEntity } from '@/components/features/share/types';
import { isRichEntity } from '@/components/features/share/types';
import { getShareData, getSignedOgImageUrl } from '@/lib/share/share-data';
import {
  isNativeShareSupported,
  isFileShareSupported,
  nativeShare,
  fetchImageAsFile,
  copyToClipboard,
  buildShareUrl,
} from '@/lib/share/share-utils';
import { showSuccessToast, showErrorToast } from '@/lib/errors';

interface UseShareOptions {
  entity: ShareableEntity;
  clubId?: string;
}

interface UseShareReturn {
  share: () => Promise<'dropdown' | 'modal' | null>;
  copyLink: () => Promise<void>;
  nativeShareSupported: boolean;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export function useShare({ entity }: UseShareOptions): UseShareReturn {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const nativeShareSupported = isNativeShareSupported();

  const copyLink = useCallback(async () => {
    const url = buildShareUrl(entity.data.url);
    const success = await copyToClipboard(url);
    if (success) {
      showSuccessToast('Link copied!');
    } else {
      showErrorToast(new Error('Copy failed'), { fallback: "Couldn't copy link — try again" });
    }
  }, [entity.data.url]);

  const share = useCallback(async (): Promise<'dropdown' | 'modal' | null> => {
    const shareData = getShareData(entity);

    if (nativeShareSupported) {
      try {
        if (isRichEntity(entity.type) && isFileShareSupported()) {
          const imageUrl = await getSignedOgImageUrl(entity, { preview: true });
          const file = await fetchImageAsFile(imageUrl, `${entity.type}-${entity.id}.png`);
          const shared = await nativeShare({ ...shareData, files: [file] });
          if (shared) return null;
        } else {
          const shared = await nativeShare(shareData);
          if (shared) return null;
        }
      } catch {
        // Native share failed — fall through to desktop paths
      }
    }

    if (isRichEntity(entity.type)) {
      setModalOpen(true);
      return 'modal';
    } else {
      setDropdownOpen(true);
      return 'dropdown';
    }
  }, [entity, nativeShareSupported]);

  return {
    share,
    copyLink,
    nativeShareSupported,
    dropdownOpen,
    setDropdownOpen,
    modalOpen,
    setModalOpen,
  };
}
