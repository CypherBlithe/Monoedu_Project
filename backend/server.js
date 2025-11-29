const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: { origin: "*" }
});

// --- BANK SOAL TERSTRUKTUR (DEFAULT) ---
let GLOBAL_QUESTIONS = {
  biasa: [
    "Siapakah Presiden pertama Indonesia?",
    "Apa ibukota Jawa Barat?",
    "Hewan apa yang bisa hidup di darat dan air?",
    "Sebutkan sila ke-3 Pancasila!"
  ],
  lelang: [
    "Jelaskan proses terjadinya hujan! (Lelang)",
    "Sebutkan 5 nama pahlawan revolusi! (Lelang)",
    "Apa isi sumpah pemuda? (Lelang)"
  ],
  bonus: [
    "1 + 1 = ?",
    "Apa warna bendera Indonesia?",
    "Sebutkan nama teman sebangkumu!",
    "Nyanyikan lagu Balonku Ada Lima!"
  ]
};

// BANK KARTU (SAMA SEPERTI SEBELUMNYA)
const CARD_DB = {
  aksi: [ { title: "Senyum Tulus", desc: "Tersenyumlah pada tim di sebelah kanan dan kirimu." }, { title: "Slogan Tim", desc: "Teriakkan 1 kata penyemangat!" }, { title: "Lima Lompatan", desc: "Lakukan 5x lompatan." }, { title: "Suara Binatang", desc: "Tiru suara binatang favorit." } ],
  bonus: [ { title: "Beasiswa", desc: "Dapatkan poin hadiah.", effect: { type: 'point', val: 30 } }, { title: "Maju Pesat", desc: "Maju 4 langkah.", effect: { type: 'move', val: 4 } }, { title: "Pindah Start", desc: "Pindah ke Start!", effect: { type: 'jump', val: 0 } } ],
  hukuman: [ { title: "Denda", desc: "Bayar denda keterlambatan.", effect: { type: 'point', val: -30 } }, { title: "Mundur", desc: "Mundur 4 langkah.", effect: { type: 'move', val: -4 } }, { title: "Masuk Penjara", desc: "Masuk Penjara!", effect: { type: 'jail' } } ]
};

let activeSessions = {}; 
let disconnectTimers = {};

console.log("SERVER MONOEDU (FINAL v17 - SMART QUESTION MANAGER) RUNNING...");

io.on("connection", (socket) => {
  
  // 1. REQUEST DATA SOAL (Fitur Baru untuk Guru)
  socket.on("REQUEST_CURRENT_QUESTIONS", () => {
      // Kirim data soal saat ini hanya ke peminta (Guru)
      socket.emit("CURRENT_QUESTIONS_DATA", GLOBAL_QUESTIONS);
  });

  // 2. UPDATE SOAL (Fitur Baru: Terima update full object)
  socket.on("UPDATE_QUESTIONS", ({ categories }) => {
      if(categories) {
          GLOBAL_QUESTIONS = categories;
          // Broadcast ke semua guru lain (jika ada multi-guru) agar tampilan mereka update
          io.emit("CURRENT_QUESTIONS_DATA", GLOBAL_QUESTIONS);
      }
  });

  // ... (SISA LOGIKA GAME SAMA PERSIS DENGAN VERSI SEBELUMNYA) ...
  
  socket.on("JOIN_ROOM", ({ roomCode, teamName, isInstructor, userId }) => {
    socket.join(roomCode);
    if (!activeSessions[roomCode]) activeSessions[roomCode] = { players: [], turnIndex: 0, isAnimating: false };
    const session = activeSessions[roomCode];

    if (!isInstructor) {
        if (disconnectTimers[userId]) { clearTimeout(disconnectTimers[userId]); delete disconnectTimers[userId]; }
        const existingPlayer = session.players.find(p => p.userId === userId);
        if (existingPlayer) { existingPlayer.id = socket.id; } 
        else {
            if (session.players.length >= 4) { socket.emit("ROOM_FULL"); return; }
            session.players.push({ id: socket.id, userId, name: teamName, score: 100, position: 0, colorIdx: session.players.length, jailTurns: 0 });
        }
    }
    emitState(roomCode);
  });

  socket.on("RENAME_PLAYER", ({ roomCode, newName }) => {
    const p = activeSessions[roomCode]?.players.find(pl => pl.id === socket.id);
    if(p) { p.name = newName; emitState(roomCode); }
  });

  socket.on("ROLL_DICE", ({ roomCode }) => {
    const session = activeSessions[roomCode];
    if (!session || session.isAnimating) return;
    const player = session.players[session.turnIndex];
    if (socket.id !== player.id) return; 

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    io.to(roomCode).emit("DICE_RESULT", { d1, d2, total });

    if (player.jailTurns > 0) {
        if (d1 === d2) { player.jailTurns = 0; } 
        else { player.jailTurns--; nextTurn(roomCode); return; }
    }

    session.isAnimating = true; emitState(roomCode);

    let stepsTaken = 0;
    const walkInterval = setInterval(() => {
        let nextPositionValue = player.position + 1;
        if (nextPositionValue >= 40) { player.score += 50; emitState(roomCode); }
        player.position = nextPositionValue % 40;
        stepsTaken++;
        emitState(roomCode); 

        if (stepsTaken >= total) {
            clearInterval(walkInterval);
            session.isAnimating = false; 
            checkTileEffect(roomCode, player, socket);
        }
    }, 300);
  });

  socket.on("TELEPORT_PLAYER", ({ roomCode, targetTileId }) => {
      const s = activeSessions[roomCode];
      if(!s) return;
      const p = s.players.find(x => x.id === socket.id);
      if (p && p.position === 20) { p.position = targetTileId; checkTileEffect(roomCode, p, socket); emitState(roomCode); }
  });

  socket.on("PLAYER_PICKED_CARD", ({ roomCode, cardType }) => {
      const s = activeSessions[roomCode];
      const player = s.players.find(p => p.id === socket.id);
      let card = null;
      if (cardType === 'AKSI') card = CARD_DB.aksi[Math.floor(Math.random() * CARD_DB.aksi.length)];
      if (cardType === 'HUKUMAN') card = CARD_DB.hukuman[Math.floor(Math.random() * CARD_DB.hukuman.length)];
      if (cardType === 'BONUS') card = CARD_DB.bonus[Math.floor(Math.random() * CARD_DB.bonus.length)];
      if(card) {
          applyCardEffect(roomCode, player, card);
          io.to(socket.id).emit("CARD_POPUP", { card, type: cardType });
      }
  });

  function getPointsByPosition(pos) {
      if (pos > 0 && pos < 10) return 25; if (pos > 10 && pos < 20) return 50;
      if (pos > 20 && pos < 30) return 75; if (pos > 30 && pos < 40) return 100; return 0;
  }

  function checkTileEffect(roomCode, player, socket) {
      const pos = player.position;
      const pointsValue = getPointsByPosition(pos);
      
      // ID MAP SESUAI MONOBOARD
      const ID_HARTA = [7, 27]; const ID_PAJAK = [12, 32];
      const ID_SOAL = [1, 2, 4, 6, 9, 13, 15, 16, 18, 19, 21, 23, 24, 26, 28, 33, 35, 37, 38, 39];
      const ID_SOAL_BIASA = [1, 2, 15, 16, 21, 23, 37, 38];
      const ID_SOAL_LELANG = [4, 13, 24, 39];
      const ID_SOAL_BONUS = [6, 9, 18, 19, 26, 28, 33, 35];

      const ID_AKSI = [3, 8, 11, 14, 22, 29, 31, 36]; const ID_HUKUMAN = [5, 25]; const ID_BONUS = [17, 34];

      if (pos === 20) { emitState(roomCode); return; } 
      if (pos === 30) { io.to(socket.id).emit("SHOW_PICK_CARD_MENU"); return; }

      if (ID_HARTA.includes(pos)) { 
          player.score += 50; 
          io.to(socket.id).emit("QUESTION_POPUP", { question: "💰 HARTA KARUN! +50 Poin!", points: 0, type: "INFO" });
          emitState(roomCode); 
      } 
      else if (ID_PAJAK.includes(pos)) { 
          player.score -= 50; 
          io.to(socket.id).emit("QUESTION_POPUP", { question: "💸 PAJAK! -50 Poin.", points: 0, type: "INFO" });
          emitState(roomCode); 
      }
      else if (ID_SOAL.includes(pos)) {
          // LOGIKA PILIH SOAL BERDASARKAN KATEGORI
          let randomQ = "Soal tidak tersedia";
          let qType = "SOAL";

          if (ID_SOAL_BIASA.includes(pos) && GLOBAL_QUESTIONS.biasa.length > 0) {
               randomQ = GLOBAL_QUESTIONS.biasa[Math.floor(Math.random() * GLOBAL_QUESTIONS.biasa.length)];
               qType = "SOAL BIASA";
          } else if (ID_SOAL_LELANG.includes(pos) && GLOBAL_QUESTIONS.lelang.length > 0) {
               randomQ = GLOBAL_QUESTIONS.lelang[Math.floor(Math.random() * GLOBAL_QUESTIONS.lelang.length)];
               qType = "SOAL LELANG";
          } else if (ID_SOAL_BONUS.includes(pos) && GLOBAL_QUESTIONS.bonus.length > 0) {
               randomQ = GLOBAL_QUESTIONS.bonus[Math.floor(Math.random() * GLOBAL_QUESTIONS.bonus.length)];
               qType = "SOAL BONUS";
          }

          io.to(socket.id).emit("QUESTION_POPUP", { question: randomQ, points: pointsValue, type: qType });
      }
      else if (ID_AKSI.includes(pos)) { io.to(socket.id).emit("CARD_POPUP", { card: CARD_DB.aksi[0], type: "AKSI" }); }
      else if (ID_HUKUMAN.includes(pos)) { 
          const c = CARD_DB.hukuman[0]; applyCardEffect(roomCode, player, c); 
          io.to(socket.id).emit("CARD_POPUP", { card: c, type: "HUKUMAN" }); 
      }
      else if (ID_BONUS.includes(pos)) { 
          const c = CARD_DB.bonus[0]; applyCardEffect(roomCode, player, c);
          io.to(socket.id).emit("CARD_POPUP", { card: c, type: "BONUS" }); 
      }
      else { setTimeout(() => nextTurn(roomCode), 1000); }
  }

  function applyCardEffect(roomCode, player, card) {
      if(!card.effect) return;
      const { type, val } = card.effect;
      if (type === 'point') player.score += val;
      else if (type === 'move') { let newPos = player.position + val; if(newPos < 0) newPos = 40 + newPos; player.position = newPos % 40; }
      else if (type === 'jump') { player.position = val; if (val === 0) player.score += 50; }
      else if (type === 'jail') { player.position = 10; player.jailTurns = 3; }
      emitState(roomCode);
  }

  socket.on("ANSWER_CORRECT", ({ roomCode, pointsEarned }) => {
     const s = activeSessions[roomCode]; if(s) { s.players.find(p => p.id === socket.id).score += (pointsEarned||10); nextTurn(roomCode); }
  });
  socket.on("ANSWER_WRONG", ({ roomCode }) => { nextTurn(roomCode); });
  socket.on("CLOSE_CARD", ({ roomCode }) => { nextTurn(roomCode); });

  function nextTurn(roomCode) {
      const s = activeSessions[roomCode];
      if(s) { s.turnIndex = (s.turnIndex + 1) % s.players.length; emitState(roomCode); }
  }

  function emitState(roomCode) {
      const s = activeSessions[roomCode];
      if(s) io.to(roomCode).emit("UPDATE_GAME_STATE", { players: s.players, currentTurn: s.players[s.turnIndex]?.id, isAnimating: s.isAnimating });
  }

  socket.on("disconnect", () => {
    for (const code in activeSessions) {
        const s = activeSessions[code];
        const p = s.players.find(x => x.id === socket.id);
        if (p) {
            disconnectTimers[p.userId] = setTimeout(() => {
                const idx = s.players.findIndex(x => x.id === socket.id);
                if (idx !== -1) { s.players.splice(idx, 1); if (s.turnIndex >= s.players.length) s.turnIndex = 0; emitState(code); }
                delete disconnectTimers[p.userId];
            }, 20000);
            break;
        }
    }
  });
});