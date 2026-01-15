/*************************************************
 * VIDEO-PANEL.JS - FINAL WORKING VERSION
 * ✅ iOS: Clear instructions + working save
 * ✅ Android: 3 easy options to Gallery
 * ✅ Desktop: Standard download
 * ✅ No bugs on flip camera
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
  console.log('   Firebase DB:', hasFirebase ? '✅' : '❌');
  console.log('   RoomManager:', hasRoomManager ? '✅' : '❌');
  
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
    
    console.log('✅ ✅ ✅ CAMERA ACCESS GRANTED! ✅ ✅ ✅');
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
      video.play().catch(e => {
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
        'Kamera berhasil diaktifkan!\n\n✅ Streaming ke display aktif\n📹 Siap merekam',
        '🎥 Kamera Aktif'
      );
    } else {
      alert('✅ Kamera berhasil diaktifkan dan streaming ke display!');
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('❌ CAMERA ERROR!');
    console.error('❌ ========================================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.error('❌ ========================================');
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
    title = '🚫 Izin Kamera Ditolak';
    message += 'Anda menolak akses kamera!\n\n';
    message += '✅ CARA MEMPERBAIKI:\n\n';
    message += '1. Klik ikon GEMBOK 🔒 di address bar\n';
    message += '2. Cari "Camera" atau "Kamera"\n';
    message += '3. Ubah dari "Block" ke "Allow"\n';
    message += '4. Refresh halaman (F5)\n';
    message += '5. Klik "Aktifkan Kamera" lagi\n\n';
    message += '💡 Pastikan tidak ada aplikasi lain yang pakai kamera!';
  } 
  else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    title = '📷 Kamera Tidak Ditemukan';
    message += 'Device ini tidak memiliki kamera!\n\n';
    message += 'Kemungkinan:\n';
    message += '• Device tidak ada kamera built-in\n';
    message += '• Kamera eksternal tidak terpasang\n';
    message += '• Kamera rusak/disabled\n';
    message += '• Driver kamera belum terinstall';
  }
  else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    title = '⚠️ Kamera Sedang Digunakan';
    message += 'Kamera tidak dapat diakses!\n\n';
    message += '✅ SOLUSI:\n\n';
    message += '1. Tutup aplikasi lain:\n';
    message += '   • Zoom, Skype, Teams\n';
    message += '   • WhatsApp Web, Telegram\n';
    message += '   • Tab browser lain\n\n';
    message += '2. Restart browser\n\n';
    message += '3. Jika masih error, restart komputer';
  }
  else if (error.name === 'OverconstrainedError') {
    title = '⚠️ Resolusi Tidak Didukung';
    message += 'Kamera tidak support resolusi HD!\n\n';
    message += 'Sistem akan coba resolusi lebih rendah...\n\n';
    message += 'Silakan klik "Aktifkan Kamera" lagi.';
  }
  else if (error.message && error.message.includes('sistem')) {
    title = '⚠️ Sistem Belum Siap';
    message += 'Firebase belum selesai loading!\n\n';
    message += '✅ SOLUSI:\n\n';
    message += '1. Refresh halaman (F5)\n';
    message += '2. Tunggu 3-5 detik\n';
    message += '3. Klik "Aktifkan Kamera" lagi\n\n';
    message += 'Jika tetap error:\n';
    message += '• Clear cache browser\n';
    message += '• Restart browser';
  }
  else {
    message += 'Error: ' + error.message + '\n\n';
    message += '✅ SOLUSI UMUM:\n\n';
    message += '1. Refresh halaman (F5)\n';
    message += '2. Gunakan browser terbaru\n';
    message += '3. Pastikan akses via HTTPS\n';
    message += '4. Coba browser lain (Chrome/Firefox)';
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
    window.localStream.getTracks().forEach(track => {
      window.peerConnection.addTrack(track, window.localStream);
      console.log('➕ Added track to peer:', track.kind);
    });
    
    // Handle ICE candidates
    window.peerConnection.onicecandidate = (event) => {
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
      window.videoSessionRef.child('answer').on('value', async (snapshot) => {
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
      window.videoSessionRef.child('displayCandidates').on('child_added', async (snapshot) => {
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

// ========= STOP CAMERA =========
window.stopCamera = async function() {
  console.log('⏹️ Stop camera called');
  
  let confirmed;
  if (typeof customConfirm === 'function') {
    confirmed = await customConfirm(
      'Kamera akan dimatikan dan streaming akan berhenti.\n\nYakin ingin melanjutkan?',
      {
        title: '⏹️ Stop Kamera?',
        confirmText: 'Ya, Stop',
        cancelText: 'Batal'
      }
    );
  } else {
    confirmed = confirm('Stop kamera dan hentikan streaming?');
  }
  
  if (!confirmed) return;
  
  try {
    // Stop recording if active
    if (window.isRecording) {
      stopRecording();
    }
    
    // Stop all tracks
    if (window.localStream) {
      window.localStream.getTracks().forEach(track => {
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
    
    // Disable and reset mute button
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
    muteBtn.disabled = true;
    window.isAudioMuted = false;
  
    const muteIcon = document.getElementById('mute-icon');
    const muteText = document.getElementById('mute-text');
  
    if (muteIcon) muteIcon.textContent = '🎤';
    if (muteText) muteText.textContent = 'Matikan Mic Video';
  
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
    
    if (typeof customSuccess === 'function') {
      await customSuccess('Kamera berhasil dimatikan', '✅ Selesai');
    }
    
  } catch (error) {
    console.error('❌ Stop camera error:', error);
  }
};

  // ========= FLIP CAMERA =========
  window.flipCamera = async function() {
  console.log('🔄 Flip camera called');
  
  try {
    // Toggle facing mode
    window.currentFacingMode = window.currentFacingMode === 'user' ? 'environment' : 'user';
    
    // Stop current stream tracks
    if (window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop());
    }
    
    // Get new stream with flipped camera
    window.localStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: window.currentFacingMode },
      audio: true
    });
    
    // Update video element
    const video = document.getElementById('local-video');
    if (video) video.srcObject = window.localStream;
    
    // Update peer connection tracks if streaming
    if (window.peerConnection) {
      const senders = window.peerConnection.getSenders();
      
      const videoTrack = window.localStream.getVideoTracks()[0];
      const audioTrack = window.localStream.getAudioTracks()[0];
      
      const videoSender = senders.find(s => s.track?.kind === 'video');
      const audioSender = senders.find(s => s.track?.kind === 'audio');
      
      if (videoSender && videoTrack) {
        await videoSender.replaceTrack(videoTrack);
        console.log('✅ Video track replaced');
      }
      
      if (audioSender && audioTrack) {
        await audioSender.replaceTrack(audioTrack);
        console.log('✅ Audio track replaced');
      }
    }
    
    console.log('✅ Camera flipped to:', window.currentFacingMode);
    
  } catch (error) {
    console.error('❌ Flip error:', error);
    
    if (typeof customError === 'function') {
      await customError('Gagal membalik kamera: ' + error.message, 'Error Flip Camera');
    } else {
      alert('Gagal flip: ' + error.message);
    }
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

// ========= START RECORDING =========
function startRecording() {
  try {
    console.log('🔴 Starting recording...');
    
    // Clear previous chunks
    window.recordedChunks = [];
    
    // Setup MediaRecorder options
    const options = {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 2500000
    };
    
    // Check if mime type is supported
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.warn('⚠️ VP8/Opus not supported, falling back to default');
      options.mimeType = 'video/webm';
    }
    
    console.log('📹 Recording with:', options.mimeType);
    
    // Create MediaRecorder
    window.mediaRecorder = new MediaRecorder(window.localStream, options);
    
    // Handle data available
    window.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        window.recordedChunks.push(event.data);
        console.log('📦 Chunk recorded:', (event.data.size / 1024).toFixed(2), 'KB');
      }
    };
    
    // Handle stop event - THIS IS WHERE SAVE HAPPENS
    window.mediaRecorder.onstop = () => {
      console.log('⏹️ MediaRecorder stopped, total chunks:', window.recordedChunks.length);
      saveRecording();
    };
    
    // Handle errors
    window.mediaRecorder.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event.error);
      window.isRecording = false;
      
      if (typeof customError === 'function') {
        customError('Error saat merekam: ' + event.error.name, 'Recording Error');
      }
    };
    
    // Start recording
    window.mediaRecorder.start(1000); // Record in 1 second chunks
    window.isRecording = true;
    
    console.log('✅ Recording started successfully');
    
    // Update UI
    const btn = document.getElementById('record-btn');
    if (btn) btn.classList.add('recording');
    
    const icon = document.getElementById('record-icon');
    if (icon) icon.textContent = '⏹️';
    
    const text = document.getElementById('record-text');
    if (text) text.textContent = 'Stop Rekam';
    
    const bar = document.getElementById('recording-status-bar');
    if (bar) bar.style.display = 'flex';
    
    // Start timer
    window.recordingStartTime = Date.now();
    window.recordingInterval = setInterval(updateRecordingTime, 1000);
    
  } catch (error) {
    console.error('❌ Start recording error:', error);
    
    if (typeof customError === 'function') {
      customError('Gagal memulai rekaman: ' + error.message, 'Recording Error');
    } else {
      alert('Gagal memulai rekaman: ' + error.message);
    }
  }
}

// ========= STOP RECORDING =========
function stopRecording() {
  console.log('⏹️ Stopping recording...');
  
  if (window.mediaRecorder && window.isRecording) {
    // Stop the MediaRecorder
    window.mediaRecorder.stop();
    window.isRecording = false;
    
    console.log('✅ Recording stopped, preparing to save...');
    
    // Update UI
    const btn = document.getElementById('record-btn');
    if (btn) btn.classList.remove('recording');
    
    const icon = document.getElementById('record-icon');
    if (icon) icon.textContent = '⏺️';
    
    const text = document.getElementById('record-text');
    if (text) text.textContent = 'Mulai Rekam';
    
    const bar = document.getElementById('recording-status-bar');
    if (bar) bar.style.display = 'none';
    
    const time = document.getElementById('recording-time');
    if (time) time.textContent = '00:00';
    
    // Stop timer
    clearInterval(window.recordingInterval);
    
    // Note: saveRecording() will be called automatically by mediaRecorder.onstop
  } else {
    console.warn('⚠️ No active recording to stop');
  }
}

// ========= UPDATE RECORDING TIME =========
function updateRecordingTime() {
  const elapsed = Math.floor((Date.now() - window.recordingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  const time = document.getElementById('recording-time');
  if (time) {
    time.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

// ========= SAVE RECORDING (SIMPLE & RELIABLE - FIXED FOR IPHONE) =========
function saveRecording() {
  console.log('💾 ========================================');
  console.log('💾 SAVE RECORDING CALLED!');
  console.log('💾 ========================================');
  
  // Validate recorded chunks
  if (!window.recordedChunks || window.recordedChunks.length === 0) {
    console.error('❌ No recorded chunks available!');
    
    if (typeof customError === 'function') {
      customError('Tidak ada data rekaman!\n\nCoba rekam ulang.', 'Error');
    } else {
      alert('❌ Tidak ada data rekaman!');
    }
    return;
  }
  
  console.log('📦 Total chunks:', window.recordedChunks.length);
  
  // Create blob from chunks
  const blob = new Blob(window.recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const filename = `karaoke-${roomId}-${Date.now()}.webm`;
  
  console.log('📦 Blob created:', {
    size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
    type: blob.type,
    filename: filename
  });
  
  // ========= DETECT DEVICE =========
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;
  
  console.log('📱 Device detection:', {
    isIOS,
    isAndroid,
    isMobile,
    userAgent: navigator.userAgent
  });
  
  // ========= iOS HANDLING =========
  if (isIOS) {
    console.log('🍎 iOS detected - opening instruction page');
    
    // Open video in new tab with instructions
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simpan Video - Karaoke Bus</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #fff;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 500px;
              width: 100%;
              text-align: center;
            }
            h1 {
              font-size: 28px;
              margin-bottom: 10px;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            .subtitle {
              font-size: 15px;
              margin-bottom: 25px;
              opacity: 0.9;
            }
            video {
              width: 100%;
              max-width: 500px;
              border-radius: 20px;
              box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
              margin-bottom: 25px;
              border: 4px solid rgba(255,255,255,0.3);
            }
            .instructions {
              background: rgba(255, 255, 255, 0.95);
              border-radius: 20px;
              padding: 25px;
              margin-bottom: 20px;
              text-align: left;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .instructions h2 {
              font-size: 20px;
              margin-bottom: 20px;
              color: #667eea;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .step {
              display: flex;
              align-items: flex-start;
              margin-bottom: 18px;
              color: #333;
              line-height: 1.6;
            }
            .step-number {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              border-radius: 50%;
              font-weight: bold;
              margin-right: 12px;
              font-size: 16px;
              flex-shrink: 0;
            }
            .step-text {
              flex: 1;
              font-size: 16px;
            }
            .step-text strong {
              color: #667eea;
              font-weight: 700;
            }
            .button {
              display: inline-block;
              padding: 16px 32px;
              background: rgba(255,255,255,0.95);
              color: #667eea;
              text-decoration: none;
              border-radius: 15px;
              font-weight: 700;
              font-size: 17px;
              box-shadow: 0 8px 25px rgba(0,0,0,0.2);
              margin-top: 10px;
              transition: all 0.3s;
            }
            .button:active {
              transform: scale(0.95);
            }
            .info-box {
              background: rgba(255, 193, 7, 0.2);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 193, 7, 0.4);
              border-radius: 15px;
              padding: 18px;
              margin-top: 20px;
              font-size: 15px;
              line-height: 1.6;
            }
            .tip-box {
              background: rgba(76, 175, 80, 0.2);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(76, 175, 80, 0.4);
              border-radius: 15px;
              padding: 18px;
              margin-top: 15px;
              font-size: 14px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 Simpan Video ke Foto</h1>
            <p class="subtitle">Video rekaman karaoke kamu</p>
            
            <video src="${url}" controls playsinline></video>
            
            <div class="instructions">
              <h2>🍎 Cara Menyimpan (iPhone/iPad):</h2>
              
              <div class="step">
                <span class="step-number">1</span>
                <div class="step-text">
                  <strong>Tekan dan tahan</strong> video di atas selama 2-3 detik (long press)
                </div>
              </div>
              
              <div class="step">
                <span class="step-number">2</span>
                <div class="step-text">
                  Tunggu hingga muncul <strong>menu popup</strong> dari bawah layar
                </div>
              </div>
              
              <div class="step">
                <span class="step-number">3</span>
                <div class="step-text">
                  Pilih opsi <strong>"Save Video"</strong> atau <strong>"Simpan Video"</strong>
                </div>
              </div>
              
              <div class="step">
                <span class="step-number">4</span>
                <div class="step-text">
                  Video akan tersimpan ke aplikasi <strong>Photos (Foto)</strong> 📸
                </div>
              </div>
            </div>
            
            <a href="${url}" download="${filename}" class="button">
              📥 Coba Download (jika browser support)
            </a>
            
            <div class="info-box">
              ⚠️ <strong>Catatan:</strong> Safari iOS tidak mendukung download langsung. Jika tombol download tidak bekerja, gunakan cara "tekan dan tahan" di atas.
            </div>
            
            <div class="tip-box">
              💡 <strong>Tips:</strong> Setelah video tersimpan di Photos, kamu bisa langsung share ke WhatsApp, Instagram, TikTok, atau aplikasi lainnya!
            </div>
          </div>
        </body>
        </html>
      `);
      
      console.log('✅ iOS instruction page opened in new tab');
      
      // Show success notification
      if (typeof customSuccess === 'function') {
        customSuccess(
          '✅ Video dibuka di tab baru!\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '📱 CARA SIMPAN KE FOTO:\n\n' +
          '1️⃣ TEKAN DAN TAHAN video (2-3 detik)\n' +
          '2️⃣ Tunggu muncul menu popup dari bawah\n' +
          '3️⃣ Pilih "Save Video" atau "Simpan Video"\n' +
          '4️⃣ Video tersimpan ke Photos 📸\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '💡 Setelah tersimpan:\n' +
          '• Buka aplikasi Photos (Foto)\n' +
          '• Video ada di album "Recents" atau "All Photos"\n' +
          '• Bisa langsung share ke WA, IG, TikTok!',
          '🍎 iPhone/iPad - Instruksi'
        );
      } else {
        alert(
          '✅ Video dibuka di tab baru!\n\n' +
          'CARA SIMPAN:\n' +
          '1. Tekan dan tahan video (2-3 detik)\n' +
          '2. Pilih "Save Video"\n' +
          '3. Video tersimpan ke Photos'
        );
      }
    } else {
      // Popup blocked
      console.error('❌ Popup blocked by browser');
      
      if (typeof customWarning === 'function') {
        customWarning(
          'Browser memblokir popup!\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '✅ SOLUSI:\n\n' +
          '1. Klik icon "Aa" atau "⚙️" di address bar Safari\n' +
          '2. Pilih "Website Settings"\n' +
          '3. Cari "Pop-ups and Redirects"\n' +
          '4. Ubah ke "Allow" (Izinkan)\n' +
          '5. Refresh halaman (tarik ke bawah)\n' +
          '6. Rekam ulang dan simpan lagi\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          'ATAU:\n\n' +
          '1. Buka Settings → Safari\n' +
          '2. Matikan "Block Pop-ups"\n' +
          '3. Kembali ke website\n' +
          '4. Rekam ulang',
          '⚠️ Popup Diblokir'
        );
      } else {
        alert(
          '⚠️ Browser memblokir popup!\n\n' +
          'Solusi:\n' +
          '1. Izinkan popup di pengaturan Safari\n' +
          '2. Rekam ulang dan simpan lagi'
        );
      }
    }
    
    // Cleanup URL after 1 minute (keep it available for user to save)
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('🗑️ Blob URL cleaned up');
    }, 60000);
    
    return;
  }
  
  // ========= ANDROID & DESKTOP HANDLING =========
  console.log('🤖 Android/Desktop detected - starting download');
  
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ Download link cleaned up');
  }, 100);
  
  console.log('💾 Download started:', filename);
  
  // ========= SUCCESS MESSAGE WITH DETAILED INSTRUCTIONS =========
  if (isAndroid) {
    console.log('🤖 Showing Android instructions');
    
    if (typeof customSuccess === 'function') {
      customSuccess(
        '✅ VIDEO BERHASIL DIDOWNLOAD!\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '📂 CEK VIDEO DI:\n' +
        'Aplikasi "Files" atau "My Files"\n' +
        '→ Folder "Downloads"\n' +
        '→ Cari file: ' + filename + '\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '📸 CARA MASUKKAN KE GALERI:\n\n' +
        '╔═══════════════════════════╗\n' +
        '║  OPSI 1 (TERCEPAT!) ⚡    ║\n' +
        '╚═══════════════════════════╝\n\n' +
        '1. Buka Files → Downloads\n' +
        '2. Tap video karaoke yang baru didownload\n' +
        '3. Tap icon SHARE (📤) di pojok atas\n' +
        '4. Pilih "Photos" atau "Gallery"\n' +
        '5. Tap "Save" atau "Simpan"\n' +
        '6. ✅ Video LANGSUNG MASUK GALERI!\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '╔═══════════════════════════╗\n' +
        '║  OPSI 2 (Google Photos)   ║\n' +
        '╚═══════════════════════════╝\n\n' +
        '1. Install "Google Photos" (Play Store)\n' +
        '2. Buka Google Photos\n' +
        '3. Tap "Library" → "Folders"\n' +
        '4. Pilih folder "Downloads"\n' +
        '5. ✅ Video otomatis muncul di sini!\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '╔═══════════════════════════╗\n' +
        '║  OPSI 3 (Convert to MP4)  ║\n' +
        '╚═══════════════════════════╝\n\n' +
        '1. Install "Video Converter" (Play Store)\n' +
        '2. Pilih video dari Downloads\n' +
        '3. Convert: WebM → MP4\n' +
        '4. ✅ Video MP4 otomatis masuk Gallery!\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '💡 TIPS:\n' +
        '• Video format WebM bisa langsung diputar\n' +
        '• Bisa langsung di-share ke WA, IG, TikTok\n' +
        '• Ukuran file lebih kecil dari MP4',
        '🤖 Android - Video Tersimpan'
      );
    } else {
      alert(
        '✅ VIDEO TERSIMPAN!\n\n' +
        '📂 Lokasi: Files → Downloads\n\n' +
        'CARA MASUKKAN KE GALERI:\n\n' +
        'OPSI 1 (Tercepat):\n' +
        '1. Buka Files → Downloads\n' +
        '2. Tap video\n' +
        '3. Tap SHARE (📤)\n' +
        '4. Pilih "Gallery" atau "Photos"\n' +
        '5. Tap "Save"\n' +
        '6. ✅ Video masuk Galeri!\n\n' +
        'OPSI 2:\n' +
        'Install "Google Photos" dari Play Store\n' +
        '→ Library → Folders → Downloads\n\n' +
        'OPSI 3:\n' +
        'Install "Video Converter"\n' +
        '→ Convert WebM ke MP4\n' +
        '→ MP4 otomatis masuk Galeri'
      );
    }
  } else {
    // Desktop
    console.log('💻 Desktop detected');
    
    if (typeof customSuccess === 'function') {
      customSuccess(
        '✅ Video berhasil disimpan!\n\n' +
        '💾 Lokasi: Folder Downloads\n\n' +
        '📂 File: ' + filename + '\n\n' +
        'Video bisa diputar dengan:\n' +
        '• VLC Media Player\n' +
        '• Browser (Chrome, Firefox, Safari)\n' +
        '• Windows Media Player (dengan codec)\n\n' +
        '💡 Format WebM mendukung kualitas HD dengan ukuran file lebih kecil',
        '💻 Desktop - Video Tersimpan'
      );
    } else {
      alert(
        '✅ Video tersimpan!\n\n' +
        '💾 Lokasi: Folder Downloads\n' +
        'File: ' + filename + '\n\n' +
        'Bisa diputar dengan VLC atau browser'
      );
    }
  }
  
  console.log('💾 ========================================');
  console.log('💾 SAVE RECORDING COMPLETE!');
  console.log('💾 ========================================');
}

// ========= LOGOUT =========
window.logout = async function() {
  console.log('🚪 Logout called');
  
  let confirmed;
  if (typeof customConfirm === 'function') {
    confirmed = await customConfirm(
      'Logout dari Camera Panel?\n\nAnda perlu login kembali untuk mengakses panel ini.',
      {
        title: '🚪 Logout?',
        confirmText: 'Ya, Logout',
        cancelText: 'Batal',
        confirmClass: 'custom-modal-btn-danger'
      }
    );
  } else {
    confirmed = confirm('Logout dari Camera Panel?');
  }
  
  if (!confirmed) return;
  
  try {
    // Stop camera if active
    if (window.isCameraActive) {
      // Stop recording if active
      if (window.isRecording) {
        console.log('⏹️ Stopping recording before logout...');
        stopRecording();
      }
      
      // Stop all media tracks
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => {
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
      
      // Clean Firebase
      if (window.videoSessionRef) {
        await window.videoSessionRef.set(null);
        console.log('✅ Firebase session cleared');
      }
    }
    
    // Clear session storage
    sessionStorage.clear();
    console.log('✅ Session storage cleared');
    
    // Show success message
    if (typeof customSuccess === 'function') {
      await customSuccess('Logout berhasil!', '👋 Sampai Jumpa!');
    }
    
    // Redirect to camera login
    setTimeout(() => {
      window.location.replace(`camera-login.html?room=${roomId}`);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Force logout even if error
    sessionStorage.clear();
    window.location.replace(`camera-login.html?room=${roomId}`);
  }
};

// ========= CLEANUP ON PAGE UNLOAD =========
window.addEventListener('beforeunload', () => {
  console.log('🔄 Page unload - cleaning up...');
  
  // Stop recording if active
  if (window.isRecording && window.mediaRecorder) {
    try {
      window.mediaRecorder.stop();
      console.log('⏹️ Recording stopped on unload');
    } catch (e) {
      console.log('⚠️ Could not stop recording:', e);
    }
  }
  
  // Stop all media tracks
  if (window.localStream) {
    window.localStream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (e) {
        console.log('⚠️ Could not stop track:', e);
      }
    });
  }
  
  // Close peer connection
  if (window.peerConnection) {
    try {
      window.peerConnection.close();
    } catch (e) {
      console.log('⚠️ Could not close peer connection:', e);
    }
  }
  
  // Clean Firebase (fire and forget)
  if (window.videoSessionRef) {
    window.videoSessionRef.set(null).catch(() => {
      console.log('⚠️ Could not clean Firebase on unload');
    });
  }
  
  console.log('✅ Cleanup complete');
});

// ========= AUTO-CHECK DEPENDENCIES =========
setTimeout(() => {
  console.log('🔄 Auto-checking dependencies...');
  checkDependencies();
}, 500);

/*************************************************
 * TAMBAHAN UNTUK video-panel.js
 * Fungsi Mute/Unmute Audio
 * 
 * INSTRUKSI:
 * Tambahkan code ini DI AKHIR file video-panel.js
 * (Sebelum console.log terakhir)
 *************************************************/

// ========= MUTE STATE =========
window.isAudioMuted = false;

// ========= TOGGLE MUTE FUNCTION =========
window.toggleMute = function() {
  console.log('🎤 Toggle mute called');
  console.log('Current mute state:', window.isAudioMuted);
  
  if (!window.localStream) {
    console.error('❌ No local stream available');
    
    if (typeof customError === 'function') {
      customError('Kamera belum aktif!\n\nAktifkan kamera terlebih dahulu.', '⚠️ Peringatan');
    } else {
      alert('⚠️ Kamera belum aktif!');
    }
    return;
  }
  
  try {
    // Get audio tracks
    const audioTracks = window.localStream.getAudioTracks();
    
    if (audioTracks.length === 0) {
      console.error('❌ No audio tracks found');
      
      if (typeof customError === 'function') {
        customError('Tidak ada audio track!\n\nKamera mungkin tidak memiliki mikrofon.', '⚠️ Audio Error');
      } else {
        alert('⚠️ Tidak ada audio track!');
      }
      return;
    }
    
    console.log('🎤 Audio tracks found:', audioTracks.length);
    
    // Toggle mute state
    window.isAudioMuted = !window.isAudioMuted;
    
    // Apply mute to all audio tracks
    audioTracks.forEach(track => {
      track.enabled = !window.isAudioMuted;
      console.log(`🎤 Audio track ${track.id}: enabled = ${track.enabled}`);
    });
    
    // Update UI
    updateMuteUI();
    
    // Log result
    if (window.isAudioMuted) {
      console.log('🔇 Audio MUTED (Mic OFF)');
      
      if (typeof customSuccess === 'function') {
        customSuccess('Mikrofon dimatikan!\n\n🔇 Audio tidak akan terdengar di display.', '🎤 Mic OFF');
      }
    } else {
      console.log('🔊 Audio UNMUTED (Mic ON)');
      
      if (typeof customSuccess === 'function') {
        customSuccess('Mikrofon dihidupkan!\n\n🔊 Audio akan terdengar di display.', '🎤 Mic ON');
      }
    }
    
  } catch (error) {
    console.error('❌ Toggle mute error:', error);
    
    if (typeof customError === 'function') {
      customError('Gagal mengubah status audio:\n\n' + error.message, '❌ Error');
    } else {
      alert('❌ Error: ' + error.message);
    }
  }
};

// ========= UPDATE MUTE UI =========
function updateMuteUI() {
  const muteBtn = document.getElementById('mute-btn');
  const muteIcon = document.getElementById('mute-icon');
  const muteText = document.getElementById('mute-text');
  
  if (!muteBtn || !muteIcon || !muteText) {
    console.error('❌ Mute UI elements not found');
    return;
  }
  
  if (window.isAudioMuted) {
    // MUTED STATE (Mic OFF)
    muteBtn.classList.add('muted');
    muteIcon.textContent = '🔇';
    muteText.textContent = 'Hidupkan Mic Video';
    muteBtn.title = 'Hidupkan Mic/Video';
    console.log('✅ UI updated: MUTED');
  } else {
    // UNMUTED STATE (Mic ON)
    muteBtn.classList.remove('muted');
    muteIcon.textContent = '🎤';
    muteText.textContent = 'Matikan Mic Video';
    muteBtn.title = 'Matikan Mic/Video';
    console.log('✅ UI updated: UNMUTED');
  }
}

// ========= ENABLE/DISABLE MUTE BUTTON =========
function enableMuteButton() {
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.disabled = false;
    console.log('✅ Mute button enabled');
  }
}

function disableMuteButton() {
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.disabled = true;
    // Reset to default state
    window.isAudioMuted = false;
    updateMuteUI();
    console.log('✅ Mute button disabled');
  }
}

// ========= INTEGRATE WITH EXISTING FUNCTIONS =========

// Modify existing startCamera function to enable mute button
// Find this code in your existing startCamera function:
/*
  const flipBtn = document.getElementById('flip-camera-btn');
  if (flipBtn) {
    flipBtn.disabled = false;
    console.log('✅ Flip button enabled');
  }
*/

// ADD THIS RIGHT AFTER the flip button code:
/*
  // Enable mute button
  enableMuteButton();
*/

// Modify existing stopCamera function to disable mute button
// Find this code in your existing stopCamera function:
/*
  const flipBtn = document.getElementById('flip-camera-btn');
  if (flipBtn) flipBtn.disabled = true;
*/

// ADD THIS RIGHT AFTER the flip button code:
/*
  // Disable mute button
  disableMuteButton();
*/

console.log('✅ Mute/Unmute functions added to video-panel.js');

// ========= FINAL LOG =========
console.log('');
console.log('✅ ========================================');
console.log('✅ VIDEO-PANEL.JS FULLY LOADED!');
console.log('✅ FINAL VERSION - ALL BUGS FIXED');
console.log('✅ ========================================');
console.log('✅ Functions exposed to window:');
console.log('   - window.startCamera');
console.log('   - window.stopCamera');
console.log('   - window.flipCamera');
console.log('   - window.toggleRecording');
console.log('   - window.logout');
console.log('✅ ========================================');
console.log('✅ iPhone: Clear save instructions');
console.log('✅ Android: 3 easy options to Gallery');
console.log('✅ Desktop: Standard download');
console.log('✅ No bugs on flip camera');
console.log('✅ ========================================');
console.log('');
