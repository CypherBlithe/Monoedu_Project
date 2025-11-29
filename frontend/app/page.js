"use client";
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import MonoBoard, { BOARD_TILES } from '../components/MonoBoard'; 
import Dice3D from '../components/Dice3D';
import QuestionModal from '../components/QuestionModal';
import CardModal from '../components/CardModal'; 
import Lobby from '../components/Lobby'; 
import { FaChalkboardTeacher, FaUserEdit, FaSave, FaTimes, FaHandHolding, FaGavel, FaStar, FaCube, FaPlay, FaRedo, FaLock, FaVolumeUp, FaVolumeMute, FaSignOutAlt, FaTrash, FaPlus } from 'react-icons/fa';

const SOCKET_URL = 'https://monoeduproject-production.up.railway.app';

export default function Home() {
  const [isInGame, setIsInGame] = useState(false); 
  const [roomData, setRoomData] = useState(null); 
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [diceValues, setDiceValues] = useState({ d1: 1, d2: 1 });
  const [isRolling, setIsRolling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState(0); 
  const [activeQuestionType, setActiveQuestionType] = useState(""); 
  const [activeCard, setActiveCard] = useState(null); 
  const [activeCardType, setActiveCardType] = useState(""); 
  const [showPickCardModal, setShowPickCardModal] = useState(false); 
  const [myId, setMyId] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedTile, setDisplayedTile] = useState(BOARD_TILES[0]);
  const [displayedPlayerName, setDisplayedPlayerName] = useState("");

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState('biasa');
  
  // STATE BARU UNTUK MANAJEMEN SOAL
  const [questions, setQuestions] = useState({ biasa: [], lelang: [], bonus: [] });
  const [newQuestionInput, setNewQuestionInput] = useState("");

  const [showPinModal, setShowPinModal] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showReconnectChoice, setShowReconnectChoice] = useState(false);

  const playSound = (name) => {
      if (!soundEnabled) return;
      try { const audio = new Audio(`/sounds/${name}.mp3`); audio.volume = 0.5; audio.play().catch(()=>{}); } catch (e) {}
  };

  const connectToGame = ({ name, roomCode, isInstructor }) => {
      let mySessionId = sessionStorage.getItem("monoedu_userid");
      if (!mySessionId) {
          mySessionId = "user_" + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem("monoedu_userid", mySessionId);
      }

      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
          setIsConnected(true);
          setMyId(newSocket.id);
          newSocket.emit('JOIN_ROOM', { roomCode, teamName: name, isInstructor, userId: mySessionId });
          setRoomData({ roomCode, name, isInstructor });
          setIsInGame(true);
      });

      newSocket.on('UPDATE_GAME_STATE', (data) => {
          setPlayers(data.players);
          setCurrentTurnId(data.currentTurn);
          if (data.isAnimating) playSound('step');
          setIsAnimating(data.isAnimating); 
          if (!data.isAnimating) {
              const active = data.players.find(p => p.id === data.currentTurn);
              if (active) { setDisplayedTile(BOARD_TILES[active.position]); setDisplayedPlayerName(active.name); }
          }
      });

      // LISTEN CURRENT QUESTIONS (Saat Guru Minta)
      newSocket.on('CURRENT_QUESTIONS_DATA', (data) => {
          setQuestions(data);
      });

      newSocket.on('DICE_RESULT', (data) => {
          setIsRolling(true); playSound('roll');
          setTimeout(() => { setDiceValues({ d1: data.d1, d2: data.d2 }); setIsRolling(false); }, 500);
      });

      newSocket.on('QUESTION_POPUP', (data) => {
          setActiveQuestion(data.question); setCurrentQuestionPoints(data.points); setActiveQuestionType(data.type); playSound('popup');
      });

      newSocket.on('CARD_POPUP', (data) => {
          setActiveCard(data.card); setActiveCardType(data.type); playSound('popup');
      });

      newSocket.on('SHOW_PICK_CARD_MENU', () => { setShowPickCardModal(true); playSound('popup'); });
  };

  useEffect(() => {
      if (activeQuestion || activeCard) {
          const activePlayer = players.find(p => p.id === currentTurnId);
          if (activePlayer) { setDisplayedTile(BOARD_TILES[activePlayer.position]); setDisplayedPlayerName(activePlayer.name); }
      }
  }, [activeQuestion, activeCard, players, currentTurnId]); 

  const handleJoinLobby = (data) => { connectToGame(data); };
  const handleLeaveGame = () => { if (socket) socket.disconnect(); setIsInGame(false); setRoomData(null); setPlayers([]); };
  const handleRoll = () => { if (socket) socket.emit('ROLL_DICE', { roomCode: roomData.roomCode }); };
  const handleTileClick = (tileId) => { if (socket) socket.emit('TELEPORT_PLAYER', { roomCode: roomData.roomCode, targetTileId: tileId }); };
  const handlePickCard = (type) => { if(socket) socket.emit("PLAYER_PICKED_CARD", { roomCode: roomData.roomCode, cardType: type }); setShowPickCardModal(false); };
  const handleAnswer = (isCorrect) => {
      if (isCorrect) { socket.emit('ANSWER_CORRECT', { roomCode: roomData.roomCode, pointsEarned: currentQuestionPoints }); playSound('win'); }
      else { socket.emit('ANSWER_WRONG', { roomCode: roomData.roomCode }); playSound('lose'); }
      setActiveQuestion(null);
  };
  const handleCloseCard = () => { socket.emit('CLOSE_CARD', { roomCode: roomData.roomCode }); setActiveCard(null); };
  const saveNewName = () => { if(newName.trim()) { socket.emit('RENAME_PLAYER', { roomCode: roomData.roomCode, newName }); setShowRenameModal(false); }};

  // --- MANAJEMEN SOAL (BARU) ---
  const handleOpenGuru = () => { 
      if (!roomData?.isInstructor) { alert("⛔ AKSES DITOLAK! Hanya untuk GURU."); return; }
      setInputPin(""); setShowPinModal(true); 
  };
  const checkPin = () => { 
      if (inputPin === "1234") { 
          setShowPinModal(false); 
          setShowInstructorModal(true); 
          socket.emit("REQUEST_CURRENT_QUESTIONS"); // Minta data terbaru ke server
      } else { alert("❌ PIN SALAH!"); setInputPin(""); } 
  };
  
  const handleAddQuestion = () => {
      if(newQuestionInput.trim() !== "") {
          const updatedList = [...questions[activeTab], newQuestionInput];
          const updatedQuestions = { ...questions, [activeTab]: updatedList };
          setQuestions(updatedQuestions);
          socket.emit('UPDATE_QUESTIONS', { categories: updatedQuestions }); // Kirim ke server
          setNewQuestionInput(""); // Reset input
      }
  };

  const handleDeleteQuestion = (index) => {
      const updatedList = questions[activeTab].filter((_, i) => i !== index);
      const updatedQuestions = { ...questions, [activeTab]: updatedList };
      setQuestions(updatedQuestions);
      socket.emit('UPDATE_QUESTIONS', { categories: updatedQuestions }); // Kirim ke server
  };

  const handleContinue = () => { setShowReconnectChoice(false); connectToGame(false); };
  const handleReset = () => { setShowReconnectChoice(false); connectToGame(true); };

  const isMyTurn = currentTurnId === myId;
  const activePlayer = players.find(p => p.id === currentTurnId);
  const me = players.find(p => p.id === myId);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isTeleportMode = isMyTurn && activePlayer?.position === 20 && !isAnimating && !isRolling;

  if (!isInGame) { return <Lobby onJoin={handleJoinLobby} />; }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-4 lg:py-10 gap-4 lg:gap-8 relative overflow-x-hidden">
      
      {/* ... (Header Sama) ... */}
      <div className="hidden lg:flex absolute top-4 right-4 z-50 items-center gap-4">
          <div className="bg-white/90 backdrop-blur px-5 py-2 rounded-full font-mono font-bold text-blue-900 border border-blue-200 shadow-sm">ROOM: {roomData?.roomCode}</div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="bg-white p-3 rounded-full shadow-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition">{soundEnabled ? <FaVolumeUp /> : <FaVolumeMute className="text-red-500"/>}</button>
          <button onClick={handleLeaveGame} className="bg-red-500 text-white p-3 rounded-full shadow hover:bg-red-600 transition"><FaSignOutAlt /></button>
      </div>

      <div className="lg:absolute lg:top-4 lg:left-4 flex gap-2 z-50 justify-center w-full lg:w-auto mt-2 lg:mt-0">
          <button onClick={() => setShowRenameModal(true)} className="flex items-center gap-2 px-3 py-2 bg-white text-blue-900 rounded-lg shadow-md border border-blue-200 hover:bg-blue-50 font-bold text-xs lg:text-sm transition"> <FaUserEdit /> Ganti Nama </button>
          <button onClick={handleOpenGuru} className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-md font-bold text-xs lg:text-sm transition ${roomData?.isInstructor ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}> <FaChalkboardTeacher /> Guru </button>
      </div>

      {/* ... (Modal Pin & Rename Sama) ... */}
      {showPinModal && ( <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center px-4"> <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center"> <div className="text-4xl text-gray-800 mb-4 flex justify-center"><FaLock /></div> <h3 className="font-bold text-xl mb-2 text-gray-900">Akses Guru</h3> <input type="password" placeholder="PIN..." className="w-full border-2 border-gray-300 p-3 rounded-lg mb-4 text-center text-2xl font-bold tracking-widest text-gray-900 outline-none" value={inputPin} onChange={(e) => setInputPin(e.target.value)} autoFocus /> <div className="flex gap-2"><button onClick={() => setShowPinModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Batal</button><button onClick={checkPin} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">MASUK</button></div> </div> </div> )}
      {showRenameModal && ( <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4"> <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm"> <h3 className="font-bold text-lg mb-4 text-gray-800">Ganti Nama Tim</h3> <input type="text" placeholder="Nama Baru..." className="w-full border-2 border-gray-300 p-2 rounded mb-4 text-gray-900 outline-none" value={newName} onChange={(e) => setNewName(e.target.value)} /> <div className="flex justify-end gap-2"><button onClick={() => setShowRenameModal(false)} className="px-4 py-2 text-gray-500 rounded">Batal</button><button onClick={saveNewName} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Simpan</button></div> </div> </div> )}

      {/* === MODAL GURU BARU (LIST & DELETE) === */}
      {showInstructorModal && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center px-4">
            <div className="bg-white p-0 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden animate-bounce-in">
                <div className="bg-gray-900 text-white p-4 flex justify-between"><h3 className="font-bold text-xl flex gap-2"><FaChalkboardTeacher/> Manajemen Soal</h3><button onClick={()=>setShowInstructorModal(false)} className="text-gray-400 hover:text-white"><FaTimes/></button></div>
                
                {/* TAB KATEGORI */}
                <div className="flex bg-gray-100 border-b">
                    <button onClick={()=>setActiveTab('biasa')} className={`flex-1 py-3 font-bold ${activeTab==='biasa'?'bg-white text-green-700 border-b-4 border-green-600':'text-gray-500'}`}>Biasa</button>
                    <button onClick={()=>setActiveTab('lelang')} className={`flex-1 py-3 font-bold ${activeTab==='lelang'?'bg-white text-red-700 border-b-4 border-red-600':'text-gray-500'}`}>Lelang</button>
                    <button onClick={()=>setActiveTab('bonus')} className={`flex-1 py-3 font-bold ${activeTab==='bonus'?'bg-white text-blue-700 border-b-4 border-blue-600':'text-gray-500'}`}>Bonus</button>
                </div>
                
                {/* LIST SOAL (SCROLLABLE) */}
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-2">
                    {questions[activeTab] && questions[activeTab].map((q, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group">
                            <span className="text-gray-800 font-medium text-sm flex-grow mr-2">{idx + 1}. {q}</span>
                            <button onClick={() => handleDeleteQuestion(idx)} className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition"><FaTrash /></button>
                        </div>
                    ))}
                    {questions[activeTab]?.length === 0 && <p className="text-center text-gray-400 italic mt-10">Belum ada soal di kategori ini.</p>}
                </div>

                {/* INPUT TAMBAH SOAL */}
                <div className="bg-white p-4 border-t border-gray-200 flex gap-2">
                    <input 
                        type="text" 
                        className="flex-grow border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-800 outline-none focus:border-blue-500"
                        placeholder="Ketik soal baru..."
                        value={newQuestionInput}
                        onChange={(e) => setNewQuestionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                    />
                    <button onClick={handleAddQuestion} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"><FaPlus /> Tambah</button>
                </div>
            </div>
        </div>
      )}

      {/* ... (Sisanya sama: Pick Card, Soal, Layout 3 Kolom) ... */}
      {showPickCardModal && ( <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] px-4"> <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center animate-bounce-in"> <h2 className="text-xl lg:text-3xl font-black text-gray-800 mb-2 uppercase flex items-center justify-center gap-3"> <FaHandHolding className="text-purple-600"/> SILAKAN PILIH KARTU! </h2> <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6"> <button onClick={() => handlePickCard('AKSI')} className="flex lg:flex-col items-center justify-center gap-4 p-4 bg-green-100 rounded-xl border-4 border-green-500"><div className="bg-green-500 text-white p-3 rounded-full text-2xl"><FaCube/></div><span className="font-black text-green-800 text-lg">AKSI</span></button> <button onClick={() => handlePickCard('HUKUMAN')} className="flex lg:flex-col items-center justify-center gap-4 p-4 bg-red-100 rounded-xl border-4 border-red-500"><div className="bg-red-500 text-white p-3 rounded-full text-2xl"><FaGavel/></div><span className="font-black text-red-800 text-lg">HUKUMAN</span></button> <button onClick={() => handlePickCard('BONUS')} className="flex lg:flex-col items-center justify-center gap-4 p-4 bg-blue-100 rounded-xl border-4 border-blue-500"><div className="bg-blue-500 text-white p-3 rounded-full text-2xl"><FaStar/></div><span className="font-black text-blue-800 text-lg">BONUS</span></button> </div> </div> </div> )}
      {activeQuestion && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] px-4"><QuestionModal question={activeQuestion} type={activeQuestionType} onClose={() => handleAnswer(false)} onCorrect={() => handleAnswer(true)} /></div>}
      {activeCard && <CardModal card={activeCard} type={activeCardType} onClose={handleCloseCard} />}

      <div className="text-center z-10 mt-6">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-widest drop-shadow-sm mb-3">MonoEdu Multiplayer</h1>
        <div className="flex gap-4 justify-center items-center">
            <span className={`px-3 py-1 rounded-full font-bold text-xs ${isConnected ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700'}`}>{isConnected ? '● ONLINE' : '● OFFLINE'}</span>
            {me && <span className="px-4 py-1 rounded-full bg-blue-600 text-white shadow-md border border-blue-400 font-bold text-sm">👤 {me.name}</span>}
        </div>
      </div>

      <div className="flex flex-row items-start justify-center gap-8 w-full max-w-[1400px] px-4"> 
        <div className="w-60 flex flex-col gap-4 pt-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200 flex justify-center gap-3"><Dice3D value={diceValues.d1} isRolling={isRolling} /><Dice3D value={diceValues.d2} isRolling={isRolling} /></div>
            <div className={`w-full p-4 rounded-2xl text-center shadow-lg transition-all border-2 ${isMyTurn ? 'bg-green-500 border-green-600 text-white scale-105' : 'bg-white border-gray-200 text-gray-500'}`}>
                <p className="text-[10px] uppercase font-bold mb-1 opacity-80">GILIRAN PEMAIN</p>
                <p className="text-lg font-black truncate">{activePlayer ? activePlayer.name : '...'}</p>
                {activePlayer?.jailTurns > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold mt-1 block">🔒 Penjara ({activePlayer.jailTurns})</span>}
            </div>
            <button onClick={handleRoll} disabled={!isMyTurn || isRolling || activeQuestion || activeCard || isAnimating || isTeleportMode || showPickCardModal} className={`w-full py-6 rounded-2xl font-bold text-xl shadow-xl transition-all transform active:scale-95 border-b-4 ${isMyTurn && !activeQuestion && !activeCard && !isAnimating && !isTeleportMode && !showPickCardModal ? 'bg-blue-600 border-blue-800 text-white hover:bg-blue-700' : 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'}`}>
                {activeQuestion ? 'JAWAB!' : (activeCard ? 'BACA KARTU!' : (isRolling || isAnimating ? '...' : (showPickCardModal ? 'PILIH KARTU!' : (isTeleportMode ? 'PILIH KOTAK!' : (isMyTurn ? '🎲 KOCOK' : '⏳ TUNGGU')))))}
            </button>
        </div>

        <div className="flex-shrink-0">
            <MonoBoard players={players} onTileClick={handleTileClick} isTeleportMode={isTeleportMode} />
        </div>

        <div className={`w-[400px] flex flex-col gap-4 pt-4 transition-all duration-300 ${(activeQuestion || activeCard) ? 'z-[160] relative scale-105' : 'z-0'}`}>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-5">
                <h3 className="text-gray-800 font-black uppercase text-lg mb-4 flex items-center gap-2 border-b-2 pb-2">🏆 Klasemen</h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {sortedPlayers.map((p, idx) => (
                        <div key={p.id} className={`flex justify-between items-center p-3 rounded-xl transition-all ${p.id === currentTurnId ? 'bg-yellow-100 border-2 border-yellow-400 scale-[1.02] shadow-md' : 'bg-gray-50 border border-gray-100'}`}>
                            <div className="flex items-center gap-3 overflow-hidden"><span className={`font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow' : 'bg-gray-300 text-gray-600'}`}>{idx + 1}</span><span className={`text-base font-bold truncate ${p.id === myId ? 'text-blue-600' : 'text-gray-700'}`}>{p.name} {p.id === myId && '(Anda)'}</span></div>
                            <span className="font-mono font-black text-lg text-gray-900">{p.score}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={`flex-grow bg-white rounded-2xl shadow-2xl border-[6px] border-gray-800 overflow-hidden flex flex-col relative min-h-[350px] ${(activeQuestion || activeCard) ? 'ring-8 ring-yellow-400 shadow-yellow-500/50' : ''}`}>
                <div className="bg-gray-800 text-white p-4 text-center font-bold uppercase tracking-[0.2em] text-sm">POSISI PEMAIN AKTIF</div>
                <div className={`flex-grow flex flex-col items-center justify-center p-8 text-center ${displayedTile.color} ${displayedTile.textColor}`}>
                    <div className="text-8xl mb-6 drop-shadow-2xl">{displayedTile.icon}</div>
                    <h2 className="text-4xl font-black uppercase mb-3 leading-none border-b-4 border-current pb-4 w-full">{displayedTile.label}</h2>
                    <div className="mb-8 mt-2"><span className="bg-black/20 text-current px-4 py-1 rounded-full text-sm font-bold uppercase">Sedang Dihuni:</span><p className="text-xl font-bold mt-1">{displayedPlayerName || '-'}</p></div>
                    {displayedTile.points !== 0 && (
                        <div className="bg-white/95 text-gray-900 px-10 py-5 rounded-2xl shadow-xl border-4 border-white">
                            <span className="block text-xs uppercase font-extrabold tracking-widest text-gray-400 mb-1">REWARD / PENALTI</span>
                            <div className="flex items-center justify-center gap-1"><span className={`text-6xl font-black ${displayedTile.points > 0 ? 'text-green-600' : 'text-red-600'}`}>{displayedTile.points > 0 ? '+' : ''}{displayedTile.points}</span><span className="text-sm font-bold text-gray-600">POIN</span></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}