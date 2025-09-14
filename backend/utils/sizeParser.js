export const parseSize = (sizeInput) => {
  if (!sizeInput) return [];
  
  if (Array.isArray(sizeInput)) {
    return sizeInput.filter(s => s && s.trim());
  }
  
  if (typeof sizeInput === 'string') {
    // Clean up escaped quotes and backslashes
    let cleaned = sizeInput
      .replace(/\\"/g, '') // Remove escaped quotes
      .replace(/\\\\/g, '') // Remove escaped backslashes
      .replace(/"/g, '') // Remove remaining quotes
      .replace(/\[|\]/g, ''); // Remove brackets
    
    // Split by comma and clean up
    return cleaned
      .split(',')
      .map(s => s.trim())
      .filter(s => s && s !== 'undefined' && s !== 'null');
  }
  
  return [];
};