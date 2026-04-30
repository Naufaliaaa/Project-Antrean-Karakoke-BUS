/*************************************************
 * ROULETTE.JS - Wheel of Names Style
 * ✅ SVG-based spinning wheel with smooth animations
 * ✅ NEW: Online entries dari Firebase (user scan QR)
 * ✅ NEW: Tab Online / Manual
 * ✅ NEW: QR Code untuk link roulette-form.html
 * ✅ Manual input tetap ada sebagai tambahan
 * ✅ 1 nama per device (online)
 *************************************************/

// ========= GET ROOM ID =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// ========= FIREBASE REF FOR ONLINE ENTRIES =========
const rouletteEntriesRef = db.ref(`karaoke/room/${roomId}/rouletteEntries`);

// ========= STATE =========
let entries = [];
let appliedEntries = [];
let currentRotation = 0;
let isSpinning = false;
let winners = [];
let isApplied = false;
let activeTab = 'online'; // 'online' or 'manual'
let onlineEntries = []; // Entries dari Firebase

// ========= SOUND EFFECTS =========
const spinSound = new Audio('sounds/roulette.mp3');
const winSound = new Audio('sounds/win.mp3');
spinSound.loop = true;

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
const onlineEntriesList = document.getElementById('online-entries-list');
const onlineEntriesCountEl = document.getElementById('online-entries-count');

// Tab elements
const tabOnline = document.getElementById('tab-online');
const tabManual = document.getElementById('tab-manual');
const tabContentOnline = document.getElementById('tab-content-online');
const tabContentManual = document.getElementById('tab-content-manual');

// ========= COLORS =========
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52BE80', '#EC7063', '#5DADE2',
  '#FF9F1C', '#2EC4B6', '#E71D36', '#FFB627',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C'
];

// ========= GENERATE QR CODE =========
function generateRouletteQR() {
  console.log('📱 Generating Roulette QR code...');
  
  if (!roomId) return;
  
  const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  const url = `${base}roulette-form.html?room=${roomId}`;
  
  const img = document.getElementById('roulette-qr-image');
  const txt = document.getElementById('roulette-form-url');
  
  if (img) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    img.src = qrUrl;
    img.onload = () => console.log('✅ QR image loaded');
    img.onerror = () => console.error('❌ QR image failed');
  }
  
  if (txt) {
    txt.textContent = url;
  }
}

// ========= LISTEN ONLINE ENTRIES (FIREBASE) =========
function listenOnlineEntries() {
  rouletteEntriesRef.on('value', (snapshot) => {
    onlineEntries = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        onlineEntries.push({
          key: child.key,
          ...child.val()
        });
      });
    }
    
    console.log(`📱 Online entries: ${onlineEntries.length}`);
    
    // Update online count
    if (onlineEntriesCountEl) {
      onlineEntriesCountEl.textContent = `${onlineEntries.length} peserta online terdaftar`;
    }
    
    // Render online entries list
    renderOnlineEntries();
    
    // Jika tab online aktif dan belum di-apply, update wheel preview
    if (activeTab === 'online' && !isApplied) {
      entries = onlineEntries.map(e => e.name);
      updateEntriesCount();
      createWheelSlices();
      startContinuousSpin();
    }
  });
}

// ========= RENDER ONLINE ENTRIES LIST =========
function renderOnlineEntries() {
  if (!onlineEntriesList) return;
  
  if (onlineEntries.length === 0) {
    onlineEntriesList.innerHTML = '<div class="empty-online">Belum ada peserta online. Bagikan QR Code!</div>';
    return;
  }
  
  let html = '';
  onlineEntries.forEach((entry, index) => {
    html += `
      <div class="online-entry-item">
        <span class="online-entry-number">${index + 1}</span>
        <span class="online-entry-name">${entry.name}</span>
      </div>
    `;
  });
  
  onlineEntriesList.innerHTML = html;
}

// ========= TAB SWITCHING =========
function switchTab(tab) {
  activeTab = tab;
  
  // Update tab buttons
  tabOnline.classList.toggle('active', tab === 'online');
  tabManual.classList.toggle('active', tab === 'manual');
  
  // Update tab content
  tabContentOnline.classList.toggle('active', tab === 'online');
  tabContentManual.classList.toggle('active', tab === 'manual');
  
  // Jika belum di-apply, update wheel sesuai tab
  if (!isApplied) {
    if (tab === 'online') {
      entries = onlineEntries.map(e => e.name);
    } else {
      const text = entriesTextarea.value.trim();
      entries = parseEntries(text);
    }
    updateEntriesCount();
    createWheelSlices();
    if (entries.length > 0) {
      startContinuousSpin();
    }
  }
  
  console.log('📑 Tab switched to:', tab);
}

// ========= PARSE ENTRIES (Manual) =========
function parseEntries(text) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return [...new Set(lines)];
}

// ========= UPDATE ENTRIES COUNT =========
function updateEntriesCount() {
  const count = entries.length;
  entriesCount.textContent = `${count} peserta`;
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
    const startAngle = index * sliceAngle - 90;
    const endAngle = startAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', colors[index % colors.length]);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '3');
    path.classList.add('wheel-slice');

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

// ========= CONTINUOUS SPIN =========
function startContinuousSpin() {
  wheelSvg.classList.add('continuous-spin');
}

function stopContinuousSpin() {
  wheelSvg.classList.remove('continuous-spin');
  wheelSvg.style.transform = 'rotate(0deg)';
  currentRotation = 0;
}

// ========= APPLY ENTRIES =========
async function applyEntries() {
  let newEntries = [];
  
  if (activeTab === 'online') {
    // Ambil dari online entries Firebase
    newEntries = onlineEntries.map(e => e.name);
  } else {
    // Ambil dari textarea manual
    const text = entriesTextarea.value.trim();
    if (!text) {
      await customWarning('Silakan masukkan nama peserta terlebih dahulu!', 'Input Kosong');
      return;
    }
    newEntries = parseEntries(text);
  }

  if (newEntries.length < 1) {
    await customWarning('Minimal perlu ada 1 peserta untuk roulette!', 'Peserta Kurang');
    return;
  }

  entries = newEntries;
  appliedEntries = [...entries];
  isApplied = true;

  stopContinuousSpin();

  // Disable inputs setelah apply
  if (entriesTextarea) entriesTextarea.disabled = true;
  applyButton.disabled = true;

  updateEntriesCount();
  createWheelSlices();

  winnerAnnouncement.style.display = 'none';

  console.log('✅ Entries applied:', entries.length, '(source:', activeTab, ')');
}

// ========= CLEAR ALL =========
async function clearAll() {
  const result = await customConfirm(
    'Apakah Anda yakin ingin menghapus semua data? Data peserta online juga akan dihapus.',
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

  if (entriesTextarea) {
    entriesTextarea.value = '';
    entriesTextarea.disabled = false;
  }
  applyButton.disabled = false;

  updateEntriesCount();
  wheelSlices.innerHTML = '';
  winnerAnnouncement.style.display = 'none';
  winnersSection.style.display = 'none';
  currentRotation = 0;
  wheelSvg.style.transform = 'rotate(0deg)';

  stopSound(spinSound);
  stopSound(winSound);

  // ✅ NEW: Hapus online entries dari Firebase (agar user bisa daftar ulang)
  try {
    await rouletteEntriesRef.remove();
    console.log('✅ Online entries cleared from Firebase');
  } catch (error) {
    console.error('❌ Error clearing online entries:', error);
  }

  console.log('✅ All data cleared');
}

// ========= SPIN WHEEL =========
async function spinWheel() {
  if (isSpinning || entries.length < 1) return;

  isSpinning = true;
  spinButton.disabled = true;
  winnerAnnouncement.style.display = 'none';

  const winnerIndex = Math.floor(Math.random() * entries.length);
  const winner = entries[winnerIndex];

  console.log('🎯 Winner selected:', winner);

  const sliceAngle = 360 / entries.length;
  const targetSliceRotation = winnerIndex * sliceAngle + sliceAngle / 2;

  const fullRotations = 5 + Math.random() * 3;
  const totalRotation = currentRotation + (360 * fullRotations) - targetSliceRotation + 90;

  const duration = 7000;
  const startTime = Date.now();
  const startRotation = currentRotation;

  wheelSvg.classList.add('spinning');

  playSound(spinSound);

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

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
  winnerText.textContent = winner;
  winnerAnnouncement.style.display = 'flex';

  stopSound(spinSound);
  playSound(winSound);

  winners.push(winner);
  updateWinnersList();

  createConfetti();

  await customSuccess(`🎉 ${winner} terpilih sebagai pemenang!`, {
    title: '🏆 PEMENANG!',
    icon: '🎊'
  });

  if (removeWinnerCheckbox.checked) {
    entries = entries.filter(e => e !== winner);
    updateEntriesCount();

    if (entriesTextarea) {
      entriesTextarea.value = entries.join('\n');
    }

    // ✅ NEW: Hapus pemenang dari Firebase online entries juga
    if (activeTab === 'online') {
      const winnerEntry = onlineEntries.find(e => e.name === winner);
      if (winnerEntry && winnerEntry.key) {
        try {
          await rouletteEntriesRef.child(winnerEntry.key).remove();
          console.log('✅ Winner removed from Firebase:', winner);
        } catch (error) {
          console.error('❌ Error removing winner from Firebase:', error);
        }
      }
    }

    createWheelSlices();

    if (entries.length === 1) {
      await customSuccess(`${entries[0]} adalah nominasi terakhir!`, {
        title: '🎯 Nominasi Terakhir',
        icon: '🏁'
      });
    } else if (entries.length < 1) {
      await customSuccess('Semua pemenang telah terpilih!', {
        title: '✅ Selesai',
        icon: '🏁'
      });
      spinButton.disabled = true;
    }
  }

  isSpinning = false;
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
      'Apakah Anda yakin ingin kembali ke menu?\nSemua data akan hilang.',
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

  stopSound(spinSound);
  stopSound(winSound);

  window.location.href = `bus-menu.html?room=${roomId}`;
}

// ========= TEXTAREA INPUT - REALTIME UPDATE =========
function handleTextareaInput() {
  if (isApplied) return;
  if (activeTab !== 'manual') return;

  const text = entriesTextarea.value.trim();
  const tempEntries = parseEntries(text);
  entriesCount.textContent = `${tempEntries.length} peserta`;

  entries = tempEntries;
  createWheelSlices();
  startContinuousSpin();
}

function handleTextareaKeydown(e) {
  if (isApplied) return;
  if (activeTab !== 'manual') return;

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

  // Textarea input (manual tab)
  if (entriesTextarea) {
    entriesTextarea.addEventListener('input', handleTextareaInput);
    entriesTextarea.addEventListener('keydown', handleTextareaKeydown);
  }

  // Tab switching
  if (tabOnline) {
    tabOnline.addEventListener('click', () => switchTab('online'));
  }
  if (tabManual) {
    tabManual.addEventListener('click', () => switchTab('manual'));
  }

  // Generate QR Code
  generateRouletteQR();

  // Listen online entries dari Firebase
  listenOnlineEntries();

  console.log('✅ Roulette.js loaded (with Online Entries)');
  console.log('🎰 Room:', roomId);
});

// ========= HELPER: PLAY/STOP SOUND =========
function playSound(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn('Audio play failed:', error);
    });
  }
}

function stopSound(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

// ========= KEYBOARD SHORTCUTS =========
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (backButton && !isSpinning) {
      backButton.click();
    }
  }

  if ((e.key === ' ' || e.key === 'Enter') && e.ctrlKey && entries.length >= 1 && !isSpinning && isApplied) {
    e.preventDefault();
    spinWheel();
  }
});

// ========= EXPORT =========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    applyEntries,
    spinWheel,
    clearAll
  };
}