/*************************************************
 * ROULETTE-FORM.JS - User Roulette Registration
 * ✅ User scan QR → masukkan nama → otomatis masuk roda
 * ✅ 1 nama per device (pakai deviceId)
 * ✅ Bisa daftar lagi saat admin reset
 * ✅ Real-time sync daftar peserta
 *************************************************/

// ========= GET ROOM ID =========
const roomId = (function() {
  const params = new URLSearchParams(window.location.search);
  let id = params.get('room');
  if (!id) id = localStorage.getItem('karaoke_room_id');
  if (!id) {
    alert('Room ID tidak ditemukan. Kembali ke beranda.');
    window.location.href = 'index.html';
    return null;
  }
  localStorage.setItem('karaoke_room_id', id);
  return id;
})();

// ========= GENERATE DEVICE ID (Unik per device) =========
function getDeviceId() {
  let deviceId = localStorage.getItem('roulette_device_id');
  if (!deviceId) {
    deviceId = 'RDEV_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('roulette_device_id', deviceId);
  }
  return deviceId;
}

const deviceId = getDeviceId();

// ========= FIREBASE REFS =========
const rouletteRef = db.ref(`karaoke/room/${roomId}/rouletteEntries`);

// ========= DOM ELEMENTS =========
const nameInput = document.getElementById('name');
const submitBtn = document.getElementById('submit-btn');
const alertDiv = document.getElementById('alert');
const statusMessage = document.getElementById('status-message');
const participantsPreview = document.getElementById('participants-preview');

// ========= STATE =========
let hasSubmitted = false;
let myName = '';

// ========= INIT =========
(function init() {
  // Load nama dari localStorage
  const savedName = localStorage.getItem('roulette_user_name');
  if (savedName) {
    nameInput.value = savedName;
  }
  
  // Cek apakah device sudah pernah submit
  checkExistingEntry();
  
  // Listen real-time untuk daftar peserta
  listenParticipants();
})();

// ========= CEK APAKAH DEVICE SUDAH SUBMIT =========
function checkExistingEntry() {
  rouletteRef.orderByChild('deviceId').equalTo(deviceId).once('value', (snapshot) => {
    if (snapshot.exists()) {
      hasSubmitted = true;
      snapshot.forEach((child) => {
        myName = child.val().name;
      });
      
      nameInput.value = myName;
      nameInput.disabled = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="button-icon">✅</span><span class="button-text">Sudah Terdaftar</span>';
      
      showAlert('success', `✅ Kamu sudah terdaftar sebagai "${myName}". Tunggu admin memutar roda ya!`);
    }
  });
}

// ========= SUBMIT NAMA =========
async function submitName() {
  const name = nameInput.value.trim();
  
  // Validasi kosong
  if (!name) {
    showAlert('error', '❌ Nama tidak boleh kosong!');
    nameInput.focus();
    return;
  }
  
  // Validasi panjang
  if (name.length < 2) {
    showAlert('error', '❌ Nama minimal 2 karakter!');
    nameInput.focus();
    return;
  }
  
  if (name.length > 30) {
    showAlert('error', '❌ Nama maksimal 30 karakter!');
    nameInput.focus();
    return;
  }
  
  // Cek ulang apakah sudah submit
  if (hasSubmitted) {
    showAlert('warning', '⚠️ Kamu sudah terdaftar! Hanya bisa 1 nama per device.');
    return;
  }
  
  // Cek duplikat device di Firebase
  const existingSnap = await rouletteRef.orderByChild('deviceId').equalTo(deviceId).once('value');
  if (existingSnap.exists()) {
    hasSubmitted = true;
    showAlert('warning', '⚠️ Device ini sudah mendaftarkan nama. Tunggu admin reset untuk daftar lagi.');
    nameInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="button-icon">✅</span><span class="button-text">Sudah Terdaftar</span>';
    return;
  }
  
  // Cek duplikat nama
  const nameSnap = await rouletteRef.orderByChild('name').equalTo(name).once('value');
  if (nameSnap.exists()) {
    showAlert('error', `❌ Nama "${name}" sudah dipakai orang lain! Gunakan nama berbeda.`);
    return;
  }
  
  // Disable button saat proses
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="button-icon">⏳</span><span class="button-text">Mendaftar...</span>';
  
  try {
    // Push ke Firebase
    await rouletteRef.push({
      name: name,
      deviceId: deviceId,
      createdAt: Date.now()
    });
    
    hasSubmitted = true;
    myName = name;
    
    // Simpan nama ke localStorage
    localStorage.setItem('roulette_user_name', name);
    
    // Update UI
    nameInput.disabled = true;
    submitBtn.innerHTML = '<span class="button-icon">✅</span><span class="button-text">Sudah Terdaftar</span>';
    
    showAlert('success', `🎉 Berhasil! "${name}" sudah masuk ke roda roulette. Tunggu admin memutar roda ya!`);
    
    console.log('✅ Roulette entry submitted:', name);
    
  } catch (error) {
    console.error('❌ Error submitting:', error);
    showAlert('error', '❌ Gagal mendaftar. Coba lagi.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="button-icon">🎯</span><span class="button-text">Daftar Roulette</span>';
  }
}

// ========= LISTEN DAFTAR PESERTA REAL-TIME =========
function listenParticipants() {
  rouletteRef.on('value', (snapshot) => {
    if (!snapshot.exists()) {
      statusMessage.innerHTML = '⏳ Menunggu peserta...';
      participantsPreview.innerHTML = '<div class="no-participants">Belum ada peserta terdaftar</div>';
      
      // Jika data di-reset admin, buka kembali form
      if (hasSubmitted) {
        hasSubmitted = false;
        myName = '';
        nameInput.disabled = false;
        nameInput.value = localStorage.getItem('roulette_user_name') || '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="button-icon">🎯</span><span class="button-text">Daftar Roulette</span>';
        alertDiv.style.display = 'none';
        alertDiv.className = 'alert';
      }
      return;
    }
    
    const entries = [];
    snapshot.forEach((child) => {
      entries.push(child.val());
    });
    
    const count = entries.length;
    statusMessage.innerHTML = `🎰 <strong>${count}</strong> peserta terdaftar`;
    
    // Render tags
    let html = '';
    entries.forEach((entry) => {
      const isMe = entry.deviceId === deviceId;
      html += `<span class="participant-tag ${isMe ? 'is-me' : ''}">${isMe ? '👤 ' : ''}${entry.name}</span>`;
    });
    participantsPreview.innerHTML = html;
    
    // Cek apakah entry saya masih ada (mungkin dihapus karena menang)
    const myEntry = entries.find(e => e.deviceId === deviceId);
    if (!myEntry && hasSubmitted) {
      // Entry saya dihapus (mungkin menang atau di-reset sebagian)
      hasSubmitted = false;
      myName = '';
      nameInput.disabled = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="button-icon">🎯</span><span class="button-text">Daftar Roulette</span>';
      showAlert('warning', '🎉 Nama kamu sudah dikeluarkan dari roda! Kamu bisa daftar lagi jika mau.');
    }
  });
}

// ========= SHOW ALERT =========
function showAlert(type, message) {
  alertDiv.className = `alert ${type}`;
  alertDiv.innerHTML = message;
  alertDiv.style.display = 'block';
  
  // Auto hide setelah 8 detik kecuali success
  if (type !== 'success') {
    setTimeout(() => {
      alertDiv.style.display = 'none';
      alertDiv.className = 'alert';
    }, 8000);
  }
}

// ========= EVENT LISTENERS =========
submitBtn.addEventListener('click', submitName);

nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    submitName();
  }
});

console.log('✅ Roulette-form.js loaded for room:', roomId);