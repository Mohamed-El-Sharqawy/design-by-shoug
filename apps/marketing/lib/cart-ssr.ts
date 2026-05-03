import { cookies } from "next/headers";
import { transformCartResponse, type CartItemLocal } from "@repo/api-client/transformers/cart";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function getCartSSR(): Promise<CartItemLocal[] | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dbs_token")?.value;

    if (!token) return null;

    const res = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return transformCartResponse(json);
  } catch {
    return null;
  }
}
