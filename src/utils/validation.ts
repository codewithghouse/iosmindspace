// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Password strength calculation
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export const calculatePasswordStrength = (password: string): { strength: PasswordStrength; score: number; feedback: string } => {
  if (!password) {
    return { strength: 'weak', score: 0, feedback: '' };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('at least 8 characters');
  
  if (password.length >= 12) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('lowercase letter');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('uppercase letter');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('number');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('special character');

  let strength: PasswordStrength;
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'fair';
  else if (score <= 4) strength = 'good';
  else strength = 'strong';

  const feedbackText = feedback.length > 0 
    ? `Add ${feedback.slice(0, 2).join(' and ')}` 
    : strength === 'strong' ? 'Strong password' : '';

  return { strength, score, feedback: feedbackText };
};

