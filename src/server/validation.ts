import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Masukkan email yang valid." })),
  password: z
    .string()
    .min(8, { error: "Kata sandi minimal 8 karakter." })
    .max(128, { error: "Kata sandi terlalu panjang." }),
});

export const orderIdSchema = z.object({
  orderId: z.string().regex(/^ord_[0-9]+$/, { error: "Pesanan tidak valid." }),
});

export type LoginState = {
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};
