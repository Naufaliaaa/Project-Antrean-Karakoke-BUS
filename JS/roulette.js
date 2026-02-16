/*************************************************
 * ROULETTE.JS - Wheel of Names Style
 * SVG-based spinning wheel with smooth animations
 *************************************************/

// ========= GET ROOM ID =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// ========= STATE =========
let entries = [];
let appliedEntries = []; // Track applied entries
let currentRotation = 0;
let isSpinning = false;
let winners = [];
let isApplied = false; // Track if entries have been applied

// ========= SOUND EFFECTS =========
const spinSound = new Audio('sounds/roulette.mp3');
const winSound = new Audio('sounds/win.mp3');
spinSound.loop = true; // Loop the spin sound while spinning

// ========= DOM ELEMENTS =========
const entriesTextarea = document.getElementById('entries-textarea');
const entriesCount = document.getElementById('entries-count');
const applyButton = document.getElementById('apply-button');
const clearButton = document.getElementById('clear-button');
const spinButton = document.getElementById('spin-button');
const wheelSvg = document.getElementById('wheel-svg');
const wheelSlices = document.getElementById('wheel-slices');
const winnerAnnouncement = document.getElementById('winner-announcement');
const winnerText = document.getElementById('winner-text');
const winnersSection = document.getElementById('winners-section');
const winnersList = document.getElementById('winners-list');
const removeWinnerCheckbox = document.getElementById('remove-winner-checkbox');
const backButton = document.getElementById('back-button');

// ========= COLORS =========
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52BE80', '#EC7063', '#5DADE2',
  '#FF9F1C', '#2EC4B6', '#E71D36', '#FFB627',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C'
];

// ========= PARSE ENTRIES =========
function parseEntries(text) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return [...new Set(lines)]; // Remove duplicates
}

// ========= UPDATE ENTRIES COUNT =========
function updateEntriesCount() {
  const count = entries.length;
  entriesCount.textContent = `${count} peserta`;
  // Enable spin button if entries are applied and have at least 1 entry
  spinButton.disabled = !isApplied || count < 1;
}

// ========= CREATE WHEEL SLICES =========
function createWheelSlices() {
  wheelSlices.innerHTML = '';

  if (entries.length === 0) return;

  const centerX = 250;
  const centerY = 250;
  const radius = 230;
  const sliceAngle = 360 / entries.length;

  entries.forEach((entry, index) => {
    const startAngle = index * sliceAngle - 90; // Start from top
    const endAngle = startAngle + sliceAngle;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    // Large arc flag
    const largeArc = sliceAngle > 180 ? 1 : 0;

    // Create path
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // Create path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', colors[index % colors.length]);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '3');
    path.classList.add('wheel-slice');

    // Create text
    const textAngle = startAngle + sliceAngle / 2;
    const textRad = (textAngle * Math.PI) / 180;
    const textRadius = radius * 0.65;
    const textX = centerX + textRadius * Math.cos(textRad);
    const textY = centerY + textRadius * Math.sin(textRad);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textX);
    text.setAttribute('y', textY);
    text.setAttribute('transform', `rotate(${textAngle + 90} ${textX} ${textY})`);
    text.classList.add('slice-text');
    text.textContent = entry.length > 15 ? entry.substring(0, 15) + '...' : entry;

    wheelSlices.appendChild(path);
    wheelSlices.appendChild(text);
  });
}

// ========= START CONTINUOUS SPIN (While Editing) =========
function startContinuousSpin() {
  wheelSvg.classList.add('continuous-spin');
}

// ========= STOP CONTINUOUS SPIN (When Applied) =========
function stopContinuousSpin() {
  wheelSvg.classList.remove('continuous-spin');
  // Reset rotation to 0 for clean start
  wheelSvg.style.transform = 'rotate(0deg)';
  currentRotation = 0;
}

// ========= APPLY ENTRIES =========
async function applyEntries() {
  const text = entriesTextarea.value.trim();

  if (!text) {
    await customWarning('Silakan masukkan nama peserta terlebih dahulu!', 'Input Kosong');
    return;
  }

  const newEntries = parseEntries(text);

  if (newEntries.length < 1) {
    await customWarning('Minimal perlu ada 1 peserta untuk roulette!', 'Peserta Kurang');
    return;
  }

  entries = newEntries;
  appliedEntries = [...entries]; // Store applied entries
  isApplied = true; // Mark as applied

  // Stop continuous spin when applied
  stopContinuousSpin();

  // Disable textarea after apply
  entriesTextarea.disabled = true;
  applyButton.disabled = true;

  updateEntriesCount();
  createWheelSlices();

  // Hide winner announcement
  winnerAnnouncement.style.display = 'none';

  console.log('✅ Entries applied:', entries.length);
}

// ========= CLEAR ALL =========
async function clearAll() {
  const result = await customConfirm(
    'Apakah Anda yakin ingin menghapus semua data?',
    {
      title: '⚠️ Konfirmasi',
      icon: '⚠️',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      confirmClass: 'custom-modal-btn-danger'
    }
  );

  if (!result) return;

  entries = [];
  appliedEntries = [];
  winners = [];
  isApplied = false;

  entriesTextarea.value = '';
  entriesTextarea.disabled = false;
  applyButton.disabled = false;

  updateEntriesCount();
  wheelSlices.innerHTML = '';
  winnerAnnouncement.style.display = 'none';
  winnersSection.style.display = 'none';
  currentRotation = 0;
  wheelSvg.style.transform = 'rotate(0deg)';

  // Stop any playing sounds
  stopSound(spinSound);
  stopSound(winSound);

  console.log('✅ All data cleared');
}

// ========= SPIN WHEEL =========
async function spinWheel() {
  if (isSpinning || entries.length < 1) return;

  isSpinning = true;
  spinButton.disabled = true;
  winnerAnnouncement.style.display = 'none';

  // Pick random winner
  const winnerIndex = Math.floor(Math.random() * entries.length);
  const winner = entries[winnerIndex];

  console.log('🎯 Winner selected:', winner);

  // Calculate rotation
  const sliceAngle = 360 / entries.length;
  const targetSliceRotation = winnerIndex * sliceAngle + sliceAngle / 2;

  // Add multiple full rotations (5-8 spins)
  const fullRotations = 5 + Math.random() * 3;
  const totalRotation = currentRotation + (360 * fullRotations) - targetSliceRotation + 90;

  // Animate
  const duration = 7000; // 7 seconds
  const startTime = Date.now();
  const startRotation = currentRotation;

  wheelSvg.classList.add('spinning');

  // Play spin sound
  playSound(spinSound);

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out cubic for realistic deceleration)
    const eased = 1 - Math.pow(1 - progress, 3);

    const rotation = startRotation + (totalRotation - startRotation) * eased;
    wheelSvg.style.transform = `rotate(${rotation}deg)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentRotation = totalRotation % 360;
      wheelSvg.classList.remove('spinning');
      finishSpin(winner);
    }
  }

  requestAnimationFrame(animate);
}

// ========= FINISH SPIN =========
async function finishSpin(winner) {
  // Show winner
  winnerText.textContent = winner;
  winnerAnnouncement.style.display = 'flex';

  // Stop spin sound and play win sound
  stopSound(spinSound);
  playSound(winSound);

  // Add to winners list
  winners.push(winner);
  updateWinnersList();

  // Confetti
  createConfetti();

  // Success message
  await customSuccess(`🎉 ${winner} terpilih sebagai pemenang!`, {
    title: '🏆 PEMENANG!',
    icon: '🎊'
  });

  // Remove winner if checkbox is checked
  if (removeWinnerCheckbox.checked) {
    entries = entries.filter(e => e !== winner);
    updateEntriesCount();

    // Update textarea with remaining entries
    entriesTextarea.value = entries.join('\n');

    // Recreate wheel
    createWheelSlices();

    if (entries.length === 1) {
      // Last winner - show special message and allow spinning
      await customSuccess(`${entries[0]} adalah nominasi terakhir!`, {
        title: '🎯 Nominasi Terakhir',
        icon: '🏁'
      });
      // Button stays enabled for the last spin
    } else if (entries.length < 1) {
      // All winners selected
      await customSuccess('Semua pemenang telah terpilih!', {
        title: '✅ Selesai',
        icon: '🏁'
      });
      spinButton.disabled = true;
    }
  }

  isSpinning = false;
  // Enable spin button if entries are applied and have at least 1 entry
  spinButton.disabled = !isApplied || entries.length < 1;
}

// ========= UPDATE WINNERS LIST =========
function updateWinnersList() {
  if (winners.length === 0) {
    winnersSection.style.display = 'none';
    return;
  }

  winnersSection.style.display = 'block';
  winnersList.innerHTML = '';

  winners.forEach((winner, index) => {
    const item = document.createElement('div');
    item.className = 'winner-item';
    item.style.animationDelay = `${index * 0.1}s`;

    const rank = document.createElement('div');
    rank.className = 'winner-rank';

    if (index === 0) rank.classList.add('gold');
    else if (index === 1) rank.classList.add('silver');
    else if (index === 2) rank.classList.add('bronze');

    rank.textContent = index + 1;

    const name = document.createElement('div');
    name.className = 'winner-name-item';
    name.textContent = winner;

    item.appendChild(rank);
    item.appendChild(name);
    winnersList.appendChild(item);
  });
}

// ========= CREATE CONFETTI =========
function createConfetti() {
  const confettiColors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];

  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.width = (Math.random() * 8 + 6) + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 5000);
    }, i * 15);
  }
}

// ========= BACK TO MENU =========
async function goBack(e) {
  e.preventDefault();

  if (entries.length > 0 && !isSpinning) {
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

  // Stop any playing sounds
  stopSound(spinSound);
  stopSound(winSound);

  window.location.href = `bus-menu.html?room=${roomId}`;
}

// ========= TEXTAREA INPUT - REALTIME UPDATE =========
function handleTextareaInput() {
  // Only allow input if not yet applied
  if (isApplied) return;

  const text = entriesTextarea.value.trim();
  const tempEntries = parseEntries(text);
  entriesCount.textContent = `${tempEntries.length} peserta`;

  // Update wheel in real-time
  entries = tempEntries;
  createWheelSlices();

  // Start continuous spin while editing
  startContinuousSpin();
}

function handleTextareaKeydown(e) {
  // Only allow Enter if not yet applied
  if (isApplied) return;

  // When Enter is pressed, add to wheel immediately
  if (e.key === 'Enter') {
    handleTextareaInput();
  }
}

// ========= EVENT LISTENERS =========
document.addEventListener('DOMContentLoaded', function () {
  // Apply button
  if (applyButton) {
    applyButton.addEventListener('click', applyEntries);
  }

  // Clear button
  if (clearButton) {
    clearButton.addEventListener('click', clearAll);
  }

  // Spin button
  if (spinButton) {
    spinButton.addEventListener('click', spinWheel);
  }

  // Back button
  if (backButton) {
    backButton.addEventListener('click', goBack);
  }

  // Textarea input - realtime update (only before apply)
  if (entriesTextarea) {
    entriesTextarea.addEventListener('input', handleTextareaInput);
    entriesTextarea.addEventListener('keydown', handleTextareaKeydown);
  }


  console.log('✅ Roulette.js loaded (Wheel of Names style)');
  console.log('🎰 Room:', roomId);
});

// ========= HELPER: PLAY SOUND =========
function playSound(audio) {
  if (!audio) return;

  // Reset time to 0 before playing
  audio.currentTime = 0;

  // Play with error handling (browsers might block autoplay)
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn('Audio play failed:', error);
    });
  }
}

// ========= HELPER: STOP SOUND =========
function stopSound(audio) {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}

// ========= KEYBOARD SHORTCUTS =========
document.addEventListener('keydown', function (e) {
  // ESC key - back
  if (e.key === 'Escape') {
    if (backButton && !isSpinning) {
      backButton.click();
    }
  }

  // Space or Enter to spin
  if ((e.key === ' ' || e.key === 'Enter') && e.ctrlKey && entries.length >= 1 && !isSpinning && isApplied) {
    e.preventDefault();
    spinWheel();
  }
});

// ========= EXPORT FOR MODULES =========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    applyEntries,
    spinWheel,
    clearAll
  };
}

