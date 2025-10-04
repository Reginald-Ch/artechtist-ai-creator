import { z } from 'zod';

/**
 * Reusable form validation schemas
 */

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

// Password validation
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(128, { message: 'Password must be less than 128 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

// Generic text field validation
export const textFieldSchema = (fieldName: string, maxLength: number = 100) =>
  z
    .string()
    .trim()
    .min(1, { message: `${fieldName} cannot be empty` })
    .max(maxLength, { message: `${fieldName} must be less than ${maxLength} characters` });

// Message/Content validation
export const messageSchema = z
  .string()
  .trim()
  .min(1, { message: 'Message cannot be empty' })
  .max(2000, { message: 'Message must be less than 2000 characters' });

// URL validation
export const urlSchema = z
  .string()
  .trim()
  .url({ message: 'Invalid URL format' })
  .max(500, { message: 'URL must be less than 500 characters' });

// Phone number validation (international format)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' });

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Encode text for safe use in URLs
 */
export const encodeForURL = (text: string): string => {
  return encodeURIComponent(sanitizeInput(text));
};

/**
 * Validate and sanitize form data
 */
export const validateAndSanitize = <T extends Record<string, any>>(
  data: T,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validated = schema.parse(data);
    
    // Sanitize string fields
    const sanitized = { ...validated };
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        (sanitized as any)[key] = sanitizeInput(sanitized[key] as string);
      }
    }
    
    return { success: true, data: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        errors[field] = issue.message;
      });
      
      return { success: false, errors };
    }
    return { success: false, errors: { _general: 'Validation failed' } };
  }
};
