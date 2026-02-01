/*************************************************
 * ROULETTE.JS - Roulette Feature for Arisan
 * Input nama, spin animation, random selection
 *************************************************/

// ========= GET ROOM ID =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// ========= STATE =========
let participants = [];
let isSpinning = false;

// ========= DOM ELEMENTS =========
const namesInput = document.getElementById('names-input');
const addNamesBtn = document.getElementById('add-names-btn');
const participantsSection = document.getElementById('participants-section');
const inputSection = document.getElementById('input-section');
const participantsList = document.getElementById('participants-list');
const participantCount = document.getElementById('participant-count');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const rouletteWheel = document.getElementById('roulette-wheel');
const winnerDisplay = document.getElementById('winner-display');
const winnerName = document.getElementById('winner-name');
const backButton = document.getElementById('back-button');

// ========= PARSE NAMES =========
function parseNames(input) {
  // Split by comma or newline, filter empty entries
  const names = input
    .split(/[,\n]/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
  
  // Remove duplicates
  return [...new Set(names)];
}

// ========= UPDATE ROULETTE WHEEL =========
function updateRouletteWheel() {
  const wheel = document.getElementById('roulette-wheel');
  
  // Clear existing slots
  const existingSlots = wheel.querySelectorAll('.roulette-slot');
  existingSlots.forEach(slot => slot.remove());
  
  const count = participants.length;
  
  if (count === 0) return;
  
  // Calculate angle per slot
  const anglePerSlot = 360 / count;
  
  // Create slots
  participants.forEach((name, index) => {
    const slot = document.createElement('div');
    slot.className = 'roulette-slot';
    slot.style.transform = `rotate(${index * anglePerSlot}deg) skewY(${90 - anglePerSlot}deg)`;
    
    // Different background colors for variety
    const colors = [
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    ];
    
    const color = colors[index % colors.length];
    
    slot.innerHTML = `<span style="background: ${color};">${name}</span>`;
    wheel.appendChild(slot);
  });
}

// ========= ADD NAMES =========
async function addNames() {
  const input = namesInput.value.trim();
  
  if (!input) {
    await customWarning('Silakan masukkan nama peserta terlebih dahulu!', 'Input Kosong');
    return;
  }
  
  const newNames = parseNames(input);
  
  if (newNames.length < 2) {
    await customWarning('Minimal perlu ada 2 peserta untuk roulette!', 'Peserta Kurang');
    return;
  }
  
  participants = newNames;
  
  // Update UI
  participantCount.textContent = participants.length;
  participantsList.innerHTML = '';
  
  participants.forEach((name, index) => {
    const tag = document.createElement('div');
    tag.className = 'participant-tag';
    tag.textContent = name;
    tag.style.animationDelay = `${index * 0.05}s`;
    participantsList.appendChild(tag);
  });
  
  // Update wheel
  updateRouletteWheel();
  
  // Show participants section, hide input
  inputSection.style.display = 'none';
  participantsSection.style.display = 'block';
  
  // Enable spin button
  spinBtn.disabled = false;
  
  // Reset winner display
  winnerName.textContent = '?';
  winnerDisplay.style.opacity = '0.5';
  
  console.log('✅ Participants added:', participants.length);
}

// ========= SPIN ROULETTE =========
async function spinRoulette() {
  if (isSpinning || participants.length < 2) return;
  
  isSpinning = true;
  spinBtn.disabled = true;
  winnerDisplay.style.opacity = '0.5';
  winnerName.textContent = '🎰';
  
  // Get random winner
  const winnerIndex = Math.floor(Math.random() * participants.length);
  const winner = participants[winnerIndex];
  
  console.log('🎯 Winner selected:', winner);
  
  // Calculate rotation
  const count = participants.length;
  const anglePerSlot = 360 / count;
  const baseRotation = 360 * 5; // 5 full rotations
  const winnerAngle = winnerIndex * anglePerSlot + anglePerSlot / 2;
  const targetRotation = baseRotation + (360 - winnerAngle);
  
  // Animate
  let currentRotation = 0;
  const duration = 4000; // 4 seconds
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    currentRotation = targetRotation * easeOut;
    rouletteWheel.style.transform = `rotate(${currentRotation}deg)`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation complete
      isSpinning = false;
      showWinner(winner);
    }
  }
  
  requestAnimationFrame(animate);
}

// ========= SHOW WINNER =========
async function showWinner(winner) {
  winnerName.textContent = winner;
  winnerDisplay.style.opacity = '1';
  
  // Add winner class to the winner tag
  const tags = participantsList.querySelectorAll('.participant-tag');
  tags.forEach(tag => {
    if (tag.textContent === winner) {
      tag.classList.add('winner');
    }
  });
  
  // Celebration confetti
  createConfetti();
  
  // Success message
  await customSuccess(`🎉 Selamat kepada ${winner} yang terpilih!`, {
    title: '🏆 PEMENANG!',
    icon: '🎊'
  });
  
  spinBtn.disabled = false;
}

// ========= CREATE CONFETTI =========
function createConfetti() {
  const colors = ['#f093fb', '#f5576c', '#ffc107', '#ff9800', '#4caf50', '#2196f3'];
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      document.body.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => confetti.remove(), 4000);
    }, i * 30);
  }
}

// ========= RESET =========
async function resetRoulette() {
  const result = await customConfirm('Apakah Anda ingin memulai roulette baru dengan peserta yang berbeda?', {
    title: '🔄 Reset Roulette',
    icon: '🔄',
    confirmText: 'Ya, Reset',
    cancelText: 'Batal',
    confirmClass: 'custom-modal-btn-danger'
  });
  
  if (result) {
    participants = [];
    namesInput.value = '';
    
    participantsList.innerHTML = '';
    participantCount.textContent = '0';
    
    inputSection.style.display = 'block';
    participantsSection.style.display = 'none';
    
    winnerName.textContent = '?';
    winnerDisplay.style.opacity = '0.5';
    
    // Clear wheel
    const existingSlots = rouletteWheel.querySelectorAll('.roulette-slot');
    existingSlots.forEach(slot => slot.remove());
    
    spinBtn.disabled = true;
    
    console.log('✅ Roulette reset');
  }
}

// ========= BACK TO MENU =========
async function goBack(e) {
  e.preventDefault();
  
  if (participants.length > 0 && !isSpinning) {
    const result = await customConfirm('Apakah Anda yakin ingin kembali ke menu? Data roulette akan hilang.', {
      title: 'Konfirmasi Kembali',
      icon: 'img/exit.png',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      confirmClass: 'custom-modal-btn-danger'
    });
    
    if (!result) return;
  }
  
  window.location.href = `bus-menu.html?room=${roomId}`;
}

// ========= EVENT LISTENERS =========
document.addEventListener('DOMContentLoaded', function() {
  // Back button
  if (backButton) {
    backButton.addEventListener('click', goBack);
  }
  
  // Add names button
  if (addNamesBtn) {
    addNamesBtn.addEventListener('click', addNames);
  }
  
  // Spin button
  if (spinBtn) {
    spinBtn.addEventListener('click', spinRoulette);
  }
  
  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', resetRoulette);
  }
  
  // Enter key to add names
  if (namesInput) {
    namesInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        addNames();
      }
    });
  }
  
  console.log('✅ Roulette.js loaded');
  console.log('🎰 Room:', roomId);
});

// ========= KEYBOARD SHORTCUTS =========
document.addEventListener('keydown', function(e) {
  // ESC key - back
  if (e.key === 'Escape') {
    const backBtn = document.getElementById('back-button');
    if (backBtn) {
      backBtn.click();
    }
  }
  
  // Ctrl+Enter to spin
  if (e.key === 'Enter' && e.ctrlKey && participants.length >= 2 && !isSpinning) {
    spinRoulette();
  }
});

// ========= EXPORT FOR MODULES =========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addNames,
    spinRoulette,
    resetRoulette
  };
}

