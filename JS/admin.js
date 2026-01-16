/*************************************************
 * admin.js - HiQo Karaoke Admin Panel
 * ✅ System Control (Display & Video Panel Status)
 * ✅ Audio Control (YouTube & Mic Volume)
 * ✅ Live Reaction (Admin Emotes)
 * ✅ Complete Queue Management
 *************************************************/

console.log('🚀 Admin Redesign JS Loading...');

// ========= GLOBAL STATE =========
let queueRef = null;
let roomRef = null;
let emotesRef = null;
let roomId = null;
let dragSourceKey = null;
let displayStatusListener = null;
let cameraStatusListener = null;
let totalRequestCount = 0;

// ========= SESSION COUNTER =========
let sessionStartTime = null;

function initSessionCounter() {
  const savedCount = sessionStorage.getItem('adminRequestCount');
  if (savedCount) {
    totalRequestCount = parseInt(savedCount, 10);
  } else {
    totalRequestCount = 0;
    sessionStorage.setItem('adminRequestCount', '0');
  }
  sessionStartTime = Date.now();
  updateTotalRequestDisplay();
}

function incrementRequestCount() {
  totalRequestCount++;
  sessionStorage.setItem('adminRequestCount', totalRequestCount.toString());
  updateTotalRequestDisplay();
}

function resetRequestCount() {
  totalRequestCount = 0;
  sessionStorage.setItem('adminRequestCount', '0');
  updateTotalRequestDisplay();
}

function updateTotalRequestDisplay() {
  const countEl = document.getElementById('total-request-count');
  if (countEl) {
    countEl.textContent = totalRequestCount;
  }
}

// ========= WAIT FOR DOM =========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

// ========= INIT ADMIN =========
async function initAdmin() {
  console.log('🚀 Initializing Admin Panel...');

  if (!window.RoomManager) {
    console.error('❌ RoomManager not found');
    await customError('RoomManager tidak ditemukan. Silakan refresh halaman.');
    return;
  }

  const params = new URLSearchParams(location.search);
  roomId = params.get('room') || localStorage.getItem('karaoke_room_id');

  if (!roomId) {
    console.error('❌ Room ID not found');
    await customError('Room ID tidak ditemukan. Kembali ke beranda.');
    location.href = 'index.html';
    return;
  }

  localStorage.setItem('karaoke_room_id', roomId);
  console.log('✅ Room ID:', roomId);

  if (!RoomManager.initRoomSystem()) {
    console.error('❌ Failed to init room');
    await customError('Gagal menginisialisasi sistem room.');
    return;
  }

  // Get Firebase references
  queueRef = RoomManager.getQueueRef();
  roomRef = RoomManager.getRoomRef();
  emotesRef = roomRef.child('emotes');
  
  if (!queueRef || !roomRef) {
    console.error('❌ Firebase refs not available');
    await customError('Tidak dapat terhubung ke database.');
    return;
  }

  console.log('✅ Firebase refs ready');
  
  // Initialize session counter
  initSessionCounter();
  
  // Initialize features
  setupQueueListener();
  setupSystemStatusMonitoring();
  setupAudioControls();
  setupQRCode();
  setupKeyboard();
  setupLogout();
  
  console.log('✅ Admin system ready');
}

// ========= 🎛️ SYSTEM STATUS MONITORING =========
function setupSystemStatusMonitoring() {
  console.log('📊 Setting up system status monitoring...');
  
  const videoSessionRef = roomRef.child('videoSession');
  
  // Monitor Display Status
  roomRef.child('displayStatus').on('value', (snapshot) => {
    const status = snapshot.val();
    updateDisplayStatus(status === 'active');
  });
  
  // Monitor Video Panel Status (Camera)
  videoSessionRef.child('cameraStatus').on('value', (snapshot) => {
    const status = snapshot.val();
    updateCameraStatus(status === 'connected');
  });
  
  console.log('✅ Status monitoring active');
}

function updateDisplayStatus(isOnline) {
  const dot = document.getElementById('display-status-dot');
  const text = document.getElementById('display-status-text');
  
  if (dot && text) {
    if (isOnline) {
      dot.classList.add('online');
      text.textContent = 'ON';
      text.classList.add('online');
      text.classList.remove('offline');
    } else {
      dot.classList.remove('online');
      text.textContent = 'OFF';
      text.classList.add('offline');
      text.classList.remove('online');
    }
  }
}

function updateCameraStatus(isOnline) {
  const dot = document.getElementById('camera-status-dot');
  const text = document.getElementById('camera-status-text');
  
  if (dot && text) {
    if (isOnline) {
      dot.classList.add('online');
      text.textContent = 'ON';
      text.classList.add('online');
      text.classList.remove('offline');
    } else {
      dot.classList.remove('online');
      text.textContent = 'OFF';
      text.classList.add('offline');
      text.classList.remove('online');
    }
  }
}

// ========= 🔊 AUDIO CONTROLS =========
function setupAudioControls() {
  console.log('🔊 Setting up audio controls...');
  
  // YouTube Volume Control
  const youtubeVolume = document.getElementById('youtube-volume');
  const youtubeVolumeValue = document.getElementById('youtube-volume-value');
  
  if (youtubeVolume && youtubeVolumeValue) {
    // Load saved volume
    roomRef.child('audioControl/youtubeVolume').once('value', (snapshot) => {
      const savedVolume = snapshot.val() || 100;
      youtubeVolume.value = savedVolume;
      youtubeVolumeValue.textContent = savedVolume;
    });
    
    // Update on slider change
    youtubeVolume.addEventListener('input', (e) => {
      const volume = e.target.value;
      youtubeVolumeValue.textContent = volume;
      
      // Save to Firebase
      roomRef.child('audioControl/youtubeVolume').set(parseInt(volume));
      
      console.log('🎵 YouTube volume:', volume);
    });
  }
  
  // Microphone Volume Control
  const micVolume = document.getElementById('mic-volume');
  const micVolumeValue = document.getElementById('mic-volume-value');
  
  if (micVolume && micVolumeValue) {
    // Load saved volume
    roomRef.child('audioControl/micVolume').once('value', (snapshot) => {
      const savedVolume = snapshot.val() || 100;
      micVolume.value = savedVolume;
      micVolumeValue.textContent = savedVolume;
    });
    
    // Update on slider change
    micVolume.addEventListener('input', (e) => {
      const volume = e.target.value;
      micVolumeValue.textContent = volume;
      
      // Save to Firebase
      roomRef.child('audioControl/micVolume').set(parseInt(volume));
      
      console.log('🎤 Mic volume:', volume);
    });
  }
  
  console.log('✅ Audio controls ready');
}

// ========= 🎭 SEND ADMIN EMOTE =========
window.sendAdminEmote = async function(emoji, emoteName) {
  console.log('🎭 Admin sending emote:', emoji, emoteName);
  
  try {
    const emoteData = {
      name: 'Admin',
      emote: emoji,
      emoteName: emoteName,
      timestamp: Date.now(),
      isAdmin: true
    };
    
    await emotesRef.push(emoteData);
    
    console.log('✅ Admin emote sent');
    
  } catch (error) {
    console.error('❌ Failed to send emote:', error);
  }
};

// ========= QR CODE =========
function setupQRCode() {
  console.log('📱 Setting up QR code...');
  
  try {
    RoomManager.generateRoomQR();
    console.log('✅ QR code generated');
  } catch (error) {
    console.error('❌ QR error:', error);
  }
}

// ========= QUEUE LISTENER =========
function setupQueueListener() {
  console.log('👂 Setting up queue listener...');
  
  queueRef.orderByChild('order').on('value', (snapshot) => {
    console.log('📊 Queue updated, items:', snapshot.numChildren());
    renderQueue(snapshot);
  }, (error) => {
    console.error('❌ Listener error:', error);
  });
  
  // Listen for new user requests (not admin manual)
  queueRef.on('child_added', (snapshot) => {
    const data = snapshot.val();
    // Only increment for user requests (not admin manual)
    // Only count requests created during this session
    if (data && data.deviceId && data.deviceId !== 'ADMIN-MANUAL') {
      if (data.createdAt && sessionStartTime && data.createdAt > sessionStartTime) {
        console.log('🎵 User request detected:', data.name);
        incrementRequestCount();
      }
    }
  }, (error) => {
    console.error('❌ Child added listener error:', error);
  });
}

// ========= RENDER QUEUE =========
function renderQueue(snapshot) {
  console.log('🎨 Rendering queue...');
  
  const list = document.getElementById('queue-list');
  const nowSection = document.getElementById('now-playing-section');
  const count = document.getElementById('queue-count');
  const totalCount = document.getElementById('total-count');

  if (!list || !nowSection) {
    console.error('❌ DOM elements not found');
    return;
  }

  list.innerHTML = '';

  if (!snapshot.exists()) {
    console.log('📭 Queue empty');
    
    // Empty Now Playing
    nowSection.innerHTML = `
      <div class="now-playing-placeholder">
        <div class="placeholder-icon">🎵</div>
        <p>Belum ada lagu yang diputar</p>
      </div>
    `;
    
    // Empty Queue List
    list.innerHTML = `
      <div class="empty-queue">
        <div class="empty-icon">📭</div>
        <p>Belum ada antrean</p>
      </div>
    `;
    
    if (count) count.textContent = '0';
    if (totalCount) totalCount.textContent = '0';
    return;
  }

  const items = [];
  snapshot.forEach((child) => {
    items.push({ key: child.key, ...child.val() });
  });

  console.log(`✅ ${items.length} items in queue`);

  if (count) count.textContent = items.length;
  if (totalCount) totalCount.textContent = items.length;

  // NOW PLAYING (First Item)
  const first = items[0];
  nowSection.innerHTML = `
    <div class="now-playing-active">
      <img src="img/karaoke.jpg.avif" alt="Karaoke" class="karaoke-cover">
      <div class="now-playing-info">
        <div class="song-number">1. ${first.name}</div>
        <div class="song-title">Sedang Bernyanyi</div>
        <div class="song-artist">Device: ${(first.deviceId || 'Unknown').substring(0, 15)}</div>
        <button class="skip-btn" onclick="skipCurrent()">
          <img src="img/next.png" alt="Next" style="width: 18px; height: 18px;">
          <span>Skip Karaoke ini</span>
        </button>
      </div>
    </div>
  `;

  // WAITING LIST (Rest of Items)
  const waitList = items.slice(1);
  
  if (waitList.length === 0) {
    list.innerHTML = `
      <div class="empty-queue">
        <div class="empty-icon">✅</div>
        <p>Tidak ada antrean selanjutnya</p>
      </div>
    `;
  } else {
    waitList.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'queue-item';
      div.draggable = true;

      // Drag events
      div.addEventListener('dragstart', () => {
        dragSourceKey = item.key;
        console.log('🎯 Drag start:', item.key);
      });
      
      div.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      
      div.addEventListener('drop', () => {
        if (dragSourceKey && dragSourceKey !== item.key) {
          console.log('📍 Drop on:', item.key);
          swapOrder(dragSourceKey, item.key);
        }
        dragSourceKey = null;
      });

      div.innerHTML = `
        <div class="drag-handle">☰</div>
        <div class="queue-number">${i + 2}</div>
        <div class="queue-details">
          <h4>${item.name}</h4>
          <p>Device: ${(item.deviceId || 'Manual').substring(0, 15)}</p>
        </div>
        <button class="delete-btn" onclick="deleteFromQueue('${item.key}')">
          <span>🗑️</span>
          <span>Hapus</span>
        </button>
      `;

      list.appendChild(div);
    });
  }
  
  console.log('✅ Render complete');
}

// ========= VALIDATE YOUTUBE EMBED =========
async function validateYouTubeEmbed(videoId) {
  try {
    console.log('🔍 Checking embed status for:', videoId);
    
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oEmbedUrl);
    
    if (response.ok) {
      console.log('✅ Video can be embedded');
      return { canEmbed: true, reason: null };
    } else {
      console.warn('⚠️ Video cannot be embedded');
      return { 
        canEmbed: false, 
        reason: 'Video ini tidak mengizinkan embed. Kemungkinan pemilik video menonaktifkan fitur embed atau ada pembatasan copyright.'
      };
    }
  } catch (error) {
    console.error('❌ Embed check failed:', error);
    return { canEmbed: true, reason: null };
  }
}

// ========= ADD MANUAL =========
window.addManual = async function() {
  console.log('➕ Add manual triggered');
  
  const nameInput = document.getElementById('admin-name');
  const linkInput = document.getElementById('admin-link');

  if (!nameInput || !linkInput) {
    console.error('❌ Input elements not found');
    await customError('Input tidak ditemukan.');
    return;
  }

  const name = nameInput.value.trim();
  const link = linkInput.value.trim();

  if (!name || !link) {
    await customWarning('Nama & link wajib diisi!', 'Data Tidak Lengkap');
    return;
  }

  const videoId = extractVideoId(link);
  if (!videoId) {
    await customError('Link YouTube tidak valid!', 'Format Salah');
    return;
  }

  console.log('✅ Video ID extracted:', videoId);

  // Validate embed
  const embedCheck = await validateYouTubeEmbed(videoId);
  
  if (!embedCheck.canEmbed) {
    const proceed = await customConfirm(
      `⚠️ ${embedCheck.reason}\n\nVideo ini kemungkinan besar TIDAK AKAN BISA DIPUTAR di display.\n\nApakah Anda tetap ingin menambahkannya?`,
      {
        title: 'Video Mungkin Bermasalah',
        icon: '⚠️',
        confirmText: 'Tetap Tambahkan',
        cancelText: 'Batal',
        confirmClass: 'custom-modal-btn-danger'
      }
    );
    
    if (!proceed) {
      console.log('❌ User cancelled due to embed warning');
      return;
    }
  }

  console.log('✅ Adding:', name, videoId);

  queueRef.once('value', async (snap) => {
    let max = 0;
    
    if (snap.exists()) {
      snap.forEach((child) => {
        const order = child.val().order || 0;
        max = Math.max(max, order);
      });
    }

    queueRef.push({
      name: name,
      videoId: videoId,
      order: max + 1,
      deviceId: 'ADMIN-MANUAL',
      createdAt: Date.now()
    }, async (error) => {
      if (error) {
        console.error('❌ Add failed:', error);
        await customError(`Gagal menambahkan lagu: ${error.message}`, 'Gagal Menambahkan');
      } else {
        console.log('✅ Added successfully');
        incrementRequestCount();
        await customSuccess(`Lagu "${name}" berhasil ditambahkan ke antrean!`, 'Berhasil!');
        nameInput.value = '';
        linkInput.value = '';
        nameInput.focus();
      }
    });
  }).catch(async (error) => {
    console.error('❌ Database error:', error);
    await customError(`Error database: ${error.message}`);
  });
};

// ========= DELETE =========
window.deleteFromQueue = async function(key) {
  console.log('🗑️ Delete:', key);
  
  const result = await customConfirm(
    'Lagu ini akan dihapus dari antrean.', 
    {
      title: 'Hapus Lagu?',
      icon: '🗑️',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      confirmClass: 'custom-modal-btn-danger'
    }
  );
  
  if (!result) return;

  queueRef.child(key).remove()
    .then(async () => {
      console.log('✅ Deleted');
      await customSuccess('Lagu berhasil dihapus!', 'Berhasil');
    })
    .catch(async (error) => {
      console.error('❌ Delete error:', error);
      await customError(`Gagal hapus: ${error.message}`);
    });
};

// ========= SKIP CURRENT =========
window.skipCurrent = async function() {
  console.log('⏭️ Skip triggered');
  
  const result = await customConfirm(
    'Lagu yang sedang diputar akan dilewati.', 
    {
      title: 'Skip Lagu?',
      icon: '⏭️',
      confirmText: 'Ya, Skip',
      cancelText: 'Batal'
    }
  );
  
  if (!result) return;

  queueRef.orderByChild('order').limitToFirst(1).once('value', async (snap) => {
    if (!snap.exists()) {
      await customWarning('Tidak ada lagu yang sedang diputar.', 'Tidak Ada Lagu');
      return;
    }

    snap.forEach((child) => {
      queueRef.child(child.key).remove()
        .then(async () => {
          console.log('✅ Skipped');
          await customSuccess('Lagu berhasil di-skip!', 'Berhasil!');
        })
        .catch(async (error) => {
          console.error('❌ Skip error:', error);
          await customError(`Gagal skip: ${error.message}`);
        });
    });
  }).catch(async (error) => {
    console.error('❌ Database error:', error);
    await customError(`Error: ${error.message}`);
  });
};

// ========= RESET ALL =========
window.resetAllQueue = async function() {
  console.log('🗑️ Reset all triggered');
  
  const result = await customConfirm(
    'SEMUA lagu dalam antrean akan dihapus!\n\nTindakan ini tidak dapat dibatalkan.', 
    {
      title: 'Reset Semua Antrean?',
      icon: '⚠️',
      confirmText: 'Ya, Hapus Semua',
      cancelText: 'Batal',
      confirmClass: 'custom-modal-btn-danger'
    }
  );
  
  if (!result) return;

  queueRef.remove()
    .then(async () => {
      console.log('✅ Reset complete');
      await customSuccess('Semua antrean berhasil dihapus!', 'Reset Selesai');
    })
    .catch(async (error) => {
      console.error('❌ Reset error:', error);
      await customError(`Gagal reset: ${error.message}`);
    });
};

// ========= DRAG & DROP =========
function swapOrder(sourceKey, targetKey) {
  console.log('🔄 Swapping:', sourceKey, '↔️', targetKey);
  
  queueRef.once('value', async (snap) => {
    const data = snap.val();
    
    if (!data || !data[sourceKey] || !data[targetKey]) {
      console.error('❌ Invalid keys');
      return;
    }

    const updates = {};
    updates[`${sourceKey}/order`] = data[targetKey].order;
    updates[`${targetKey}/order`] = data[sourceKey].order;
    
    queueRef.update(updates)
      .then(() => {
        console.log('✅ Order swapped');
      })
      .catch(async (error) => {
        console.error('❌ Swap error:', error);
        await customError(`Gagal ubah urutan: ${error.message}`);
      });
  }).catch(async (error) => {
    console.error('❌ Database error:', error);
    await customError(`Error: ${error.message}`);
  });
}

// ========= UTIL =========
function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

// ========= KEYBOARD =========
function setupKeyboard() {
  const name = document.getElementById('admin-name');
  const link = document.getElementById('admin-link');

  if (name) {
    name.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (link) link.focus();
      }
    });
  }

  if (link) {
    link.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.addManual();
      }
    });
  }
}

// ========= LOGOUT =========
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const result = await customConfirm(
        'Anda akan keluar dari panel admin. Anda perlu login kembali untuk mengakses panel ini.', 
        {
          title: 'Konfirmasi Logout',
          icon: 'img/log-out.png',
          confirmText: 'Ya, Logout',
          cancelText: 'Batal',
          confirmClass: 'custom-modal-btn-danger'
        }
      );
      
      if (result) {
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('loginTime');
        sessionStorage.removeItem('adminRequestCount');
        
        await customSuccess('Logout berhasil! Anda akan diarahkan ke halaman login.', 'Sampai Jumpa!');
        
        setTimeout(() => {
          window.location.replace(`admin-login.html?room=${roomId}`);
        }, 1500);
      }
    });
  }
}

// ========= CLEANUP ON UNLOAD =========
window.addEventListener('beforeunload', () => {
  if (displayStatusListener) displayStatusListener.off();
  if (cameraStatusListener) cameraStatusListener.off();
});

console.log('✅ Admin-redesign.js loaded');