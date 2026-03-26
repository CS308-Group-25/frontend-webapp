import { z } from 'zod';

/**
 * Zod schema for the registration form validation.
 * Enforces strong typings and precise error messages.
 */
export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters long' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters long' }),
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  address: z
    .string()
    .min(10, { message: 'Please provide a detailed address (min. 10 characters)' }),
  taxId: z
    .string()
    .min(10, { message: 'Tax ID (VKN/TCKN) must be at least 10 characters' }),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the terms and conditions to register',
    }),
});

// Infer the TypeScript type from the schema for proper type checking in our forms
export type RegistrationFormValues = z.infer<typeof registrationSchema>;
