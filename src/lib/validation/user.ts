import { z } from "zod";

export const userSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80),
});

export type UserSignupInput = z.infer<typeof userSignupSchema>;

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type UserLoginInput = z.infer<typeof userLoginSchema>;



