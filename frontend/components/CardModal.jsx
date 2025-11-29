import React from 'react';
import { FaCube, FaExclamationTriangle, FaStar } from 'react-icons/fa';

export default function CardModal({ card, type, onClose }) {
  if (!card) return null;

  // Konfigurasi Warna & Ikon
  let bgClass = "bg-gray-800";
  let icon = <FaCube />;
  
  if (type === "AKSI") {
      bgClass = "bg-[#2E5233]"; // Hijau
      icon = <FaCube className="text-6xl text-white opacity-90" />;
  } else if (type === "HUKUMAN") {
      bgClass = "bg-[#8B2323]"; // Merah
      icon = <FaExclamationTriangle className="text-6xl text-white opacity-90" />;
  } else if (type === "BONUS") {
      bgClass = "bg-[#1F3A52]"; // Biru
      icon = <FaStar className="text-6xl text-yellow-400 opacity-90" />;
  }

  return (
    // PERBAIKAN: Hapus 'pl-0 md:pl-[350px]'. Gunakan z-[100] agar paling atas.
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-bounce-in">
      <div className={`${bgClass} p-1 rounded-2xl shadow-2xl w-[320px] max-w-full text-center border-[6px] border-white relative overflow-hidden transform scale-110`}>
        
        {/* Dekorasi Garis */}
        <div className="absolute top-0 left-0 w-full h-2 bg-white/20"></div>
        
        <div className="p-8 flex flex-col items-center">
            {/* Header Jenis Kartu */}
            <div className="mb-6 uppercase tracking-widest text-xs font-bold text-white/70 border-b border-white/30 pb-2 w-full">
                KARTU {type}
            </div>

            {/* Ikon */}
            <div className="mb-6 animate-pulse">
                {icon}
            </div>
            
            {/* Judul Kartu */}
            <h2 className="text-2xl font-black text-white uppercase mb-4 leading-tight">
                {card.title}
            </h2>
            
            {/* Isi/Deskripsi */}
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 w-full">
                <p className="text-sm font-medium text-white leading-relaxed">
                    "{card.desc}"
                </p>
            </div>

            {/* Efek */}
            {card.effect && (
                <div className="mt-4 bg-white text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    Efek: {card.effect.type === 'point' ? (card.effect.val > 0 ? `+${card.effect.val} Poin` : `${card.effect.val} Poin`) : card.effect.type.toUpperCase().replace('_', ' ')}
                </div>
            )}

            {/* Tombol Tutup */}
            <button 
                onClick={onClose}
                className="mt-8 bg-white text-gray-900 px-8 py-3 rounded-xl font-black hover:bg-gray-200 hover:scale-105 transition-all shadow-xl uppercase text-sm tracking-wider"
            >
                OK, LANJUT
            </button>
        </div>
      </div>
    </div>
  );
}