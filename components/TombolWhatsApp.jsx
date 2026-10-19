"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState("");

  const kurangiJumlah = () => {
    if (jumlah > 1) setJumlah((prev) => prev - 1);
  };

  const tambahJumlah = () => {
    setJumlah((prev) => prev + 1);
  };

  const handleJumlahChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setJumlah(val);
    } else if (e.target.value === "") {
      setJumlah(1);
    }
  };

  const totalHarga = produk.harga * jumlah;

  // Susun teks pesan WhatsApp sesuai jumlah dan varian yang dipilih
  let pesan = `Halo, saya ingin memesan:\n`;
  pesan += `• Produk: ${produk.nama}\n`;
  pesan += `• Jumlah: ${jumlah}\n`;
  if (varian.trim()) {
    pesan += `• Varian/Catatan: ${varian.trim()}\n`;
  }
  pesan += `• Total perkiraan: ${formatRupiah(totalHarga)}`;

  const href = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-4 border-t border-garis pt-4">
      {/* Pengatur Jumlah */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold">Jumlah</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={kurangiJumlah}
              disabled={jumlah <= 1}
              aria-label="Kurangi jumlah"
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks-lembut hover:text-utama disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={jumlah}
              onChange={handleJumlahChange}
              className="h-10 w-14 text-center text-sm font-semibold text-teks focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={tambahJumlah}
              aria-label="Tambah jumlah"
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks-lembut hover:text-utama"
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold text-teks-lembut">
            Total: <span className="text-teks">{formatRupiah(totalHarga)}</span>
          </span>
        </div>
      </div>

      {/* Pilihan Varian / Catatan */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="varian-input" className="text-sm font-semibold">
          Varian / Catatan <span className="font-normal text-teks-lembut">(opsional)</span>
        </label>
        <input
          id="varian-input"
          type="text"
          value={varian}
          onChange={(e) => setVarian(e.target.value)}
          placeholder="Contoh: rasa, level pedas, ukuran, dll."
          className="max-w-sm rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      {/* Tombol Pesan WhatsApp */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
