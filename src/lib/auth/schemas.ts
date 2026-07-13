import { z } from 'zod';

export const emailSchema = z.email({ message: 'email' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'passwordLength' })
  .regex(/\p{L}/u, { message: 'passwordLetter' })
  .regex(/\p{N}/u, { message: 'passwordDigit' })
  .regex(/[^\p{L}\p{N}]/u, { message: 'passwordSpecial' });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
