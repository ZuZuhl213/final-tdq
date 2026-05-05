import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirm: z.string().min(6, "Password confirmation is required"),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

export const AddressSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(9, "Phone number is invalid"),
  address_line: z.string().min(5, "Address is too short"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional().default(false),
});

export const CheckoutSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(9, "Phone number is invalid"),
  address_line: z.string().min(5, "Address is too short"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().optional(),
  payment_method: z.enum(["cod", "transfer"]),
  notes: z.string().optional(),
});

export const ChangePasswordSchema = z
  .object({
    old_password: z.string().min(6, "Password is required"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    new_password_confirm: z
      .string()
      .min(6, "Password confirmation is required"),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: "Passwords don't match",
    path: ["new_password_confirm"],
  });

export const ProductFilterSchema = z.object({
  category_id: z.number().optional(),
  brand_id: z.number().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  search: z.string().optional(),
  ordering: z.string().optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type AddressFormData = z.infer<typeof AddressSchema>;
export type CheckoutFormData = z.infer<typeof CheckoutSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
export type ProductFilterData = z.infer<typeof ProductFilterSchema>;
