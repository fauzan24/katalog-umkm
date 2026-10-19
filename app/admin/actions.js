"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 * Dapat dipanggil melalui useActionState(login, null) maupun langsung dari form action.
 */
export async function login(prevState, formData) {
  let form = formData;
  if (!form && prevState instanceof FormData) {
    form = prevState;
  }

  const email = form.get("email")?.toString().trim();
  const password = form.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "Email atau password salah. Periksa kembali dan coba lagi." };
    }
    return { error: `Gagal masuk: ${error.message}` };
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke halaman login.
 */
export async function keluar() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export { keluar as logout };

