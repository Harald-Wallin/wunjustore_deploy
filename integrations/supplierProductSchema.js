import { z } from "zod";

export const SupplierProductSchema = z.object({

    sku: z.string().trim().min(1),
    ean: z.string().trim().min(1),

    name: z.string().trim().min(1),
    category: z.string().trim().min(1),

    //nonnegative = inga negativa tal godkänns (t.ex om det finns -3 i lagersaldo)
    price: z.number().finite().nonnegative(),
    stock: z.number().int().nonnegative(),

    variants: z.array(z.string().trim().min(1)),

    updatedAt: z.string().trim().min(1)

});