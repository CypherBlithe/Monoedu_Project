import React from 'react';

export default function QuestionModal({ question, type, onClose, onCorrect }) {
  if (!question) return null;

  // Cek apakah ini mode INFO (Harta/Pajak) atau SOAL
  const isInfoMode = type === "INFO";

  return (
    <div className="bg-white p-8 rounded-2xl max-w-lg w-full text-center border-4 border-yellow-400 shadow-2xl relative animate-bounce-in">
        
        <h2 className="text-2xl font-bold text-yellow-600 mb-2">
            {isInfoMode ? "PEMBERITAHUAN" : "⚡ TANTANGAN SOAL!"}
        </h2>
        <div className="text-3xl font-bold mb-6 text-gray-800 leading-tight">{question}</div>
        
        {!isInfoMode && <p className="text-gray-500 text-sm mb-6">Jawab dengan keras! Apakah jawabanmu benar?</p>}

        <div className={`grid ${isInfoMode ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          
          {/* Tombol Salah/Menyerah HANYA jika bukan Info Mode */}
          {!isInfoMode && (
              <button 
                onClick={onClose}
                className="py-3 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200"
              >
                ❌ Salah / Menyerah
              </button>
          )}
          
          {/* Tombol Benar / OK */}
          <button 
            onClick={isInfoMode ? onClose : onCorrect} // Kalau info, onClose = Next Turn
            className={`py-3 font-bold rounded-xl shadow-lg transform active:scale-95 transition 
            ${isInfoMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {isInfoMode ? "OK, LANJUT" : "✅ JAWABAN SAYA BENAR"}
          </button>
        </div>

    </div>
  );
}