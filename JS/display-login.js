/*************************************************
 * DISPLAY-LOGIN.JS - Display Login Authentication
 * Password from: config.js OR Netlify ENV OR Firebase
 * 
 * Priority:
 * 1. window.ENV_DISPLAY_PASSWORD (Netlify ENV)
 * 2. window.DISPLAY_PASSWORD (config.js)
 * 3. Firebase (fallback)
 *************************************************/

// Get password - will be loaded asynchronously
let DISPLAY_PASSWORD = null;

// Initialize password
async function initDisplayPassword() {
  // 1. First check Netlify Environment Variables
  if (typeof window.ENV_DISPLAY_PASSWORD !== 'undefined' && window.ENV_DISPLAY_PASSWORD) {
    DISPLAY_PASSWORD = window.ENV_DISPLAY_PASSWORD;
    console.log('✅ Display password loaded from Netlify ENV');
    return DISPLAY_PASSWORD;
  }
  
  // 2. Check config.js
  if (typeof window.DISPLAY_PASSWORD !== 'undefined') {
    DISPLAY_PASSWORD = window.DISPLAY_PASSWORD;
    console.log('✅ Display password loaded from config.js');
    return DISPLAY_PASSWORD;
  }
  
  // 3. Try Firebase as last resort
  try {
    if (window.getDisplayPassword) {
      DISPLAY_PASSWORD = await window.getDisplayPassword();
      if (DISPLAY_PASSWORD) {
        console.log('✅ Display password loaded from Firebase');
        return DISPLAY_PASSWORD;
      }
    }
  } catch (e) {
    console.warn('⚠️ Could not load from Firebase');
  }
  
  // Fallback - ONLY for development
  console.warn('⚠️ Using default display password - CONFIGURE NETLIFY ENV!');
  DISPLAY_PASSWORD = "hioo_default_display_please_setup";
  return DISPLAY_PASSWORD;
}

// ========= DOM ELEMENTS =========
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const backLink = document.getElementById('back-link');
const errorDiv = document.getElementById('error-message');

console.log('📺 DISPLAY-LOGIN.JS LOADING...');

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
const isAuthenticated = sessionStorage.getItem("displayAuth") === "authenticated";
const displayToken = sessionStorage.getItem("display_token");

if (isAuthenticated && displayToken) {
  window.location.replace("display.html");
}

// Initialize
function initialize() {
  console.log('📺 Initializing Display Login...');
  
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
    console.log('📺 Verifying password...');
    
    // Load password from config or Firebase
    await initDisplayPassword();
    
    // Simulasi delay untuk UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === DISPLAY_PASSWORD) {
      console.log('✅ Password verified successfully!');
      
      // Generate token
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const token = `DISPLAY_TOKEN_${Math.abs((timestamp + random).split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(36)}_${timestamp}`;
      
      // Set session
      sessionStorage.setItem('displayAuth', 'authenticated');
      sessionStorage.setItem('displayLoginTime', Date.now().toString());
      sessionStorage.setItem('display_token', token);
      
      console.log('✅ Display authenticated with token:', token);
      
      await customSuccess('Password benar! Mengalihkan ke Layar Karaoke...', ' Berhasil');
      
      setTimeout(() => {
        window.location.replace("display.html");
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
      window.location.replace("index.html");
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
console.log('✅ DISPLAY-LOGIN.JS LOADED');

