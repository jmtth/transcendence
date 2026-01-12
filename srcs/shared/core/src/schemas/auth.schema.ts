import z from 'zod';
import { idSchema, roleShema, usernameSchema } from './base.schema';

export const UserSchema = z.object({
  authId: idSchema,
  role: roleShema,
  email: z.email(),
  username: usernameSchema,
});

// inferred DTOs
export type UserDTO = z.infer<typeof UserSchema>;
