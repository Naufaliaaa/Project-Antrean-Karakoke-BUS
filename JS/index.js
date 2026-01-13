/*************************************************
 * INDEX.JS - Bus Selection Logic (FINAL VERSION)
 * Clean design - NO reset badge
 *************************************************/

// ========= DAFTAR BUS - EDIT DI SINI! =========
const buses = [
  { id: 'BUS-001', name: 'Hiace 1', color: '#667eea' },
  { id: 'BUS-002', name: 'Hiace 2', color: '#f093fb' },
  { id: 'BUS-003', name: 'Hiace 3', color: '#4facfe' },
  { id: 'BUS-004', name: 'Hiace 4', color: '#43e97b' },
  { id: 'BUS-005', name: 'Hiace 5', color: '#fa709a' },
  { id: 'BUS-006', name: 'Hiace 6', color: '#feca57' },
  { id: 'BUS-007', name: 'Hiace 7', color: '#ff6b6b' },
];

// ========= RENDER BUS CARDS (CLEAN - NO RESET BADGE) =========
function renderBusCards() {
  const grid = document.getElementById('bus-grid');
  
  if (!grid) {
    console.error('❌ Bus grid element not found!');
    return;
  }
  
  grid.innerHTML = '';
  
  buses.forEach(bus => {
    const card = document.createElement('div');
    card.className = 'bus-card';
    card.onclick = () => selectBus(bus.id);
    
    // Create card HTML - CLEAN VERSION (NO RESET BADGE)
    card.innerHTML = `
      <div class="bus-image-container">
        <img src="img/unit.png" alt="${bus.name}" class="bus-image">
      </div>
      
      <div class="bus-info">
        <button class="bus-button">${bus.name}</button>
        <div class="bus-id">${bus.id}</div>
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  console.log('✅ Bus cards rendered:', buses.length);
}

// ========= SELECT BUS =========
function selectBus(roomId) {
  console.log('🚌 Bus selected:', roomId);
  
  // Save to localStorage
  localStorage.setItem('karaoke_room_id', roomId);
  
  // Add loading state to clicked card
  const cards = document.querySelectorAll('.bus-card');
  cards.forEach(card => {
    if (card.querySelector('.bus-id').textContent === roomId) {
      card.classList.add('loading');
    }
  });
  
  // Redirect to PIN login
  setTimeout(() => {
    window.location.href = `pin-login.html?room=${roomId}`;
  }, 300);
}

// ========= CUSTOM ROOM =========
function enterCustomRoom() {
  const input = document.getElementById('custom-room-id');
  
  if (!input) {
    console.error('❌ Custom room input not found!');
    return;
  }
  
  const roomId = input.value.trim().toUpperCase();
  
  // Validation
  if (!roomId) {
    alert('⚠️ Masukkan Room ID terlebih dahulu!');
    input.focus();
    return;
  }
  
  if (!/^[A-Z0-9-]+$/.test(roomId)) {
    alert('⚠️ Room ID hanya boleh mengandung huruf, angka, dan dash (-)!');
    input.focus();
    return;
  }
  
  console.log('🔑 Custom room entered:', roomId);
  
  // Save and redirect
  localStorage.setItem('karaoke_room_id', roomId);
  window.location.href = `pin-login.html?room=${roomId}`;
}

// ========= ENTER KEY HANDLER =========
document.addEventListener('DOMContentLoaded', function() {
  const customInput = document.getElementById('custom-room-id');
  
  if (customInput) {
    customInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        enterCustomRoom();
      }
    });
    
    console.log('✅ Enter key handler attached');
  }
  
  // Render bus cards on page load
  renderBusCards();
});

// ========= INIT =========
console.log('✅ Index.js loaded (Clean Version - No Reset Badge)');
console.log('🚌 Available buses:', buses.length);