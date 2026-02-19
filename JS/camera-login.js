/*************************************************
 * CAMERA-LOGIN.JS - Camera Panel Authentication
 * 
 * Password:
 * 1. Firebase (karaoke/system/passwords/camera)
 * 2. config.js (window.CAMERA_PASSWORD)
 *************************************************/

// Fallback dari config.js
const LOCAL_CAMERA_PASSWORD = window.CAMERA_PASSWORD || "hioo_default_camera";

// ========= GET ROOM ID =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

if (!roomId) {
  console.error('❌ Room ID tidak ditemukan');
  alert('Room ID tidak ditemukan. Kembali ke beranda.');
  window.location.href = 'index.html';
}

// ========= DOM ELEMENTS =========
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorEl = document.getElementById('error-message');
const backLink = document.getElementById('back-link');

// ========= HAPUS TOKEN LAMA (Force re-login) =========
sessionStorage.removeItem('videoPanelAuth');
sessionStorage.removeItem('videoPanel_token');
sessionStorage.removeItem('videoPanel_login_time');

console.log('🎥 Camera login page loaded for room:', roomId);

// ========= EVENT LISTENERS =========
passwordInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    login();
  }
});

loginBtn.addEventListener('click', login);
backLink.addEventListener('click', goBackToBusMenu);

// ========= LOGIN FUNCTION =========
async function login() {
  const input = passwordInput.value.trim();
  
  // Validasi input kosong
  if (!input) {
    showError('Password tidak boleh kosong');
    return;
  }
  
  // Disable button saat proses login
  loginBtn.disabled = true;
  loginBtn.textContent = 'Memverifikasi...';
  
  try {
    console.log('🎥 Verifying password...');
    
    // Load password dari Firebase atau config.js
    let correctPassword = LOCAL_CAMERA_PASSWORD;
    
    try {
      if (window.db) {
        const snapshot = await window.db.ref('karaoke/system/passwords/camera').once('value');
        const fbPassword = snapshot.val();
        if (fbPassword) {
          correctPassword = fbPassword;
          console.log('✅ Camera password loaded dari Firebase');
        }
      }
    } catch (e) {
      console.warn('⚠️ Firebase not available, using config.js');
    }
    
    // Cek password
    if (input === correctPassword) {
      console.log('✅ Password correct!');
      
      // Generate secure token
      const token = generateCameraToken(roomId, input);
      
      // Set authentication data
      sessionStorage.setItem('videoPanelAuth', 'authenticated');
      sessionStorage.setItem('videoPanel_token', token);
      sessionStorage.setItem('videoPanel_login_time', Date.now());
      
      // Success message
      await customSuccess(
        'Password benar! Anda akan diarahkan ke Camera Panel.',
        ' Login Berhasil'
      );
      
      // Redirect to video panel
      setTimeout(() => {
        window.location.href = `video-panel.html?room=${roomId}`;
      }, 1000);
      
    } else {
      // Password salah
      console.warn('❌ Wrong password attempt');
      showError('Password yang Anda masukkan salah!');
      
      // Reset input
      passwordInput.value = '';
      passwordInput.focus();
      
      // Re-enable button
      loginBtn.disabled = false;
      loginBtn.textContent = 'Masuk';
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    
    await customError(
      'Terjadi kesalahan saat login. Silakan coba lagi.',
      'Login Error'
    );
    
    loginBtn.disabled = false;
    loginBtn.textContent = 'Masuk';
  }
}

// ========= SHOW ERROR =========
function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  
  // Animate
  errorEl.style.animation = 'none';
  setTimeout(() => {
    errorEl.style.animation = 'shake 0.4s';
  }, 10);
  
  // Auto hide after 4 seconds
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 4000);
}

// ========= GENERATE SECURE TOKEN =========
function generateCameraToken(roomId, password) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const data = `CAMERA-${roomId}-${password}-${timestamp}-${random}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `CAMERA_TOKEN_${Math.abs(hash).toString(36).toUpperCase()}_${timestamp}`;
}

// ========= GO BACK TO BUS MENU =========
async function goBackToBusMenu(e) {
  e.preventDefault();
  
  const result = await customConfirm(
    'Anda akan kembali ke menu bus tanpa login ke Camera Panel.',
    {
      title: 'Kembali ke Menu?',
      icon: '🏠',
      confirmText: 'Ya, Kembali',
      cancelText: 'Batal'
    }
  );
  
  if (result) {
    console.log('🔙 Going back to bus menu');
    window.location.href = `bus-menu.html?room=${roomId}`;
  }
}

// ========= PREVENT BACK BUTTON AFTER LOGIN =========
window.addEventListener('popstate', function(e) {
  const isAuthenticated = sessionStorage.getItem('videoPanelAuth');
  
  if (isAuthenticated) {
    console.log('⚠️ Back button pressed after auth, clearing session');
    sessionStorage.removeItem('videoPanelAuth');
    sessionStorage.removeItem('videoPanel_token');
    sessionStorage.removeItem('videoPanel_login_time');
  }
});

console.log('✅ Camera-login.js loaded');

