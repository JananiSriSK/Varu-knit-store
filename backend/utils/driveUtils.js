// Utility functions for Google Drive integration

export const convertDriveShareLink = (shareUrl) => {
  try {
    // Handle different Google Drive URL formats
    if (shareUrl.includes('drive.google.com/file/d/')) {
      // Extract file ID from share URL
      const fileId = shareUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    
    if (shareUrl.includes('drive.google.com/open?id=')) {
      const fileId = shareUrl.match(/id=([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    
    // If already a direct link or different format, return as is
    return shareUrl;
  } catch (error) {
    console.error('Error converting Drive link:', error);
    return shareUrl;
  }
};

export const validateDriveUrl = (url) => {
  try {
    const validPatterns = [
      /drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/,
      /drive\.google\.com\/open\?id=[a-zA-Z0-9-_]+/,
      /drive\.google\.com\/uc\?.*id=[a-zA-Z0-9-_]+/
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
  } catch (error) {
    return false;
  }
};

export const extractFileIdFromDriveUrl = (url) => {
  try {
    // Match different URL patterns
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};