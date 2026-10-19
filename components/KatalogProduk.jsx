"use client";

import { useState, useMemo } from "react";
import KartuProduk from "@/components/KartuProduk";

export default function KatalogProduk({ daftarProduk = [] }) {
  const [cari, setCari] = useState("");
  const [kategoriDipilih, setKategoriDipilih] = useState("Semua");

  // Dapatkan daftar kategori unik dari produk yang ada
  const daftarKategori = useMemo(() => {
    const kategoriSet = new Set();
    daftarProduk.forEach((p) => {
      if (p.kategori) {
        kategoriSet.add(p.kategori);
      }
    });
    return ["Semua", ...Array.from(kategoriSet)];
  }, [daftarProduk]);

  // Saring produk berdasarkan kategori dan pencarian nama
  const produkTersaring = useMemo(() => {
    return daftarProduk.filter((produk) => {
      const cocokKategori =
        kategoriDipilih === "Semua" || produk.kategori === kategoriDipilih;
      const kataKunci = cari.trim().toLowerCase();
      const cocokCari =
        !kataKunci ||
        produk.nama.toLowerCase().includes(kataKunci) ||
        produk.kategori?.toLowerCase().includes(kataKunci);
      return cocokKategori && cocokCari;
    });
  }, [daftarProduk, kategoriDipilih, cari]);

  return (
    <div className="flex flex-col gap-6">
      {/* Kolom pencarian & filter kategori */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full rounded-lg border border-garis bg-latar px-3.5 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          {cari && (
            <button
              type="button"
              onClick={() => setCari("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-teks-lembut hover:text-teks"
            >
              Hapus
            </button>
          )}
        </div>

        {daftarKategori.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {daftarKategori.map((kategori) => {
              const aktif = kategori === kategoriDipilih;
              return (
                <button
                  key={kategori}
                  type="button"
                  onClick={() => setKategoriDipilih(kategori)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    aktif
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                  }`}
                >
                  {kategori}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Daftar kartu produk atau pesan jika tidak ditemukan */}
      {produkTersaring.length === 0 ? (
        <div className="rounded-xl border border-garis bg-permukaan p-8 text-center">
          <p className="font-semibold text-teks">Tidak ada produk yang cocok</p>
          <p className="mt-1 text-sm text-teks-lembut">
            Coba ubah kata kunci pencarian atau pilih kategori lain.
          </p>
          {(cari || kategoriDipilih !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setCari("");
                setKategoriDipilih("Semua");
              }}
              className="mt-4 text-xs font-semibold text-utama underline underline-offset-4 hover:text-utama-gelap"
            >
              Reset pencarian & filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkTersaring.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}

