import { FormValidationResult, AuthFormData, BotConfiguration } from '@/types/common';

/**
 * Enhanced form validation utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAuthForm = (formData: AuthFormData, isSignup: boolean = false): FormValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Email validation
  if (!formData.email) {
    errors.push('Email is required');
  } else if (!validateEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Password validation
  if (!formData.password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      if (isSignup) {
        errors.push(...passwordValidation.errors);
      } else {
        // For login, just check minimum length
        if (formData.password.length < 6) {
          errors.push('Password must be at least 6 characters long');
        }
      }
    }
  }
  
  // Signup-specific validations
  if (isSignup) {
    if (!formData.firstName) {
      errors.push('First name is required');
    } else if (formData.firstName.length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
    
    if (!formData.lastName) {
      errors.push('Last name is required');
    } else if (formData.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateBotName = (name: string): FormValidationResult => {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Bot name is required');
  } else if (name.trim().length < 3) {
    errors.push('Bot name must be at least 3 characters long');
  } else if (name.length > 50) {
    errors.push('Bot name must be less than 50 characters');
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    errors.push('Bot name can only contain letters, numbers, spaces, hyphens, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBotConfiguration = (config: Partial<BotConfiguration>): FormValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Name validation
  const nameValidation = validateBotName(config.name || '');
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }
  
  // Avatar validation
  if (!config.avatar) {
    warnings.push('No avatar selected - using default');
  }
  
  // Nodes validation
  if (!config.nodes || config.nodes.length === 0) {
    errors.push('At least one intent is required');
  } else {
    const intentNodes = config.nodes.filter(node => node.type === 'intent');
    if (intentNodes.length === 0) {
      errors.push('At least one intent node is required');
    }
    
    // Validate each intent node
    intentNodes.forEach((node, index) => {
      if (!node.data.label || node.data.label.trim().length === 0) {
        errors.push(`Intent ${index + 1} must have a label`);
      }
      
      if (!node.data.trainingPhrases || node.data.trainingPhrases.length === 0) {
        warnings.push(`Intent "${node.data.label}" has no training phrases`);
      }
      
      if (!node.data.responses || node.data.responses.length === 0) {
        warnings.push(`Intent "${node.data.label}" has no responses`);
      }
    });
  }
  
  // Voice settings validation
  if (config.voiceSettings) {
    if (config.voiceSettings.speed < 0.1 || config.voiceSettings.speed > 3.0) {
      errors.push('Voice speed must be between 0.1 and 3.0');
    }
    
    if (config.voiceSettings.pitch < -20 || config.voiceSettings.pitch > 20) {
      errors.push('Voice pitch must be between -20 and 20');
    }
    
    if (config.voiceSettings.volume < 0 || config.voiceSettings.volume > 1) {
      errors.push('Voice volume must be between 0 and 1');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateTrainingPhrase = (phrase: string): FormValidationResult => {
  const errors: string[] = [];
  
  if (!phrase || phrase.trim().length === 0) {
    errors.push('Training phrase cannot be empty');
  } else if (phrase.trim().length < 3) {
    errors.push('Training phrase must be at least 3 characters long');
  } else if (phrase.length > 200) {
    errors.push('Training phrase must be less than 200 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateResponse = (response: string): FormValidationResult => {
  const errors: string[] = [];
  
  if (!response || response.trim().length === 0) {
    errors.push('Response cannot be empty');
  } else if (response.trim().length < 1) {
    errors.push('Response must have at least 1 character');
  } else if (response.length > 1000) {
    errors.push('Response must be less than 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility function to check if a string is safe for display
export const isSafeForDisplay = (input: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};