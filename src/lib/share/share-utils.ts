const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://spike.app';

export function buildShareUrl(relativePath: string): string {
  return `${APP_BASE_URL}${relativePath}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export function isNativeShareSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

export function isFileShareSupported(): boolean {
  return typeof navigator !== 'undefined'
    && !!navigator.canShare
    && navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] });
}

export async function nativeShare(data: {
  title: string;
  text: string;
  url: string;
  files?: File[];
}): Promise<boolean> {
  try {
    await navigator.share(data);
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return false;
    }
    throw err;
  }
}

export async function fetchImageAsFile(
  imageUrl: string,
  filename: string = 'share.png'
): Promise<File> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}
