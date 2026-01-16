/*************************************************
 * VIDEO-PANEL.JS - ULTIMATE FIXED VERSION
 * ✅ Simple initialization
 * ✅ All functions immediately available
 * ✅ Proper error handling
 * ✅ Works with event handlers in HTML
 * ✅ Mute/unmute audio functionality
 * ✅ Uses camera-login.html for authentication
 *************************************************/

console.log('🎥 ========================================');
console.log('🎥 VIDEO-PANEL.JS LOADING...');
console.log('🎥 ========================================');

// ========= GET ROOM ID IMMEDIATELY =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

if (!roomId) {
  console.error('❌ No room ID found!');
  alert('Room ID tidak ditemukan!');
  window.location.href = 'index.html';
  throw new Error('No room ID');
}

console.log('✅ Room ID:', roomId);

// ========= CHECK AUTHENTICATION =========
const isVideoPanelAuth = sessionStorage.getItem("videoPanelAuth") === "authenticated";
const videoPanelToken = sessionStorage.getItem("videoPanel_token");

if (!isVideoPanelAuth || !videoPanelToken) {
  console.warn('⚠️ Unauthorized video panel access! Redirecting to login...');
  window.location.replace(`camera-login.html?room=${roomId}`);
  throw new Error("Unauthorized");
}

console.log('✅ Video Panel authentication verified');

// ========= GLOBAL STATE (EXPOSED TO WINDOW) =========
window.videoSessionRef = null;
window.localStream = null;
window.peerConnection = null;
window.mediaRecorder = null;
window.recordedChunks = [];
window.recordingStartTime = null;
window.recordingInterval = null;
window.currentFacingMode = 'user';
window.isCameraActive = false;
window.isRecording = false;
window.isAudioMuted = false;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// ========= WAIT FOR DEPENDENCIES =========
let dependenciesReady = false;

function checkDependencies() {
  const hasFirebase = typeof window.db !== 'undefined';
  const hasRoomManager = typeof window.RoomManager !== 'undefined';
  
  console.log('🔍 Checking dependencies...');
  console.log('   Firebase DB:', hasFirebase ? 'YES' : 'NO');
  console.log('   RoomManager:', hasRoomManager ? 'YES' : 'NO');
  
  if (hasFirebase && hasRoomManager) {
    console.log('✅ All dependencies ready!');
    dependenciesReady = true;
    initializeFirebase();
    return true;
  }
  
  console.log('⏳ Waiting for dependencies...');
  return false;
}

// ========= INITIALIZE FIREBASE =========
function initializeFirebase() {
  try {
    if (!RoomManager.initRoomSystem()) {
      console.error('❌ Room system init failed');
      return false;
    }
    
    window.videoSessionRef = db.ref(`karaoke/room/${roomId}/videoSession`);
    console.log('✅ Firebase reference initialized');
    console.log('   Path:', `karaoke/room/${roomId}/videoSession`);
    return true;
  } catch (error) {
    console.error('❌ Firebase init error:', error);
    return false;
  }
}

// ========= UPDATE MUTE UI =========
function updateMuteUI() {
  const muteBtn = document.getElementById('mute-btn');
  const muteIcon = document.getElementById('mute-icon');
  const muteText = document.getElementById('mute-text');
  
  if (!muteBtn || !muteIcon || !muteText) {
    console.log('🎤 Mute UI elements not found (waiting for DOM...)');
    return;
  }
  
  if (window.isAudioMuted) {
    muteBtn.classList.add('muted');
    muteIcon.src = 'img/mute.png';
    muteText.textContent = 'Hidupkan Mic Video';
    muteBtn.title = 'Hidupkan Mic/Video';
    console.log('✅ UI updated: MUTED');
  } else {
    muteBtn.classList.remove('muted');
    muteIcon.src = 'img/microphone.png';
    muteText.textContent = 'Matikan Mic Video';
    muteBtn.title = 'Matikan Mic/Video';
    console.log('✅ UI updated: UNMUTED');
  }
}

// ========= TOGGLE MUTE FUNCTION =========
window.toggleMute = async function() {
  console.log('🎤 ========================================');
  console.log('🎤 TOGGLE MUTE CALLED!');
  console.log('🎤 Current state:', window.isAudioMuted ? 'MUTED' : 'UNMUTED');
  console.log('🎤 ========================================');
  
  if (!window.localStream) {
    console.error('❌ No local stream available');
    await customWarning('Kamera belum aktif!\n\nSilakan aktifkan kamera terlebih dahulu.', 'Peringatan');
    return;
  }
  
  try {
    const audioTracks = window.localStream.getAudioTracks();
    
    if (audioTracks.length === 0) {
      console.error('❌ No audio tracks found');
      await customError('Tidak ada audio track pada kamera!', 'Audio Error');
      return;
    }
    
    console.log('🎤 Audio tracks found:', audioTracks.length);
    
    // Toggle mute state
    window.isAudioMuted = !window.isAudioMuted;
    
    // Apply mute to ALL audio tracks
    audioTracks.forEach((track, index) => {
      track.enabled = !window.isAudioMuted;
      console.log(`🎤 Track ${index + 1}: enabled = ${track.enabled}`);
    });
    
    // Update UI
    updateMuteUI();
    
    // Show custom modal
    if (window.isAudioMuted) {
      console.log('');
      console.log('🔇 ========================================');
      console.log('🔇 AUDIO MUTED (MIC OFF)');
      console.log('🔇 ========================================');
      console.log('');
      await customSuccess(
        'Mikrofon DIMATIKAN\n\nSuara Anda tidak akan terdengar di display.',
        { title: 'Mic OFF', icon: 'img/mute.png' }
      );
    } else {
      console.log('');
      console.log('🔊 ========================================');
      console.log('🔊 AUDIO UNMUTED (MIC ON)');
      console.log('🔊 ========================================');
      console.log('');
      await customSuccess(
        'Mikrofon DINYALAKAN\n\nSuara Anda akan terdengar di display.',
        { title: 'Mic ON', icon: 'img/voice-search.png' }
      );
    }
    
  } catch (error) {
    console.error('❌ Toggle mute error:', error);
    await customError('Gagal mengubah status mic:\n\n' + error.message, 'Error');
  }
};

// ========= UPDATE STATUS UI =========
function updateStatusUI(status) {
  const statusText = document.getElementById('connection-status');
  const statusDot = document.getElementById('status-dot');
  
  if (status === 'online') {
    if (statusText) statusText.textContent = 'Online';
    if (statusDot) statusDot.classList.add('online');
  } else {
    if (statusText) statusText.textContent = 'Offline';
    if (statusDot) statusDot.classList.remove('online');
  }
}

// ========= START CAMERA (MAIN FUNCTION) =========
window.startCamera = async function() {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 START CAMERA FUNCTION CALLED!');
  console.log('🚀 ========================================');
  
  const startBtn = document.getElementById('start-camera-btn');
  const overlay = document.getElementById('camera-overlay');
  const video = document.getElementById('local-video');
  
  try {
    // Check dependencies
    if (!dependenciesReady) {
      console.log('⏳ Dependencies not ready, checking now...');
      
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Menunggu sistem...';
      }
      
      // Wait for dependencies (max 5 seconds)
      let attempts = 0;
      while (!checkDependencies() && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!dependenciesReady) {
        throw new Error('Sistem belum siap. Silakan refresh halaman (F5) dan tunggu beberapa detik.');
      }
    }
    
    console.log('✅ Dependencies ready, proceeding...');
    
    // Update button state
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = 'Memulai kamera...';
    }
    
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser tidak mendukung kamera!\n\nGunakan browser terbaru:\n- Chrome\n- Firefox\n- Safari\n\nPastikan akses via HTTPS!');
    }
    
    console.log('📱 Requesting camera permission...');
    
    // Request camera access with detailed constraints
    const constraints = {
      video: {
        facingMode: window.currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: true
    };
    
    console.log('📋 Camera constraints:', constraints);
    
    window.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    console.log('✅ Camera ACCESS GRANTED!');
    console.log('   Video tracks:', window.localStream.getVideoTracks().length);
    console.log('   Audio tracks:', window.localStream.getAudioTracks().length);
    
    // Validate video element
    if (!video) {
      throw new Error('Video element tidak ditemukan di halaman!');
    }
    
    console.log('📺 Setting video source...');
    video.srcObject = window.localStream;
    
    // Try to play video
    try {
      await video.play();
      console.log('✅ Video playing successfully');
    } catch (playError) {
      console.warn('⚠️ Auto-play blocked, trying manual play...');
      video.play().catch(function(e) {
        console.log('Manual play error (can be ignored):', e);
      });
    }
    
    // Hide overlay
    if (overlay) {
      overlay.classList.add('hidden');
      console.log('✅ Overlay hidden');
    }
    
    // Update UI state
    window.isCameraActive = true;
    console.log('✅ Camera active state set to TRUE');
    
    // Update buttons
    if (startBtn) startBtn.style.display = 'none';
    
    const stopBtn = document.getElementById('stop-camera-btn');
    if (stopBtn) {
      stopBtn.style.display = 'inline-flex';
      console.log('✅ Stop button shown');
    }
    
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) {
      recordBtn.disabled = false;
      console.log('✅ Record button enabled');
    }
    
    const flipBtn = document.getElementById('flip-camera-btn');
    if (flipBtn) {
      flipBtn.disabled = false;
      console.log('✅ Flip button enabled');
    }
    
    // Enable mute button
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.disabled = false;
      console.log('✅ Mute button enabled');
    }
    
    // Update status UI
    updateStatusUI('online');
    
    console.log('📡 Setting up WebRTC for streaming...');
    
    // Setup WebRTC
    await setupWebRTC();
    
    // Update Firebase status
    if (window.videoSessionRef) {
      await window.videoSessionRef.child('cameraStatus').set('connected');
      console.log('✅ Firebase status updated: connected');
    }
    
    const streamText = document.getElementById('streaming-status');
    if (streamText) {
      streamText.textContent = 'Aktif (Streaming ke Display)';
      console.log('✅ Streaming status text updated');
    }
    
    console.log('');
    console.log('🎉 ========================================');
    console.log('🎉 CAMERA FULLY ACTIVE & STREAMING!');
    console.log('🎉 ========================================');
    console.log('');
    
    // Success notification
    if (typeof customSuccess === 'function') {
      await customSuccess(
        'Kamera berhasil diaktifkan!\n\nStreaming ke display aktif\nSiap merekam',
        { title: 'Kamera Aktif', icon: '🎥' }
      );
    } else {
      alert('✅ Kamera berhasil diaktifkan dan streaming ke display!');
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ CAMERA ERROR!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('');
    
    handleCameraError(error, startBtn);
  }
};

// ========= HANDLE CAMERA ERRORS =========
function handleCameraError(error, startBtn) {
  // Reset button
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = 'Aktifkan Kamera';
    startBtn.style.display = 'inline-flex';
  }
  
  let message = '❌ Gagal mengakses kamera!\n\n';
  let title = 'Error Kamera';
  
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    title = 'Izin Kamera Ditolak';
    message += 'Anda menolak akses kamera!\n\n';
    message += 'CARA MEMPERBAIKI:\n\n';
    message += '1. Klik ikon GEMBOK di address bar\n';
    message += '2. Cari Camera atau Kamera\n';
    message += '3. Ubah dari Block ke Allow\n';
    message += '4. Refresh halaman (F5)\n';
    message += '5. Klik Aktivate Kamera lagi\n\n';
    message += 'Pastikan tidak ada aplikasi lain yang pakai kamera!';
  } 
  else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    title = 'Kamera Tidak Ditemukan';
    message += 'Device ini tidak memiliki kamera!\n\n';
    message += 'Kemungkinan:\n';
    message += '- Device tidak ada kamera built-in\n';
    message += '- Kamera eksternal tidak terpasang\n';
    message += '- Kamera rusak/disabled';
  }
  else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    title = 'Kamera Sedang Digunakan';
    message += 'Kamera tidak dapat diakses!\n\n';
    message += 'SOLUSI:\n\n';
    message += '1. Tutup aplikasi lain (Zoom, Skype, dll)\n';
    message += '2. Restart browser\n';
    message += '3. Jika masih error, restart komputer';
  }
  else {
    message += 'Error: ' + error.message + '\n\n';
    message += 'SOLUSI UMUM:\n\n';
    message += '1. Refresh halaman (F5)\n';
    message += '2. Gunakan browser terbaru\n';
    message += '3. Pastikan akses via HTTPS';
  }
  
  // Show error modal
  if (typeof customError === 'function') {
    customError(message, title);
  } else {
    alert(title + '\n\n' + message);
  }
}

// ========= SETUP WEBRTC =========
async function setupWebRTC() {
  try {
    console.log('🔗 Creating peer connection...');
    
    window.peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream tracks
    window.localStream.getTracks().forEach(function(track) {
      window.peerConnection.addTrack(track, window.localStream);
      console.log('➕ Added track to peer:', track.kind);
    });
    
    // Handle ICE candidates
    window.peerConnection.onicecandidate = function(event) {
      if (event.candidate && window.videoSessionRef) {
        window.videoSessionRef.child('cameraCandidates').push(event.candidate.toJSON());
        console.log('📤 ICE candidate sent');
      }
    };
    
    // Create and send offer
    const offer = await window.peerConnection.createOffer();
    await window.peerConnection.setLocalDescription(offer);
    
    if (window.videoSessionRef) {
      await window.videoSessionRef.child('offer').set(window.peerConnection.localDescription.toJSON());
      console.log('📤 Offer sent to display');
    }
    
    // Listen for answer
    if (window.videoSessionRef) {
      window.videoSessionRef.child('answer').on('value', async function(snapshot) {
        if (!snapshot.exists() || !window.peerConnection || window.peerConnection.currentRemoteDescription) {
          return;
        }
        
        try {
          const answer = snapshot.val();
          await window.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('📩 Answer received and set');
        } catch (e) {
          console.error('Error setting remote description:', e);
        }
      });
      
      // Listen for ICE candidates from display
      window.videoSessionRef.child('displayCandidates').on('child_added', async function(snapshot) {
        if (!window.peerConnection || !snapshot.val()) return;
        
        try {
          await window.peerConnection.addIceCandidate(new RTCIceCandidate(snapshot.val()));
          console.log('✅ Display ICE candidate added');
        } catch (e) {
          console.error('Error adding display ICE candidate:', e);
        }
      });
    }
    
    console.log('✅ WebRTC setup complete');
    
  } catch (error) {
    console.error('❌ WebRTC setup error:', error);
  }
}

// ========= STOP CAMERA =========
window.stopCamera = async function() {
  console.log('⏹️ Stop camera called');
  
  let confirmed = await customConfirm(
    'Kamera akan dimatikan dan streaming akan berhenti.\n\nYakin ingin melanjutkan?',
    {
      title: 'Stop Kamera?',
      confirmText: 'Ya, Stop',
      cancelText: 'Batal'
    }
  );
  
  if (!confirmed) return;
  
  try {
    // Stop recording if active
    if (window.isRecording) {
      stopRecording();
    }
    
    // Stop all tracks
    if (window.localStream) {
      window.localStream.getTracks().forEach(function(track) {
        track.stop();
        console.log('⏹️ Track stopped:', track.kind);
      });
      window.localStream = null;
    }
    
    // Close peer connection
    if (window.peerConnection) {
      window.peerConnection.close();
      window.peerConnection = null;
      console.log('⏹️ Peer connection closed');
    }
    
    // Clear video
    const video = document.getElementById('local-video');
    if (video) video.srcObject = null;
    
    // Show overlay
    const overlay = document.getElementById('camera-overlay');
    if (overlay) overlay.classList.remove('hidden');
    
    // Update state
    window.isCameraActive = false;
    
    // Update UI
    const startBtn = document.getElementById('start-camera-btn');
    if (startBtn) {
      startBtn.style.display = 'inline-flex';
      startBtn.disabled = false;
      startBtn.textContent = 'Aktifkan Kamera';
    }
    
    const stopBtn = document.getElementById('stop-camera-btn');
    if (stopBtn) stopBtn.style.display = 'none';
    
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) recordBtn.disabled = true;
    
    const flipBtn = document.getElementById('flip-camera-btn');
    if (flipBtn) flipBtn.disabled = true;
    
    // Disable mute button
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.disabled = true;
      window.isAudioMuted = false;
      updateMuteUI();
      console.log('✅ Mute button disabled and reset');
    }
    
    updateStatusUI('offline');
    
    const streamText = document.getElementById('streaming-status');
    if (streamText) streamText.textContent = 'Tidak Aktif';
    
    // Clean Firebase
    if (window.videoSessionRef) {
      await window.videoSessionRef.set(null);
      console.log('✅ Firebase session cleared');
    }
    
    console.log('✅ Camera stopped successfully');
    
    await customSuccess('Kamera berhasil dimatikan', 'Selesai');
    
  } catch (error) {
    console.error('❌ Stop camera error:', error);
  }
};

// ========= FLIP CAMERA =========
window.flipCamera = async function() {
  console.log('🔄 Flip camera called');
  
  try {
    window.currentFacingMode = window.currentFacingMode === 'user' ? 'environment' : 'user';
    
    if (window.localStream) {
      window.localStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    
    window.localStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: window.currentFacingMode },
      audio: true
    });
    
    const video = document.getElementById('local-video');
    if (video) video.srcObject = window.localStream;
    
    if (window.peerConnection) {
      const senders = window.peerConnection.getSenders();
      
      const videoTrack = window.localStream.getVideoTracks()[0];
      const audioTrack = window.localStream.getAudioTracks()[0];
      
      const videoSender = senders.find(function(s) {
        return s.track && s.track.kind === 'video';
      });
      const audioSender = senders.find(function(s) {
        return s.track && s.track.kind === 'audio';
      });
      
      if (videoSender && videoTrack) await videoSender.replaceTrack(videoTrack);
      if (audioSender && audioTrack) await audioSender.replaceTrack(audioTrack);
      
      // Re-apply mute state after flip
      if (window.isAudioMuted) {
        const audioTracks = window.localStream.getAudioTracks();
        audioTracks.forEach(function(track) {
          track.enabled = false;
        });
        console.log('🎤 Mute state re-applied after flip');
      }
    }
    
    console.log('✅ Camera flipped to:', window.currentFacingMode);
    
  } catch (error) {
    console.error('❌ Flip error:', error);
    
    await customError('Gagal membalik kamera: ' + error.message, 'Error Flip Camera');
  }
};

// ========= TOGGLE RECORDING =========
window.toggleRecording = function() {
  if (window.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
};

function startRecording() {
  try {
    window.recordedChunks = [];
    
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    };
    
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }
    
    window.mediaRecorder = new MediaRecorder(window.localStream, options);
    
    window.mediaRecorder.ondataavailable = function(event) {
      if (event.data.size > 0) {
        window.recordedChunks.push(event.data);
      }
    };
    
    window.mediaRecorder.onstop = saveRecording;
    
    window.mediaRecorder.start();
    window.isRecording = true;
    
    const btn = document.getElementById('record-btn');
    if (btn) btn.classList.add('recording');
    
    const icon = document.getElementById('record-icon');
    if (icon) {
      icon.innerHTML = '<img src="img/video-record.png" alt="Stop" style="width: 24px; height: 24px;">';
    }
    
    const text = document.getElementById('record-text');
    if (text) text.textContent = 'Stop Rekam';
    
    window.recordingStartTime = Date.now();
    window.recordingInterval = setInterval(updateRecordingTime, 1000);
    
    console.log('🔴 Recording started');
    
  } catch (error) {
    console.error('❌ Recording error:', error);
    alert('Gagal memulai rekaman: ' + error.message);
  }
}

function stopRecording() {
  if (window.mediaRecorder && window.isRecording) {
    window.mediaRecorder.stop();
    window.isRecording = false;
    
    const btn = document.getElementById('record-btn');
    if (btn) btn.classList.remove('recording');
    
    const icon = document.getElementById('record-icon');
    if (icon) {
      icon.innerHTML = '<img src="img/video-record.png" alt="Record" style="width: 24px; height: 24px;">';
    }
    
    const text = document.getElementById('record-text');
    if (text) text.textContent = 'Mulai Rekam';
    
    clearInterval(window.recordingInterval);
    
    console.log('⏹️ Recording stopped');
  }
}

function updateRecordingTime() {
  const elapsed = Math.floor((Date.now() - window.recordingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  const time = document.getElementById('recording-time');
  if (time) {
    time.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }
}

function saveRecording() {
  const blob = new Blob(window.recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'karaoke-' + roomId + '-' + Date.now() + '.webm';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 100);
  
  console.log('💾 Recording saved');
  
  customSuccess('Video berhasil disimpan!', 'Tersimpan');
}

// ========= LOGOUT =========
window.logout = async function() {
  console.log('🚪 Logout called');
  
  let confirmed = await customConfirm(
    'Logout dari Camera Panel?\n\nAnda perlu login kembali untuk mengakses panel ini.',
    {
      title: 'Logout?',
      icon: 'img/log-out.png',
      confirmText: 'Ya, Logout',
      cancelText: 'Batal',
      confirmClass: 'custom-modal-btn-danger'
    }
  );
  
  // User clicked Batal - do nothing, stay on page
  if (!confirmed) {
    console.log('🚪 User cancelled logout, staying on page');
    return;
  }
  
  try {
    if (window.isCameraActive) {
      if (window.isRecording) stopRecording();
      
      if (window.localStream) {
        window.localStream.getTracks().forEach(function(t) {
          t.stop();
        });
        window.localStream = null;
      }
      
      if (window.peerConnection) {
        window.peerConnection.close();
        window.peerConnection = null;
      }
      
      if (window.videoSessionRef) {
        await window.videoSessionRef.set(null);
      }
    }
    
    // Clear ONLY video panel auth tokens (keep bus room token)
    sessionStorage.removeItem('videoPanelAuth');
    sessionStorage.removeItem('videoPanel_token');
    sessionStorage.removeItem('videoPanel_login_time');
    
    await customSuccess('Logout berhasil!', 'Sampai Jumpa!');
    
    setTimeout(function() {
      window.location.replace('bus-menu.html?room=' + roomId);
    }, 1000);
    
  } catch (error) {
    console.error('Logout error:', error);
    // Clear ONLY video panel auth tokens
    sessionStorage.removeItem('videoPanelAuth');
    sessionStorage.removeItem('videoPanel_token');
    sessionStorage.removeItem('videoPanel_login_time');
    window.location.replace('bus-menu.html?room=' + roomId);
  }
};

// ========= CLEANUP ON PAGE UNLOAD =========
window.addEventListener('beforeunload', function() {
  console.log('Page unload - cleaning up...');
  
  if (window.isRecording && window.mediaRecorder) {
    try {
      window.mediaRecorder.stop();
    } catch (e) {
      console.log('Could not stop recording:', e);
    }
  }
  
  if (window.localStream) {
    window.localStream.getTracks().forEach(function(track) {
      try {
        track.stop();
      } catch (e) {
        console.log('Could not stop track:', e);
      }
    });
  }
  
  if (window.peerConnection) {
    try {
      window.peerConnection.close();
    } catch (e) {
      console.log('Could not close peer connection:', e);
    }
  }
  
  if (window.videoSessionRef) {
    window.videoSessionRef.set(null).catch(function() {});
  }
});

// ========= AUTO-CHECK DEPENDENCIES =========
setTimeout(function() {
  console.log('Auto-checking dependencies...');
  checkDependencies();
}, 500);

console.log('');
console.log('✅ VIDEO-PANEL.JS FULLY LOADED!');
console.log('');

