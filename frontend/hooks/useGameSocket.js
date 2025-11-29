import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export const useGameSocket = () => {
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // State baru untuk menyimpan soal yang aktif
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      const randomId = Math.floor(Math.random() * 1000);
      newSocket.emit('JOIN_ROOM', { roomCode: 'KELAS-A', teamName: `Tim-${randomId}` });
    });

    newSocket.on('UPDATE_PLAYERS', (data) => setPlayers(data));
    
    newSocket.on('PLAYER_MOVED', ({ teamId, newPosition }) => {
      setPlayers(prev => prev.map(p => p.id === teamId ? { ...p, position: newPosition } : p));
    });

    // --- DENGARKAN SINYAL SOAL ---
    newSocket.on('QUESTION_POPUP', (data) => {
       setActiveQuestion(data.question); // Munculkan modal
    });

    return () => newSocket.disconnect();
  }, []);

  const rollDice = () => {
    if(socket) socket.emit('ROLL_DICE', { roomCode: 'KELAS-A' });
  };

  // Fungsi kalau jawab benar
  const submitCorrect = () => {
      if(socket) socket.emit('ANSWER_CORRECT', { roomCode: 'KELAS-A' });
      setActiveQuestion(null); // Tutup modal
  };

  return { players, isConnected, rollDice, activeQuestion, setActiveQuestion, submitCorrect };
};