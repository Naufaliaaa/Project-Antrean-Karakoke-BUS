/*************************************************
 * BUS-MENU.JS - ENHANCED VERSION
 * With loading states and better UX
 *************************************************/

// ========= SECURITY CHECK =========
(async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  
  if (!roomId) {
    await customError('Room ID tidak ditemukan!', 'Akses Ditolak');
    window.location.href = 'index.html';
    return;
  }
  
  const roomToken = sessionStorage.getItem(`room_token_${roomId}`);
  
  if (!roomToken) {
    console.warn('⚠️ Unauthorized access attempt blocked!');
    await customWarning('Anda harus memasukkan PIN terlebih dahulu!', 'Akses Ditolak');
    window.location.href = `pin-login.html?room=${roomId}`;
    return;
  }
  
  console.log('✅ Access granted - Token valid');
})();

// ========= GET ROOM ID =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// ========= DAFTAR BUS =========
const buses = [
  { id: 'BUS-001', name: 'Bus 1', color: '#667eea' },
  { id: 'BUS-002', name: 'Bus 2', color: '#f093fb' },
  { id: 'BUS-003', name: 'Bus 3', color: '#4facfe' },
  { id: 'BUS-004', name: 'Bus 4', color: '#43e97b' },
  { id: 'BUS-005', name: 'Bus 5', color: '#fa709a' },
  { id: 'BUS-006', name: 'Bus 6', color: '#feca57' },
  { id: 'BUS-007', name: 'Bus 7', color: '#ff6b6b' },
];

// ========= SET BUS INFO =========
function setBusInfo() {
  const bus = buses.find(b => b.id === roomId);
  
  const busNameEl = document.getElementById('bus-name');
  const roomIdEl = document.getElementById('room-id');
  
  if (bus) {
    if (busNameEl) busNameEl.textContent = bus.name;
    if (roomIdEl) roomIdEl.textContent = `Room ID: ${bus.id}`;
  } else {
    if (busNameEl) busNameEl.textContent = roomId;
    if (roomIdEl) roomIdEl.textContent = `Room ID: ${roomId}`;
  }
  
  console.log('✅ Bus info set:', bus || roomId);
}

// ========= ADJUST COLOR =========
function adjustColor(color, percent) {
  const num = parseInt(color.replace("#",""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

// ========= CONFIRM EXIT =========
async function confirmExit(e) {
  e.preventDefault();
  
  const result = await customConfirm(
    'Apakah Anda yakin ingin keluar dari room bus ini?', 
    {
      title: 'Konfirmasi Keluar',
      icon: '🚪',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      confirmClass: 'custom-modal-btn-danger'
    }
  );
  
  if (result) {
    // Clear session
    sessionStorage.removeItem(`room_token_${roomId}`);
    sessionStorage.removeItem(`room_pin_verified_${roomId}`);
    console.log('🚪 User logged out, token removed');
    
    // Redirect
    window.location.href = 'index.html';
  }
}

// ========= NAVIGATION WITH LOADING STATE =========
function navigateWithLoading(button, url) {
  // Add loading class
  button.classList.add('loading');
  
  // Navigate after short delay for visual feedback
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

// ========= NAVIGATION FUNCTIONS =========
function goToDisplay(e) {
  e.preventDefault();
  navigateWithLoading(e.currentTarget, `display-login.html?room=${roomId}`);
}

function goToForm(e) {
  e.preventDefault();
  navigateWithLoading(e.currentTarget, `form.html?room=${roomId}`);
}

function goToVideo(e) {
  e.preventDefault();
  navigateWithLoading(e.currentTarget, `camera-login.html?room=${roomId}`);
}

function goToAdmin(e) {
  e.preventDefault();
  navigateWithLoading(e.currentTarget, `admin-login.html?room=${roomId}`);
}

// ========= EVENT LISTENERS =========
document.addEventListener('DOMContentLoaded', function() {
  // Set bus info
  setBusInfo();
  
  // Back button
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', confirmExit);
  }
  
  // Menu buttons
  const displayBtn = document.getElementById('display-btn');
  if (displayBtn) {
    displayBtn.addEventListener('click', goToDisplay);
  }
  
  const formBtn = document.getElementById('form-btn');
  if (formBtn) {
    formBtn.addEventListener('click', goToForm);
  }
  
  const videoBtn = document.getElementById('video-btn');
  if (videoBtn) {
    videoBtn.addEventListener('click', goToVideo);
  }
  
  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', goToAdmin);
  }
  
  console.log('✅ Bus-menu.js loaded (Enhanced Version)');
  console.log('🚌 Current room:', roomId);
});

// ========= KEYBOARD SHORTCUTS (BONUS) =========
document.addEventListener('keydown', function(e) {
  // ESC key - back to index
  if (e.key === 'Escape') {
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.click();
    }
  }
  
  // Number keys 1-4 for quick navigation
  if (e.key >= '1' && e.key <= '4') {
    const buttons = ['display-btn', 'form-btn', 'video-btn', 'admin-btn'];
    const buttonId = buttons[parseInt(e.key) - 1];
    const button = document.getElementById(buttonId);
    
    if (button) {
      button.click();
    }
  }
});