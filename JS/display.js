/*************************************************
 * DISPLAY.JS – WITH WEBRTC + EMOTE RUNNING + EMOTE COUNTER
 * ✅ Emote bergerak BOLAK-BALIK (Kanan→Kiri, Kiri→Kanan)
 * ✅ SIAPAPUN bisa kirim emote kapan saja!
 * ✅ WebRTC PiP Camera working properly
 * ✅ NEW: Emote counter per-emoji di area ungu (kanan)
 * ✅ NEW: Auto-reset counter saat giliran berikutnya
 *************************************************/

// ========= INIT ROOM SYSTEM =========
console.log('🔄 Initializing room system for display...');

if (!window.RoomManager) {
  console.error('❌ RoomManager not loaded!');
  alert('Error: Room system tidak tersedia. Silakan refresh halaman.');
  throw new Error('RoomManager not loaded');
}

if (!RoomManager.initRoomSystem()) {
  console.error('❌ Room system initialization failed');
  throw new Error('Room system initialization failed');
}

console.log('✅ Room system initialized for display');

// ========= GET REFS =========
const queueRef = RoomManager.getQueueRef();
const roomId = RoomManager.getRoomId();
const roomRef = RoomManager.getRoomRef();
const emotesRef = roomRef.child('emotes');

if (!queueRef) {
  console.error('❌ Queue reference not available');
  alert('Error: Tidak dapat terhubung ke database.');
  throw new Error('Queue reference not available');
}

console.log('✅ Room ID:', roomId);
console.log('✅ Emotes ref:', emotesRef.toString());

// ========= CONFIG =========
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const MAX_DURATION = 600;

// ========= STATE =========
let player = null;
let currentKey = null;
let isPlayerReady = false;
let countdownTimer = null;
let remainingTime = MAX_DURATION;
let watchdogInterval = null;

// WebRTC State
let peerConnection = null;
let videoSessionRef = null;
let remoteStream = null;
let isPiPActive = false;

// Emote State
let processedEmotes = new Set();
let emotePositions = [15, 30, 45, 60, 75];
let nextEmotePosition = 0;
let nextDirection = 'rtl';

// Audio Control State
let youtubeVolume = 100;
let audioControlRef = null;

// ✅ NEW: Emote Counter State
let emoteCounters = {};

// ========= 1. OVERLAY =========
document.body.insertAdjacentHTML('afterbegin', `
  <div id="start-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:linear-gradient(135deg, #1a1a1a, #000); z-index:10000; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; font-family: sans-serif;">
    <img src="img/microphone.png" alt="Mic" style="width: 100px; margin-bottom: 20px;">
    <h1 style="margin-bottom:10px; font-size: 32px;">Sistem Karaoke Bus</h1>
    <p style="margin-bottom:30px; color: #aaa;">Klik tombol di bawah untuk mengaktifkan player</p>
    <button onclick="startSystem()" style="padding:20px 50px; font-size:24px; cursor:pointer; background:linear-gradient(135deg, #667eea, #764ba2); border:none; border-radius:50px; color:white; font-weight:bold; box-shadow: 0 10px 20px rgba(0,0,0,0.3); transition: 0.3s;">MULAI KARAOKE</button>
  </div>
`);

window.startSystem = function() {
  const overlay = document.getElementById('start-overlay');
  if (overlay) overlay.remove();
  console.log("🚀 System Started");
  
  const displayStatusRef = roomRef.child('displayStatus');
  displayStatusRef.set('active').then(() => {
    console.log('✅ Display status set to: active');
  }).catch(err => {
    console.error('❌ Failed to set display status:', err);
  });
  
  setupAudioControl();
  checkAndPlayFirst();
  initWebRTCReceiver();
  initEmoteListener();
  
  if (!watchdogInterval) {
    watchdogInterval = setInterval(checkPlayerHealth, 5000);
  }
}

// ========= 2. YOUTUBE API =========
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

window.onYouTubeIframeAPIReady = function() {
  console.log("✅ YouTube API Ready");
  isPlayerReady = true;
}

// ========= 3. WEBRTC RECEIVER =========
function initWebRTCReceiver() {
  console.log('📹 Initializing WebRTC receiver...');
  
  if (!roomId) {
    console.error('❌ No room ID for WebRTC');
    return;
  }
  
  videoSessionRef = db.ref(`karaoke/room/${roomId}/videoSession`);
  
  videoSessionRef.child('cameraStatus').on('value', (snapshot) => {
    const status = snapshot.val();
    console.log('📹 Camera status:', status);
    
    if (status === 'connected') {
      console.log('✅ Camera connected, setting up WebRTC...');
      setupWebRTCConnection();
    } else if (status === 'disconnected') {
      console.log('📴 Camera disconnected, closing PiP...');
      closePiPCamera();
    }
  });
}

async function setupWebRTCConnection() {
  try {
    console.log('🔗 Setting up WebRTC connection...');
    
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    
    peerConnection = new RTCPeerConnection(configuration);
    
    peerConnection.ontrack = (event) => {
      console.log('🎥 Received remote track:', event.track.kind);
      remoteStream = event.streams[0];
      
      const pipVideo = document.getElementById('pip-video');
      const pipCamera = document.getElementById('pip-camera');
      
      if (pipVideo && pipCamera) {
        pipVideo.srcObject = remoteStream;
        pipCamera.classList.remove('hidden');
        isPiPActive = true;
        console.log('✅ PiP camera active');
      }
    };
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && videoSessionRef) {
        videoSessionRef.child('displayCandidates').push(event.candidate.toJSON());
      }
    };
    
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        console.warn('⚠️ WebRTC connection lost');
        closePiPCamera();
      }
    };
    
    videoSessionRef.child('offer').on('value', async (snapshot) => {
      if (!snapshot.exists()) return;
      if (peerConnection.currentRemoteDescription) return;
      
      const offer = snapshot.val();
      console.log('📩 Received offer from camera');
      
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await videoSessionRef.child('answer').set(peerConnection.localDescription.toJSON());
        console.log('📤 Answer sent to camera');
      } catch (error) {
        console.error('❌ Error handling offer:', error);
      }
    });
    
    videoSessionRef.child('cameraCandidates').on('child_added', async (snapshot) => {
      if (!peerConnection || !snapshot.val()) return;
      
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(snapshot.val()));
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error);
      }
    });
    
    console.log('✅ WebRTC setup complete');
    
  } catch (error) {
    console.error('❌ WebRTC setup error:', error);
  }
}

function closePiPCamera() {
  const pipCamera = document.getElementById('pip-camera');
  const pipVideo = document.getElementById('pip-video');
  
  if (pipCamera) pipCamera.classList.add('hidden');
  if (pipVideo) pipVideo.srcObject = null;
  
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  remoteStream = null;
  isPiPActive = false;
}

// ========= 4. 🎭 EMOTE LISTENER =========
function initEmoteListener() {
  console.log('🎭 Initializing emote listener...');
  
  const container = document.getElementById('emote-container');
  if (!container) {
    console.error('❌ Emote container not found!');
    return;
  }
  
  emotesRef.on('child_added', (snapshot) => {
    const emoteKey = snapshot.key;
    const emoteData = snapshot.val();
    
    if (processedEmotes.has(emoteKey)) return;
    
    console.log('🎭 NEW EMOTE RECEIVED:', emoteData);
    
    showEmoteAnimation(emoteData, emoteKey);
    processedEmotes.add(emoteKey);
    
    // ✅ NEW: Update emote counter
    updateEmoteCounter(emoteData.emote);
    
    setTimeout(() => {
      emotesRef.child(emoteKey).remove()
        .catch(err => console.error('❌ Error removing emote:', err));
    }, 12000);
  });
  
  console.log('✅ Emote listener active!');
}

function showEmoteAnimation(emoteData, emoteKey) {
  const container = document.getElementById('emote-container');
  if (!container) return;
  
  const emoteEl = document.createElement('div');
  emoteEl.className = 'floating-emote';
  emoteEl.id = `emote-${emoteKey}`;
  
  const direction = nextDirection;
  emoteEl.classList.add(direction);
  nextDirection = (direction === 'rtl') ? 'ltr' : 'rtl';
  
  const yPosition = emotePositions[nextEmotePosition % emotePositions.length];
  nextEmotePosition++;
  
  emoteEl.style.top = `${yPosition}%`;
  
  emoteEl.innerHTML = `
    <div class="emote-emoji">${emoteData.emote}</div>
    <div class="emote-info">
      <div class="emote-name">${emoteData.name}</div>
      <div class="emote-label">${emoteData.emoteName || ''}</div>
    </div>
  `;
  
  container.appendChild(emoteEl);
  
  setTimeout(() => {
    emoteEl.remove();
  }, 10000);
}

// ========= 5. ✅ EMOTE COUNTER FUNCTIONS =========
function updateEmoteCounter(emoji) {
  if (!emoji) return;
  
  if (!emoteCounters[emoji]) {
    emoteCounters[emoji] = 0;
  }
  emoteCounters[emoji]++;
  
  console.log('📊 Emote counter:', emoji, emoteCounters[emoji]);
  renderEmoteCounterUI();
}

function resetEmoteCounters() {
  console.log('🔄 Resetting emote counters...');
  emoteCounters = {};
  renderEmoteCounterUI();
}

function renderEmoteCounterUI() {
  const listEl = document.getElementById('emote-counter-list');
  if (!listEl) return;
  
  const entries = Object.entries(emoteCounters);
  
  if (entries.length === 0) {
    listEl.innerHTML = '<div class="emote-counter-empty">Belum ada reaction</div>';
    return;
  }
  
  // Sort by count descending
  entries.sort((a, b) => b[1] - a[1]);
  
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  
  let html = '';
  entries.forEach(([emoji, count]) => {
    html += `
      <div class="emote-counter-item">
        <span class="emote-counter-emoji">${emoji}</span>
        <span class="emote-counter-count">${count}</span>
      </div>
    `;
  });
  
  html += `
    <div class="emote-counter-total">
      <span class="emote-counter-total-label">TOTAL</span>
      <span class="emote-counter-total-count">${total}</span>
    </div>
  `;
  
  listEl.innerHTML = html;
}

// ========= 6. PLAY SONG =========
function checkAndPlayFirst() {
  if (!isPlayerReady || document.getElementById('start-overlay')) return;
  
  queueRef.orderByChild("order").limitToFirst(1).once("value", snap => {
    if (snap.exists() && !currentKey) {
      snap.forEach(child => playSong(child.key, child.val()));
    }
  });
}

function playSong(key, data) {
  console.log("🎵 Playing:", data.name);
  currentKey = key;
  remainingTime = MAX_DURATION;
  document.getElementById("now").innerHTML = '<img src="img/microphone.png" alt="Mic" style="width:24px; vertical-align:middle; margin-right:8px;">' + data.name;

  // ✅ Reset emote counters saat lagu baru mulai
  resetEmoteCounters();

  if (player) {
    clearAllTimers();
    try { player.destroy(); } catch(e) {}
    player = null;
  }

  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: data.videoId,
    playerVars: { autoplay: 1, controls: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: (e) => { 
        e.target.playVideo(); 
        applyYoutubeVolume();
        startCountdown(); 
      },
      onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) removeCurrentAndPlayNext(); },
      onError: (e) => handleVideoError()
    }
  });
}

function handleVideoError() {
  queueRef.child(currentKey).once("value", snap => {
    const songName = snap.exists() ? snap.val().name : "Seseorang";
    showErrorMessage(songName);
    setTimeout(() => removeCurrentAndPlayNext(), 3000);
  });
}

function showErrorMessage(name) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); display:flex; align-items:center; justify-content:center; z-index:9999;";
  overlay.innerHTML = `
    <div style="text-align:center; padding:40px;">
      <div style="font-size:100px; margin-bottom:30px;">⚠️</div>
      <h1 style="font-size:48px; color:#ef4444; margin-bottom:20px;">Link Bermasalah!</h1>
      <p style="font-size:32px; color:white;">Maaf link yang <strong style="color:#fbbf24;">${name}</strong> request bermasalah</p>
      <p style="font-size:24px; color:#94a3b8; margin-top:15px;">Video tidak dapat diputar</p>
      <p style="font-size:20px; color:#64748b; margin-top:30px;">Melanjutkan dalam <span id="error-countdown" style="color:#fbbf24;">3</span> detik...</p>
    </div>
  `;
  document.body.appendChild(overlay);
  
  let count = 3;
  const interval = setInterval(() => {
    count--;
    const el = document.getElementById("error-countdown");
    if (el) el.textContent = count;
    if (count <= 0) clearInterval(interval);
  }, 1000);
  
  setTimeout(() => overlay.remove(), 3000);
}

// ========= 7. QUEUE LISTENER =========
queueRef.orderByChild("order").on("value", snap => {
  renderQueue(snap.val());
  
  if (!snap.exists()) {
    resetPlayer();
    return;
  }

  if (!currentKey && isPlayerReady && !document.getElementById('start-overlay')) {
    snap.forEach(child => { playSong(child.key, child.val()); return true; });
  }

  const data = snap.val();
  if (currentKey && (!data || !data[currentKey])) {
    playNextSong();
  }
});

function removeCurrentAndPlayNext() {
  if (!currentKey) return;
  queueRef.child(currentKey).remove().then(() => {
    currentKey = null;
    playNextSong();
  });
}

function playNextSong() {
  clearAllTimers();
  currentKey = null;
  queueRef.orderByChild("order").limitToFirst(1).once("value", snap => {
    if (!snap.exists()) {
      resetPlayer();
    } else {
      snap.forEach(child => playSong(child.key, child.val()));
    }
  });
}

// ========= 8. TIMER =========
function startCountdown() {
  clearInterval(countdownTimer);
  remainingTime = MAX_DURATION;
  updateTimerUI();
  
  countdownTimer = setInterval(() => {
    remainingTime--;
    updateTimerUI();
    if (remainingTime <= 0) {
      clearAllTimers();
      removeCurrentAndPlayNext();
    }
  }, 1000);
}

function updateTimerUI() {
  const min = Math.floor(remainingTime / 60);
  const sec = remainingTime % 60;
  const el = document.getElementById("timer");
  if (el) el.innerHTML = `<img src="img/waktu.png" alt="Waktu" style="width:24px; vertical-align:middle; margin-right:5px;"> ${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function clearAllTimers() {
  clearInterval(countdownTimer);
}

function checkPlayerHealth() {
  if (player && typeof player.getPlayerState === 'function') {
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.CUED) {
      player.playVideo();
    }
  }
}

function resetPlayer() {
  currentKey = null;
  clearAllTimers();
  if (player) { try { player.destroy(); } catch(e) {} player = null; }
  document.getElementById("now").innerText = "Menunggu lagu...";
  document.getElementById("timer").innerHTML = `<img src="img/waktu.png" alt="Waktu" style="width:24px; vertical-align:middle; margin-right:5px;"> 10:00`;
  
  // ✅ Reset emote counters saat tidak ada lagu
  resetEmoteCounters();
}

// ========= 9. RENDER QUEUE =========
function renderQueue(data) {
  const list = document.getElementById("queue-list");
  
  if (!data) {
    list.innerHTML = '<div class="empty">Belum ada antrean</div>';
    list.className = "empty";
    return;
  }

  list.className = "";
  const items = Object.entries(data).sort((a, b) => a[1].order - b[1].order);
  const nextItems = items.slice(1);
  
  if (nextItems.length === 0) {
    list.innerHTML = '<div class="empty">Tidak ada lagu selanjutnya</div>';
    list.className = "empty";
  } else {
    list.innerHTML = nextItems.map((item, i) => `
      <div class="queue-item">
        <div class="queue-number">${i + 1}</div>
        <div class="queue-name">${item[1].name}</div>
      </div>
    `).join('');
  }
}

// ========= 10. CLEANUP =========
window.addEventListener('beforeunload', () => {
  if (peerConnection) peerConnection.close();
  if (videoSessionRef) {
    videoSessionRef.child('answer').remove();
    videoSessionRef.child('displayCandidates').remove();
  }
  
  const displayStatusRef = roomRef.child('displayStatus');
  displayStatusRef.set('inactive').catch(err => {
    console.error('❌ Failed to set display status:', err);
  });
});

// ========= 11. AUDIO CONTROL =========
function setupAudioControl() {
  console.log('🔊 Setting up audio control...');
  
  audioControlRef = roomRef.child('audioControl');
  
  audioControlRef.child('youtubeVolume').once('value', (snapshot) => {
    const savedVolume = snapshot.val();
    if (savedVolume !== null && savedVolume !== undefined) {
      youtubeVolume = savedVolume;
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(youtubeVolume);
      }
    }
  });
  
  audioControlRef.child('youtubeVolume').on('value', (snapshot) => {
    const newVolume = snapshot.val();
    if (newVolume !== null && newVolume !== undefined && newVolume !== youtubeVolume) {
      youtubeVolume = newVolume;
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(youtubeVolume);
      }
    }
  });
}

function applyYoutubeVolume() {
  if (player && typeof player.setVolume === 'function') {
    player.setVolume(youtubeVolume);
  }
}

console.log('✅ Display.js with Emote Counter loaded');