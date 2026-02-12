/*************************************************
 * ADMIN-LOGIN.JS - Admin Panel Authentication
 * 
 * Password优先순:
 * 1. Firebase (karaoke/system/passwords/admin)
 * 2. config.js (window.ADMIN_PASSWORD)
 *************************************************/

// Fallback dari config.js
const LOCAL_ADMIN_PASSWORD = window.ADMIN_PASSWORD || "hioo_default_admin";

// ========= DOM ELEMENTS =========
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const backLink = document.getElementById('back-link');
const errorDiv = document.getElementById('error-message');

console.log('🔐 ADMIN-LOGIN.JS LOADING...');

// Get room ID
function getRoomId() {
  const urlParams = new URLSearchParams(window.location.search);
  let roomId = urlParams.get('room');
  
  if (!roomId) {
    roomId = localStorage.getItem('karaoke_room_id');
  }
  
  if (!roomId) {
    roomId = sessionStorage.getItem('karaoke_room_id');
  }
  
  return roomId;
}

// Cek apakah sudah login
if (sessionStorage.getItem("adminAuth") === "authenticated") {
  const roomId = getRoomId();
  if (roomId) {
    window.location.replace(`admin.html?room=${roomId}`);
  } else {
    window.location.replace("admin.html");
  }
}

// Initialize
async function initialize() {
  console.log('🔐 Initializing Admin Login...');
  
  const roomId = getRoomId();
  if (roomId) {
    localStorage.setItem('karaoke_room_id', roomId);
    sessionStorage.setItem('karaoke_room_id', roomId);
    console.log('✅ Room ID set:', roomId);
  }
}

// Focus pada input password
setTimeout(() => {
  if (passwordInput) {
    passwordInput.focus();
  }
}, 300);

// Handle submit
async function handleSubmit() {
  const password = passwordInput.value;
  
  if (!password) {
    await customWarning('Masukkan password terlebih dahulu!', 'Password Kosong');
    return;
  }
  
  loginBtn.disabled = true;
  loginBtn.classList.add('loading');
  loginBtn.textContent = 'Memeriksa...';
  
  try {
    console.log('🔐 Verifying password...');
    
    // Load password dari Firebase atau config.js
    let correctPassword = LOCAL_ADMIN_PASSWORD;
    
    try {
      if (window.db) {
        const snapshot = await window.db.ref('karaoke/system/passwords/admin').once('value');
        const fbPassword = snapshot.val();
        if (fbPassword) {
          correctPassword = fbPassword;
          console.log('✅ Admin password loaded dari Firebase');
        }
      }
    } catch (e) {
      console.warn('⚠️ Firebase not available, using config.js');
    }
    
    // Simulasi delay untuk UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === correctPassword) {
      console.log('✅ Password verified successfully!');
      
      // Set session
      sessionStorage.setItem('adminAuth', 'authenticated');
      sessionStorage.setItem('loginTime', Date.now().toString());
      sessionStorage.setItem('adminRequestCount', '0');
      
      await customSuccess('Password benar! Mengalihkan ke Admin Panel...', 'Berhasil');
      
      setTimeout(() => {
        const roomId = getRoomId();
        if (roomId) {
          window.location.replace(`admin.html?room=${roomId}`);
        } else {
          window.location.replace('admin.html');
        }
      }, 1000);
      
    } else {
      console.warn('❌ Password verification failed!');
      errorDiv.style.display = 'block';
      passwordInput.classList.add('error');
      setTimeout(() => passwordInput.classList.remove('error'), 500);
      passwordInput.value = '';
      passwordInput.focus();
      loginBtn.disabled = false;
      loginBtn.classList.remove('loading');
      loginBtn.textContent = 'Masuk';
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    loginBtn.disabled = false;
    loginBtn.classList.remove('loading');
    loginBtn.textContent = 'Masuk';
    await customError('Gagal memverifikasi password: ' + error.message, '❌ Error');
  }
}

// Handle back link
async function goBack() {
  const result = await customConfirm(
    'Kembali ke menu bus?',
    {
      title: 'Kembali',
      confirmText: 'Ya',
      cancelText: 'Tidak'
    }
  );
  
  if (result) {
    const roomId = getRoomId();
    if (roomId) {
      window.location.replace(`bus-menu.html?room=${roomId}`);
    } else {
      window.location.replace('index.html');
    }
  }
}

// Event listeners
loginBtn.addEventListener('click', handleSubmit);
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
});
passwordInput.addEventListener('input', () => {
  errorDiv.style.display = 'none';
  passwordInput.classList.remove('error');
});
backLink.addEventListener('click', (e) => {
  e.preventDefault();
  goBack();
});

document.addEventListener('DOMContentLoaded', initialize);
console.log('✅ ADMIN-LOGIN.JS LOADED');

