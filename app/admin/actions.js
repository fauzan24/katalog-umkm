"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memvalidasi minimal 8 karakter dan kecocokan konfirmasi password di server.
 */
export async function gantiPassword(prevState, formData) {
  let form = formData;
  if (!form && prevState instanceof FormData) {
    form = prevState;
  }

  const passwordBaru = form.get("password_baru")?.toString();
  const konfirmasiPassword = form.get("konfirmasi_password")?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi telah berakhir atau belum masuk. Silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: `Gagal mengganti password: ${error.message}` };
  }

  return { success: true, message: "Password berhasil diganti." };
}

/**
 * Server Action untuk menambah produk baru ke database.
 * Memeriksa autentikasi admin di server sebelum menyimpan data produk.
 */
export async function tambahProduk(prevState, formData) {
  let form = formData;
  if (!form && prevState instanceof FormData) {
    form = prevState;
  }

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const nama = form.get("nama")?.toString().trim();
  const hargaRaw = form.get("harga")?.toString().trim();
  const kategori = form.get("kategori")?.toString().trim() || null;
  const foto_url = form.get("foto_url")?.toString().trim() || null;
  const deskripsi = form.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka yang tidak negatif." };
  }

  const { error: insertError } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (insertError) {
    return { error: `Gagal menyimpan produk: ${insertError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

/**
 * Server Action untuk mengubah produk yang sudah ada di database.
 * Memeriksa autentikasi admin di server sebelum menyimpan perubahan.
 */
export async function ubahProduk(prevState, formData) {
  let form = formData;
  if (!form && prevState instanceof FormData) {
    form = prevState;
  }

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const id = form.get("id")?.toString();
  const nama = form.get("nama")?.toString().trim();
  const hargaRaw = form.get("harga")?.toString().trim();
  const kategori = form.get("kategori")?.toString().trim() || null;
  const foto_url = form.get("foto_url")?.toString().trim() || null;
  const deskripsi = form.get("deskripsi")?.toString().trim() || null;

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka yang tidak negatif." };
  }

  const { error: updateError } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (updateError) {
    return { error: `Gagal mengubah produk: ${updateError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  revalidatePath(`/admin/produk/${id}/ubah`);
  redirect("/admin");
}

/**
 * Server Action untuk menghapus produk dari database.
 * Memeriksa autentikasi admin di server sebelum menghapus data.
 */
export async function hapusProduk(idOrFormData, maybeFormData) {
  let id;
  if (idOrFormData instanceof FormData) {
    id = idOrFormData.get("id");
  } else if (maybeFormData instanceof FormData) {
    id = idOrFormData || maybeFormData.get("id");
  } else {
    id = idOrFormData;
  }

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  const { error: deleteError } = await supabase
    .from("produk")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: `Gagal menghapus produk: ${deleteError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
