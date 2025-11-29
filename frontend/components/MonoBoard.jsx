"use client";
import React from 'react';
import { 
  FaFlagCheckered, FaGavel, FaGlobeAmericas, FaHandHolding, 
  FaQuestion, FaCube, FaRunning, FaRegMoneyBillAlt, FaGem, FaFileInvoiceDollar, FaGavel as FaHammer
} from 'react-icons/fa';

// --- 1. DEFINISI DATA PETAK ---
const generateBoardData = () => {
  let tiles = [];
  
  // WARNA
  const C_GREEN_DARK = 'bg-[#2E5233]'; 
  const C_BLUE_DARK = 'bg-[#1F3A52]';  
  const C_RED_DARK = 'bg-[#8B2323]';   
  const C_WHITE = 'bg-[#F4F6F7]';      

  // Ikon Standar
  const ICON_TH = <FaCube className="text-white drop-shadow-md" />;

  for (let i = 0; i < 40; i++) {
    // Default: Background Putih, Teks Hitam
    let d = { id: i, label: '', points: 0, color: C_WHITE, textColor: 'text-black', isQuestion: false, icon: null };

    // --- SUDUT ---
    if (i === 0) { d.label='MULAI'; d.icon=<FaFlagCheckered className="text-4xl text-blue-900"/>; }
    else if (i === 10) { d.label='PENJARA'; d.icon=<FaGavel className="text-4xl text-gray-700"/>; }
    else if (i === 20) { d.label='BEBAS PARKIR'; d.icon=<FaGlobeAmericas className="text-4xl text-green-600"/>; }
    else if (i === 30) { d.label='PILIH KARTU'; d.icon=<FaHandHolding className="text-4xl text-purple-600"/>; }

    // --- BAWAH (25 Poin) ---
    else if (i > 0 && i < 10) {
        d.points = 25; 
        if (i===1 || i===2) { d.label='SOAL BIASA'; d.isQuestion=true; d.headerColor=C_GREEN_DARK; }
        // PERBAIKAN: Set d.points = 0 untuk Kartu
        else if (i===3) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===4) { d.label='SOAL LELANG'; d.isQuestion=true; d.headerColor=C_RED_DARK; }
        else if (i===5) { d.label='KARTU HUKUMAN'; d.points=0; d.color=C_RED_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===6) { d.label='SOAL BONUS'; d.isQuestion=true; d.headerColor=C_BLUE_DARK; }
        else if (i===7) { d.label='HARTA KARUN'; d.points=50; d.icon=<FaGem className="text-yellow-500"/>; }
        else if (i===8) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===9) { d.label='SOAL BONUS'; d.isQuestion=true; d.headerColor=C_BLUE_DARK; }
    }

    // --- KIRI (50 Poin) ---
    else if (i > 10 && i < 20) {
        d.points = 50; 
        if (i===11) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===12) { d.label='PAJAK'; d.points=-50; d.icon=<FaRegMoneyBillAlt className="text-yellow-600"/>; }
        else if (i===13) { d.label='SOAL LELANG'; d.isQuestion=true; d.headerColor=C_RED_DARK; }
        else if (i===14) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===15 || i===16) { d.label='SOAL BIASA'; d.isQuestion=true; d.headerColor=C_GREEN_DARK; }
        else if (i===17) { d.label='KARTU BONUS'; d.points=0; d.color=C_BLUE_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===18 || i===19) { d.label='SOAL BONUS'; d.isQuestion=true; d.headerColor=C_BLUE_DARK; }
    }

    // --- ATAS (75 Poin) ---
    else if (i > 20 && i < 30) {
        d.points = 75; 
        if (i===21) { d.label='SOAL BIASA'; d.isQuestion=true; d.headerColor=C_GREEN_DARK; }
        else if (i===22) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===23) { d.label='SOAL BIASA'; d.isQuestion=true; d.headerColor=C_GREEN_DARK; }
        else if (i===24) { d.label='SOAL LELANG'; d.isQuestion=true; d.headerColor=C_RED_DARK; }
        else if (i===25) { d.label='KARTU HUKUMAN'; d.points=0; d.color=C_RED_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===26) { d.label='SOAL BONUS'; d.isQuestion=true; d.headerColor=C_BLUE_DARK; }
        else if (i===27) { d.label='HARTA KARUN'; d.points=50; d.icon=<FaGem className="text-yellow-500"/>; }
        else if (i===28) { d.label='SOAL BONUS'; d.isQuestion=true; d.headerColor=C_BLUE_DARK; }
        else if (i===29) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
    }

    // --- KANAN (100 Poin) ---
    else if (i > 30 && i < 40) {
        d.points = 100; 
        if (i===31) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===32) { d.label='PAJAK'; d.points=-50; d.icon=<FaRegMoneyBillAlt className="text-yellow-600"/>; }
        else if (i===33) { d.label='SOAL BONUS'; d.isQuestion=true; d.headerColor=C_BLUE_DARK; }
        else if (i===34) { d.label='KARTU BONUS'; d.points=0; d.color=C_BLUE_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===35) { d.label='SOAL BONUS'; d.isQuestion=true; d.headerColor=C_BLUE_DARK; }
        else if (i===36) { d.label='KARTU AKSI'; d.points=0; d.color=C_GREEN_DARK; d.textColor='text-white'; d.icon=ICON_TH; }
        else if (i===37 || i===38) { d.label='SOAL BIASA'; d.isQuestion=true; d.headerColor=C_GREEN_DARK; }
        else if (i===39) { d.label='SOAL LELANG'; d.isQuestion=true; d.headerColor=C_RED_DARK; }
    }

    tiles.push(d);
  }
  return tiles;
};

const BOARD_TILES = generateBoardData();
export { BOARD_TILES }; 

export default function MonoBoard({ players = [], onTileClick, isTeleportMode }) {
  const getPionColor = (idx) => ['bg-red-600', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][idx % 4];

  const Tile = ({ data, pos = "bottom" }) => {
    const playersHere = players.filter(p => p.position === data.id);
    
    let sizeStyle = { width: '64px', height: '96px' }; 
    if (pos === "left" || pos === "right") sizeStyle = { width: '96px', height: '64px' };
    if (pos === "corner") sizeStyle = { width: '96px', height: '96px' };

    const cursorClass = isTeleportMode ? "cursor-pointer hover:ring-4 hover:ring-yellow-400 hover:scale-105 transition-all z-30" : "";

    let contentRotate = "";
    if (pos === "top") contentRotate = "transform rotate-180";
    if (pos === "left") contentRotate = "transform rotate-90";
    if (pos === "right") contentRotate = "transform -rotate-90";

    let flexClass = "flex-col"; 
    if (pos === "top") flexClass = "flex-col-reverse"; 
    if (pos === "left") flexClass = "flex-row-reverse"; 
    if (pos === "right") flexClass = "flex-row";        

    const headerSize = (pos === "left" || pos === "right") ? "w-[30%] h-full" : "h-[30%] w-full";
    const bodySize = (pos === "left" || pos === "right") ? "w-[70%] h-full" : "h-[70%] w-full";
    const splitBorderClass = (pos === "left" || pos === "right") ? "border-l-[1px] border-black/20" : "border-t-[1px] border-black/20";

    return (
      <div 
        onClick={() => isTeleportMode && onTileClick(data.id)}
        style={sizeStyle}
        className={`relative border-[0.5px] border-black flex flex-shrink-0 bg-white overflow-hidden ${cursorClass}`}
      >
        {/* TIPE 1: SOAL (SPLIT) */}
        {data.isQuestion ? (
            <div className={`flex w-full h-full ${flexClass}`}>
                <div className={`${headerSize} ${data.headerColor}`}></div>
                <div className={`${bodySize} flex flex-col items-center justify-center p-1 text-center leading-none ${contentRotate} ${splitBorderClass}`}>
                    <span className="text-[10px] sm:text-[11px] font-black uppercase text-black leading-tight mb-0.5 whitespace-pre-line">
                        {data.label.replace(' ', '\n')}
                    </span>
                    <span className="text-[9px] font-bold text-gray-500">{data.points} POIN</span>
                </div>
            </div>
        ) : (
        /* TIPE 2: KARTU & SUDUT (FULL COLOR) - POIN HILANG JIKA 0 */
            <div className={`w-full h-full flex items-center justify-center p-1 ${data.color} ${data.textColor}`}>
                <div className={`flex flex-col items-center justify-center gap-0.5 w-full h-full ${contentRotate}`}>
                    
                    {data.points !== 0 && 
                     <span className={`text-[10px] sm:text-[11px] font-black leading-none ${data.textColor === 'text-white' ? 'text-white' : (data.points > 0 ? 'text-black' : 'text-red-700')}`}>
                        {data.points > 0 ? '+' : ''}{data.points}
                     </span>
                    }
                    
                    <div className="text-3xl sm:text-4xl drop-shadow-sm">
                        {data.icon}
                    </div>

                    <span className={`text-[9px] sm:text-[10px] font-black uppercase leading-tight text-center whitespace-pre-line ${data.textColor}`}>
                        {data.label.replace(' ', '\n')}
                    </span>
                </div>
            </div>
        )}

        <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-1 pointer-events-none z-20 content-center justify-items-center">
          {playersHere.map((p, idx) => (
             <div key={idx} className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-sm pion-jump ${getPionColor(p.colorIdx)}`} title={p.name}></div>
          ))}
        </div>
      </div>
    );
  };

  const bottomRow = BOARD_TILES.slice(0, 10).reverse(); 
  const leftCol = BOARD_TILES.slice(10, 20).reverse();
  const topRow = BOARD_TILES.slice(20, 30);
  const rightCol = BOARD_TILES.slice(30, 40);

  return (
    <div className="p-1 bg-black rounded-lg shadow-2xl inline-block">
      <div className="flex flex-col bg-black/90">
        <div className="flex"><Tile data={BOARD_TILES[20]} pos="corner" />{topRow.slice(1,10).map(t => <Tile key={t.id} data={t} pos="top" />)}<Tile data={BOARD_TILES[30]} pos="corner" /></div>
        <div className="flex"><div className="flex flex-col">{leftCol.slice(0,9).map(t => <Tile key={t.id} data={t} pos="left" />)}</div><div className="bg-[#F4F6F7] flex-grow flex items-center justify-center relative overflow-hidden" style={{width: '576px', height: '576px'}}><div className="text-center transform -rotate-45 bg-white p-8 rounded-full border-[6px] border-black/80 shadow-2xl"><h1 className="text-6xl font-black text-gray-900 tracking-[0.2em] uppercase drop-shadow-sm">MONOEDU</h1><p className="text-lg font-bold text-gray-600 tracking-wider mt-2 uppercase border-t-4 border-gray-300 pt-2">Teacher Helper</p>{isTeleportMode && <p className="text-red-600 font-bold bg-yellow-300 px-6 py-2 rounded-full animate-pulse mt-6 shadow-xl relative z-10 text-base border-2 border-red-600">KLIK KOTAK TUJUAN!</p>}</div></div><div className="flex flex-col">{rightCol.slice(1,10).map(t => <Tile key={t.id} data={t} pos="right" />)}</div></div>
        <div className="flex"><Tile data={BOARD_TILES[10]} pos="corner" />{bottomRow.slice(0,9).map(t => <Tile key={t.id} data={t} pos="bottom" />)}<Tile data={BOARD_TILES[0]} pos="corner" /></div>
      </div>
    </div>
  );
}