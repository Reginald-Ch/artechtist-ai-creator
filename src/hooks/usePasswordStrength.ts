import { useState, useEffect } from 'react';

export interface PasswordStrength {
  score: number;
  feedback: string[];
  label: string;
  color: string;
}

export const usePasswordStrength = (password: string): PasswordStrength => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    label: 'Very Weak',
    color: 'hsl(0 84% 60%)'
  });

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        feedback: [],
        label: 'Very Weak',
        color: 'hsl(0 84% 60%)'
      });
      return;
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use at least 8 characters');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add lowercase letters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add uppercase letters');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add numbers');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add special characters (!@#$%^&*)');
    }

    // Additional length bonus
    if (password.length >= 12) {
      score += 1;
    }

    // Determine label and color
    let label: string;
    let color: string;

    if (score <= 1) {
      label = 'Very Weak';
      color = 'hsl(0 84% 60%)';
    } else if (score === 2) {
      label = 'Weak';
      color = 'hsl(25 95% 53%)';
    } else if (score === 3) {
      label = 'Fair';
      color = 'hsl(45 93% 47%)';
    } else if (score === 4) {
      label = 'Good';
      color = 'hsl(120 40% 50%)';
    } else {
      label = 'Strong';
      color = 'hsl(120 60% 40%)';
    }

    setStrength({ score, feedback, label, color });
  }, [password]);

  return strength;
};