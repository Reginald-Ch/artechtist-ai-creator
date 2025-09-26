import { useState, useEffect } from 'react';

export interface EmailValidation {
  isValid: boolean;
  error: string | null;
  isChecking: boolean;
}

export const useEmailValidation = (email: string): EmailValidation => {
  const [validation, setValidation] = useState<EmailValidation>({
    isValid: false,
    error: null,
    isChecking: false
  });

  useEffect(() => {
    if (!email) {
      setValidation({ isValid: false, error: null, isChecking: false });
      return;
    }

    setValidation(prev => ({ ...prev, isChecking: true }));

    // Debounce validation
    const timer = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        setValidation({
          isValid: false,
          error: 'Please enter a valid email address',
          isChecking: false
        });
        return;
      }

      // Additional validations
      if (email.length > 254) {
        setValidation({
          isValid: false,
          error: 'Email address is too long',
          isChecking: false
        });
        return;
      }

      // Check for common typos
      const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
      const domain = email.split('@')[1];
      const suggestions = [];

      if (domain && !commonDomains.includes(domain)) {
        // Check for common typos
        if (domain.includes('gmai') && !domain.includes('gmail')) {
          suggestions.push('Did you mean gmail.com?');
        }
        if (domain.includes('yahooo') || domain.includes('yaho')) {
          suggestions.push('Did you mean yahoo.com?');
        }
        if (domain.includes('outlok') || domain.includes('outloo')) {
          suggestions.push('Did you mean outlook.com?');
        }
      }

      setValidation({
        isValid: true,
        error: suggestions.length > 0 ? suggestions[0] : null,
        isChecking: false
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [email]);

  return validation;
};