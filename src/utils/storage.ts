// LocalStorage utilities
export const getStoredLanguage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mindspace_language');
};

export const setStoredLanguage = (language: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mindspace_language', language);
};

