import React, { useState } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaGamepad, FaArrowRight } from 'react-icons/fa';

export default function Lobby({ onJoin }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [role, setRole] = useState("SISWA"); // 'SISWA' atau 'GURU'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim()) {
      
      // --- KIRIM DATA KE PAGE.JS ---
      onJoin({ 
        name: name.toUpperCase(), 
        
        // PERUBAHAN DI SINI:
        // Kita HAPUS .replace(/\s/g, '')
        // Kita GANTI dengan .trim()
        // Artinya: "KELAS A" tetap "KELAS A". Spasi tidak dibuang.
        roomCode: roomCode.toUpperCase().trim(), 
        
        isInstructor: role === 'GURU'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* KIRI */}
        <div className="md:w-1/2 bg-blue-600 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="z-10 text-center">
            <div className="mb-6 bg-white/20 p-6 rounded-full inline-block backdrop-blur-sm">
                <FaGamepad className="text-6xl" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">MONOEDU</h1>
            <p className="text-blue-100 text-lg tracking-widest font-light uppercase">Multiplayer Learning</p>
          </div>
          
          <div className="mt-12 text-center text-sm text-blue-200">
            <p>Belajar sambil bermain.</p>
            <p>Interaktif & Menyenangkan.</p>
          </div>
        </div>

        {/* KANAN */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Mulai Petualangan</h2>
          
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setRole('SISWA')}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${role === 'SISWA' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FaUserGraduate /> SISWA
            </button>
            <button 
              onClick={() => setRole('GURU')}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${role === 'GURU' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FaChalkboardTeacher /> GURU
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nama Tim / Pemain</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 font-bold text-gray-700 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                placeholder={role === 'SISWA' ? "Contoh: Tim Rajawali" : "Contoh: Pak Budi"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Kode Ruangan (Room Code)</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 font-black text-gray-700 tracking-widest uppercase focus:outline-none focus:border-blue-500 focus:bg-white transition"
                placeholder="Contoh: KELAS A"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {role === 'GURU' ? 'BUAT / MASUK ROOM' : 'GABUNG GAME'} <FaArrowRight />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}