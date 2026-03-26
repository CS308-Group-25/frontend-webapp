import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Lütfen geçerli bir e-posta adresi girin' }),
  password: z.string().min(1, { message: 'Lütfen şifrenizi girin' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
