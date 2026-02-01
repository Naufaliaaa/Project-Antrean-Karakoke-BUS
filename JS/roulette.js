/*************************************************
 * ROULETTE.JS - Roulette Feature for Arisan
 * Continuous spinning wheel, winner tracking
 *************************************************/

// ========= GET ROOM ID =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// ========= STATE =========
let allParticipants = []; // Semua nama asli
let remainingParticipants = []; // Nama yang belum menang
let winners = []; // Array untuk menyimpan pemenang berurutan
let isSpinning = false;
let isStarted = false;

// ========= DOM ELEMENTS =========
const namesInput = document.getElementById('names-input');
const startRouletteBtn = document.getElementById('start-roulette-btn');
const participantsSection = document.getElementById('participants-section');
const inputSection = document.getElementById('input-section');
const participantsList = document.getElementById('participants-list');
const participantCount = document.getElementById('participant-count');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const rouletteWheel = document.getElementById('roulette-wheel');
const winnerDisplay = document.getElementById('winner-display');
const winnerName = document.getElementById('winner-name');
const winnersListContainer = document.getElementById('winners-list-container');
const winnersList = document.getElementById('winners-list');
const backButton = document.getElementById('back-button');

// ========= COLOR PALETTES =========
const colorPalettes = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52BE80', // Green
  '#EC7063', // Coral
  '#5DADE2', // Light Blue
  '#FF9F1C', // Bright Orange
  '#2EC4B6', // Turquoise
  '#E71D36', // Crimson
  '#FFB627'  // Golden Yellow
];

// ========= PARSE NAMES =========
function parseNames(input) {
  const names = input
    .split(/[,\n]/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
  
  return [...new Set(names)];
}

// ========= UPDATE ROULETTE WHEEL =========
function updateRouletteWheel() {
  const wheel = document.getElementById('roulette-wheel');
  
  // Clear existing slots
  const existingSlots = wheel.querySelectorAll('.roulette-slot');
  existingSlots.forEach(slot => slot.remove());
  
  const participants = remainingParticipants;
  const count = participants.length;
  
  if (count === 0) {
    return;
  }
  
  // Calculate angle per slot
  const anglePerSlot = 360 / count;
  
  // Create slots
  participants.forEach((name, index) => {
    const slot = document.createElement('div');
    slot.className = 'roulette-slot';
    
    const rotation = index * anglePerSlot;
    const skewAngle = 90 - anglePerSlot;
    
    slot.style.transform = `rotate(${rotation}deg) skewY(${skewAngle}deg)`;
    
    // Get color for this slot
    const color = colorPalettes[index % colorPalettes.length];
    
    // Create the colored background using pseudo-element
    slot.style.setProperty('--slot-color', color);
    
    // Use CSS to create the pie slice
    const slotBg = document.createElement('div');
    slotBg.style.position = 'absolute';
    slotBg.style.width = '100%';
    slotBg.style.height = '100%';
    slotBg.style.background = color;
    slotBg.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
    slot.appendChild(slotBg);
    
    const content = document.createElement('div');
    content.className = 'roulette-slot-content';
    content.textContent = name;
    
    slot.appendChild(content);
    wheel.appendChild(slot);
  });
}

// ========= UPDATE PARTICIPANTS LIST =========
function updateParticipantsList() {
  participantsList.innerHTML = '';
  
  remainingParticipants.forEach((name, index) => {
    const tag = document.createElement('div');
    tag.className = 'participant-tag';
    tag.textContent = name;
    tag.style.animationDelay = `${index * 0.05}s`;
    participantsList.appendChild(tag);
  });
  
  participantCount.textContent = remainingParticipants.length;
}

// ========= UPDATE WINNERS LIST =========
function updateWinnersList() {
  if (winners.length === 0) {
    winnersListContainer.style.display = 'none';
    return;
  }
  
  winnersListContainer.style.display = 'block';
  winnersList.innerHTML = '';
  
  winners.forEach((winner, index) => {
    const item = document.createElement('div');
    item.className = 'winner-item';
    item.style.animationDelay = `${index * 0.1}s`;
    
    const rank = document.createElement('div');
    rank.className = 'winner-rank';
    
    // Add special classes for top 3
    if (index === 0) rank.classList.add('gold');
    else if (index === 1) rank.classList.add('silver');
    else if (index === 2) rank.classList.add('bronze');
    
    rank.textContent = index + 1;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'winner-name-item';
    nameDiv.textContent = winner;
    
    item.appendChild(rank);
    item.appendChild(nameDiv);
    winnersList.appendChild(item);
  });
}

// ========= START ROULETTE =========
async function startRoulette() {
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
  
  // Set state
  allParticipants = newNames;
  remainingParticipants = [...newNames];
  winners = [];
  isStarted = true;
  
  // Update wheel
  updateRouletteWheel();
  
  // Update participants list
  updateParticipantsList();
  
  // Disable input
  namesInput.disabled = true;
  
  // Show participants section, keep input section visible but disabled
  participantsSection.style.display = 'block';
  
  // Enable spin button
  spinBtn.disabled = false;
  
  // Hide winner display initially
  winnerDisplay.style.display = 'none';
  
  console.log('✅ Roulette started with', allParticipants.length, 'participants');
}

// ========= SPIN ROULETTE =========
async function spinRoulette() {
  if (isSpinning || remainingParticipants.length === 0) return;
  
  isSpinning = true;
  spinBtn.disabled = true;
  
  // Hide previous winner display
  if (winnerDisplay.style.display === 'block') {
    winnerDisplay.style.display = 'none';
  }
  
  // Get random winner
  const winnerIndex = Math.floor(Math.random() * remainingParticipants.length);
  const winner = remainingParticipants[winnerIndex];
  
  console.log('🎯 Winner selected:', winner);
  
  // Stop continuous animation and start selection animation
  rouletteWheel.classList.add('selecting');
  
  // Calculate rotation
  const count = remainingParticipants.length;
  const anglePerSlot = 360 / count;
  const baseRotation = 360 * 6; // 6 full rotations
  const winnerAngle = winnerIndex * anglePerSlot + anglePerSlot / 2;
  const targetRotation = baseRotation + (360 - winnerAngle);
  
  // Get current rotation
  const currentTransform = window.getComputedStyle(rouletteWheel).transform;
  let currentRotation = 0;
  
  if (currentTransform !== 'none') {
    const values = currentTransform.split('(')[1].split(')')[0].split(',');
    const a = values[0];
    const b = values[1];
    currentRotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  }
  
  // Normalize current rotation
  currentRotation = currentRotation % 360;
  if (currentRotation < 0) currentRotation += 360;
  
  // Animate
  const startRotation = currentRotation;
  const finalRotation = startRotation + targetRotation;
  const duration = 5000; // 5 seconds
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out cubic)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const rotation = startRotation + (targetRotation * easeOut);
    rouletteWheel.style.transform = `rotate(${rotation}deg)`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation complete
      setTimeout(() => {
        finishSpin(winner);
      }, 300);
    }
  }
  
  requestAnimationFrame(animate);
}

// ========= FINISH SPIN =========
async function finishSpin(winner) {
  // Add to winners list
  winners.push(winner);
  
  // Remove from remaining participants
  remainingParticipants = remainingParticipants.filter(name => name !== winner);
  
  // Show winner
  winnerName.textContent = winner;
  winnerDisplay.style.display = 'block';
  
  // Update lists
  updateWinnersList();
  updateParticipantsList();
  
  // Update wheel with remaining participants
  updateRouletteWheel();
  
  // Resume continuous spinning
  rouletteWheel.classList.remove('selecting');
  
  // Celebration
  createConfetti();
  
  // Success message
  const position = winners.length;
  await customSuccess(`🎉 Selamat kepada ${winner}!`, {
    title: `🏆 PEMENANG KE-${position}!`,
    icon: '🎊'
  });
  
  isSpinning = false;
  
  // Check if there are remaining participants
  if (remainingParticipants.length > 0) {
    spinBtn.disabled = false;
  } else {
    // All winners selected
    await customSuccess('Semua pemenang telah terpilih! 🎉', {
      title: '✅ Roulette Selesai',
      icon: '🏁'
    });
    spinBtn.disabled = true;
  }
}

// ========= CREATE CONFETTI =========
function createConfetti() {
  const colors = ['#f093fb', '#f5576c', '#ffc107', '#ff9800', '#4caf50', '#2196f3', '#e91e63', '#9c27b0'];
  
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.width = (Math.random() * 8 + 8) + 'px';
      confetti.style.height = confetti.style.width;
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 5000);
    }, i * 20);
  }
}

// ========= RESET ALL =========
async function resetAll() {
  const result = await customConfirm(
    'Apakah Anda yakin ingin mereset semua? Semua data pemenang akan hilang.', 
    {
      title: '🔄 Reset Semua',
      icon: '🔄',
      confirmText: 'Ya, Reset',
      cancelText: 'Batal',
      confirmClass: 'custom-modal-btn-danger'
    }
  );
  
  if (!result) return;
  
  // Reset all state
  allParticipants = [];
  remainingParticipants = [];
  winners = [];
  isStarted = false;
  isSpinning = false;
  
  // Reset UI
  namesInput.value = '';
  namesInput.disabled = false;
  
  participantsList.innerHTML = '';
  participantCount.textContent = '0';
  
  inputSection.style.display = 'block';
  participantsSection.style.display = 'none';
  winnerDisplay.style.display = 'none';
  winnersListContainer.style.display = 'none';
  
  // Clear wheel
  const existingSlots = rouletteWheel.querySelectorAll('.roulette-slot');
  existingSlots.forEach(slot => slot.remove());
  
  // Remove selecting class to resume continuous spinning
  rouletteWheel.classList.remove('selecting');
  rouletteWheel.style.transform = 'rotate(0deg)';
  
  spinBtn.disabled = true;
  
  console.log('✅ Roulette reset');
}

// ========= BACK TO MENU =========
async function goBack(e) {
  e.preventDefault();
  
  if (isStarted && !isSpinning) {
    const result = await customConfirm(
      'Apakah Anda yakin ingin kembali ke menu? Semua data akan hilang.', 
      {
        title: 'Konfirmasi Kembali',
        icon: 'img/exit.png',
        confirmText: 'Ya, Keluar',
        cancelText: 'Batal',
        confirmClass: 'custom-modal-btn-danger'
      }
    );
    
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
  
  // Start roulette button
  if (startRouletteBtn) {
    startRouletteBtn.addEventListener('click', startRoulette);
  }
  
  // Spin button
  if (spinBtn) {
    spinBtn.addEventListener('click', spinRoulette);
  }
  
  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAll);
  }
  
  // Enter key to start roulette
  if (namesInput) {
    namesInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey && !isStarted) {
        startRoulette();
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
    if (backButton) {
      backButton.click();
    }
  }
  
  // Space or Enter to spin (when ready)
  if ((e.key === ' ' || e.key === 'Enter') && remainingParticipants.length > 0 && !isSpinning && isStarted) {
    e.preventDefault();
    spinRoulette();
  }
});

// ========= EXPORT FOR MODULES =========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startRoulette,
    spinRoulette,
    resetAll
  };
}