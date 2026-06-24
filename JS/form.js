/*************************************************
 * FORM.JS – WITH YOUTUBE EMBED VALIDATION + EMOTE + QUEUE LIMIT + EDIT REQUEST
 * ✅ User bisa edit request jika posisi antrean >= 3
 * ✅ Posisi 1 dan 2 sudah tidak bisa edit
 *************************************************/

// ================= CONSTANTS =================
const MAX_QUEUE = 25;

// ================= INIT ROOM SYSTEM =================
console.log('🔄 Initializing room system...');

if (!window.RoomManager) {
  console.error('❌ RoomManager not loaded!');
  alert('Error: Room system tidak tersedia. Silakan refresh halaman.');
  throw new Error('RoomManager not loaded');
}

if (!RoomManager.initRoomSystem()) {
  console.error('❌ Room system initialization failed');
  throw new Error('Room system initialization failed');
}

// ================= FIREBASE DENGAN ROOM =================
const queueRef = RoomManager.getQueueRef();
const roomRef = RoomManager.getRoomRef();
const emotesRef = roomRef.child('emotes');

if (!queueRef) {
  console.error('❌ Queue reference not available');
  alert('Error: Tidak dapat terhubung ke database. Silakan pilih bus dari menu utama.');
  throw new Error('Queue reference not available');
}

console.log('✅ Room system initialized successfully');
console.log('✅ Emotes ref:', emotesRef.toString());

// ================= DEVICE ID =================
function getDeviceId() {
  let deviceId = localStorage.getItem("karaoke_device_id");
  if (!deviceId) {
    deviceId = "DEV_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("karaoke_device_id", deviceId);
  }
  return deviceId;
}

const DEVICE_ID = getDeviceId();

// ================= EDIT STATE =================
let isEditMode = false;
let editingKey = null;

// ================= AUTO-FILL NAME FROM LOCALSTORAGE =================
window.addEventListener('DOMContentLoaded', function () {
  const savedName = localStorage.getItem('karaoke_user_name');
  const nameInput = document.getElementById('name');
  if (savedName && nameInput) {
    nameInput.value = savedName;
    console.log('✅ Auto-filled name:', savedName);
  }
});

// ================= UTIL =================
function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

// ================= SHOW ALERT =================
function showAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.textContent = message;
  alert.className = `alert ${type}`;
  alert.style.display = "block";
  setTimeout(() => {
    alert.style.display = "none";
  }, 5000);
}

// ================= CEK DEVICE DI ANTREAN =================
function checkDeviceInQueue(deviceId) {
  return new Promise((resolve) => {
    queueRef.once("value", snap => {
      if (!snap.exists()) { resolve(false); return; }
      const data = snap.val();
      const devices = Object.values(data).map(item => item.deviceId);
      resolve(devices.includes(deviceId));
    });
  });
}

// ================= CEK JUMLAH ANTREAN =================
function checkQueueCount() {
  return new Promise((resolve) => {
    queueRef.once("value", snap => {
      if (!snap.exists()) { resolve(0); return; }
      resolve(Object.keys(snap.val()).length);
    });
  });
}

// ================= CEK ANTREAN PENUH =================
async function isQueueFull() {
  const count = await checkQueueCount();
  return count >= MAX_QUEUE;
}

// ================= GET DATA REQUEST SAYA =================
function getMyRequest(deviceId) {
  return new Promise((resolve) => {
    queueRef.orderByChild('order').once("value", snap => {
      if (!snap.exists()) { resolve(null); return; }
      const items = [];
      snap.forEach(child => {
        items.push({ key: child.key, ...child.val() });
      });
      // Urutkan berdasarkan order
      items.sort((a, b) => a.order - b.order);
      const myItem = items.find(item => item.deviceId === deviceId);
      if (!myItem) { resolve(null); return; }
      const position = items.findIndex(item => item.deviceId === deviceId) + 1;
      resolve({ ...myItem, position });
    });
  });
}

// ================= VALIDATE YOUTUBE EMBED =================
async function validateYouTubeEmbed(videoId) {
  try {
    console.log("🔍 Checking embed status for:", videoId);
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    if (response.ok) {
      console.log("✅ Video can be embedded");
      return { canEmbed: true, reason: null };
    } else {
      console.warn("⚠️ Video cannot be embedded");
      return {
        canEmbed: false,
        reason: "Video ini tidak bisa diputar di layar karaoke (embed dinonaktifkan oleh pemilik video atau ada pembatasan copyright)."
      };
    }
  } catch (error) {
    console.error("❌ Embed check failed:", error);
    return { canEmbed: true, reason: null };
  }
}

// ================= ENTER EDIT MODE =================
async function enterEditMode() {
  const myRequest = await getMyRequest(DEVICE_ID);

  if (!myRequest) {
    showAlert("❌ Kamu tidak memiliki request aktif di antrean!", "error");
    return;
  }

  if (myRequest.position <= 2) {
    showAlert(`⚠️ Posisi kamu di antrean ke-${myRequest.position}. Sudah tidak bisa diedit karena akan segera diputar!`, "error");
    return;
  }

  // Masuk ke mode edit
  isEditMode = true;
  editingKey = myRequest.key;

  // Isi form dengan data yang ada
  const nameInput = document.getElementById('name');
  const linkInput = document.getElementById('youtube-link');
  const submitBtn = document.querySelector('.submit-button');
  const editBtn = document.getElementById('edit-request-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editBadge = document.getElementById('edit-mode-badge');

  if (nameInput) nameInput.value = myRequest.name;
  if (linkInput) linkInput.value = `https://www.youtube.com/watch?v=${myRequest.videoId}`;

  // Update UI ke mode edit
  if (submitBtn) {
    submitBtn.innerHTML = '<span class="button-icon">✏️</span><span class="button-text">Simpan Perubahan</span>';
    submitBtn.classList.add('edit-mode-btn');
  }
  if (editBtn) editBtn.style.display = 'none';
  if (cancelEditBtn) cancelEditBtn.style.display = 'flex';
  if (editBadge) editBadge.style.display = 'flex';

  // Scroll ke form
  document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
  if (nameInput) nameInput.focus();

  showAlert(`✏️ Mode Edit aktif! Kamu sedang mengedit request di posisi antrean ke-${myRequest.position}.`, "success");
  console.log('✅ Edit mode entered for key:', editingKey, 'position:', myRequest.position);
}

// ================= CANCEL EDIT MODE =================
function cancelEditMode() {
  isEditMode = false;
  editingKey = null;

  const nameInput = document.getElementById('name');
  const linkInput = document.getElementById('youtube-link');
  const submitBtn = document.querySelector('.submit-button');
  const editBtn = document.getElementById('edit-request-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editBadge = document.getElementById('edit-mode-badge');

  // Kosongkan link, tapi pertahankan nama
  if (linkInput) linkInput.value = '';

  // Kembalikan UI ke mode normal
  if (submitBtn) {
    submitBtn.innerHTML = '<span class="button-icon">➕</span><span class="button-text">Tambah Antrean</span>';
    submitBtn.classList.remove('edit-mode-btn');
  }
  if (editBtn) editBtn.style.display = 'flex';
  if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  if (editBadge) editBadge.style.display = 'none';

  showAlert("✅ Edit dibatalkan.", "success");
  console.log('❌ Edit mode cancelled');
}

// ================= SAVE EDIT =================
async function saveEdit() {
  const nameInput = document.getElementById("name");
  const linkInput = document.getElementById("youtube-link");

  const name = nameInput.value.trim();
  const link = linkInput.value.trim();

  if (!name || !link) {
    showAlert("❌ Nama dan link YouTube wajib diisi!", "error");
    return;
  }

  if (name.length < 2) {
    showAlert("❌ Nama minimal 2 karakter!", "error");
    return;
  }

  const videoId = extractVideoId(link);
  if (!videoId) {
    showAlert("❌ Link YouTube tidak valid!", "error");
    return;
  }

  // Cek apakah posisi masih bisa diedit (belum <= 2)
  const myRequest = await getMyRequest(DEVICE_ID);
  if (!myRequest) {
    showAlert("❌ Request tidak ditemukan. Mungkin sudah diputar atau dihapus.", "error");
    cancelEditMode();
    return;
  }

  if (myRequest.position <= 2) {
    showAlert(`⚠️ Posisi kamu sudah ke-${myRequest.position}! Sudah tidak bisa diedit.`, "error");
    cancelEditMode();
    return;
  }

  // Validasi embed
  const embedCheck = await validateYouTubeEmbed(videoId);
  if (!embedCheck.canEmbed) {
    showAlert(`⚠️ ${embedCheck.reason} Silakan pilih video lain.`, "error");
    return;
  }

  // Simpan nama ke localStorage
  localStorage.setItem('karaoke_user_name', name);

  // Update Firebase
  try {
    await queueRef.child(editingKey).update({
      name: name,
      videoId: videoId,
      updatedAt: Date.now()
    });

    showAlert(`✅ Request berhasil diupdate! "${name}" sudah diperbarui.`, "success");
    cancelEditMode();
    console.log('✅ Request updated successfully');
  } catch (error) {
    console.error('❌ Update error:', error);
    showAlert("❌ Gagal menyimpan perubahan. Coba lagi.", "error");
  }
}

// ================= SUBMIT SONG (tambah baru) =================
async function submitSong() {
  // Jika sedang dalam mode edit, jalankan saveEdit
  if (isEditMode) {
    await saveEdit();
    return;
  }

  const nameInput = document.getElementById("name");
  const linkInput = document.getElementById("youtube-link");

  const name = nameInput.value.trim();
  const link = linkInput.value.trim();

  if (!name || !link) {
    showAlert("❌ Nama dan link YouTube wajib diisi!", "error");
    return;
  }

  if (name.length < 2) {
    showAlert("❌ Nama minimal 2 karakter!", "error");
    return;
  }

  const videoId = extractVideoId(link);
  if (!videoId) {
    showAlert("❌ Link YouTube tidak valid!", "error");
    return;
  }

  // Validasi batas antrean
  if (await isQueueFull()) {
    showAlert("⚠️ Mohon maaf antrean penuh. Silahkan tunggu beberapa saat lagi.", "error");
    return;
  }

  // Save name to localStorage
  localStorage.setItem('karaoke_user_name', name);

  // Validasi embed
  const embedCheck = await validateYouTubeEmbed(videoId);
  if (!embedCheck.canEmbed) {
    showAlert(`⚠️ ${embedCheck.reason} Silakan pilih video lain.`, "error");
    return;
  }

  const deviceExists = await checkDeviceInQueue(DEVICE_ID);
  if (deviceExists) {
    const myRequest = await getMyRequest(DEVICE_ID);
    const positionText = myRequest ? ` (posisi ke-${myRequest.position})` : '';
    showAlert(
      `⏳ Device ini sudah ada request aktif${positionText}. Tunggu sampai lagu selesai ya! 🎤`,
      "error"
    );
    return;
  }

  queueRef.once("value", snap => {
    let maxOrder = 0;
    if (snap.exists()) {
      snap.forEach(child => {
        if (child.val().order > maxOrder) maxOrder = child.val().order;
      });
    }

    queueRef.push({
      name: name,
      videoId: videoId,
      deviceId: DEVICE_ID,
      order: maxOrder + 1,
      createdAt: Date.now()
    }, async (error) => {
      if (error) {
        showAlert("❌ Gagal menambahkan lagu. Coba lagi!", "error");
      } else {
        showAlert(`✅ Berhasil! Lagu kamu ditambahkan ke antrean. Terima kasih ${name}! 🎉`, "success");
        linkInput.value = "";
        linkInput.focus();
      }
    });
  });
}

// ================= 🎭 SEND EMOTE =================
window.sendEmote = async function (emoji, emoteName) {
  console.log('🎭 sendEmote called!');
  const nameInput = document.getElementById("name");
  const name = nameInput.value.trim();

  if (!name) {
    showAlert("❌ Masukkan nama kamu terlebih dahulu untuk kirim emote!", "error");
    nameInput.focus();
    nameInput.style.borderColor = "#ef4444";
    nameInput.style.animation = "shake 0.5s";
    setTimeout(() => {
      nameInput.style.borderColor = "";
      nameInput.style.animation = "";
    }, 500);
    return;
  }

  if (name.length < 2) {
    showAlert("❌ Nama minimal 2 karakter!", "error");
    nameInput.focus();
    return;
  }

  localStorage.setItem('karaoke_user_name', name);

  const lastEmoteTime = localStorage.getItem('last_emote_time');
  const now = Date.now();
  if (lastEmoteTime && (now - parseInt(lastEmoteTime)) < 2000) {
    showAlert('⏳ Tunggu 2 detik sebelum kirim emote lagi!', 'error');
    return;
  }

  try {
    const emoteData = {
      name: name,
      emote: emoji,
      emoteName: emoteName,
      timestamp: Date.now()
    };
    await emotesRef.push(emoteData);
    localStorage.setItem('last_emote_time', now);
    showAlert(`✅ ${emoteName} "${emoji}" dari ${name} terkirim ke layar!`, 'success');
  } catch (error) {
    console.error('❌ Failed to send emote:', error);
    showAlert('❌ Gagal mengirim emote. Coba lagi!', 'error');
  }
};

// ================= UPDATE STATUS & TAMPILKAN TOMBOL EDIT =================
queueRef.on("value", snap => {
  const queueCount = document.getElementById("queue-count");
  const queueStatus = document.getElementById("queue-status");
  const editBtn = document.getElementById('edit-request-btn');

  if (!snap.exists()) {
    if (queueCount) queueCount.textContent = `0/${MAX_QUEUE}`;
    if (queueStatus) {
      queueStatus.innerHTML = "⏳ Menunggu antrean...";
      queueStatus.style.background = "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)";
      queueStatus.style.color = "#0369a1";
    }
    // Sembunyikan tombol edit jika tidak ada request
    if (editBtn) editBtn.style.display = 'none';
    // Jika edit mode aktif tapi request hilang, batalkan edit mode
    if (isEditMode) cancelEditMode();
    return;
  }

  const data = snap.val();
  const items = Object.values(data);
  const sortedItems = Object.entries(data)
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => a.order - b.order);

  const count = items.length;
  if (queueCount) queueCount.textContent = `${count}/${MAX_QUEUE}`;

  const myItem = sortedItems.find(item => item.deviceId === DEVICE_ID);

  if (myItem) {
    const position = sortedItems.findIndex(item => item.deviceId === DEVICE_ID) + 1;

    // Tampilkan tombol Edit jika posisi >= 3 dan tidak sedang edit mode
    if (editBtn) {
      if (position >= 3 && !isEditMode) {
        editBtn.style.display = 'flex';
        editBtn.innerHTML = `<span>✏️</span> Edit Request (Posisi ke-${position})`;
      } else {
        editBtn.style.display = 'none';
      }
    }

    if (queueStatus) {
      if (position === 1) {
        queueStatus.innerHTML = `🎤 <strong>${myItem.name}</strong> kamu sedang bernyanyi! Bersiap ya! 🎵`;
        queueStatus.style.background = "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)";
        queueStatus.style.color = "#166534";
      } else if (position === 2) {
        queueStatus.innerHTML = `⏭️ <strong>${myItem.name}</strong> kamu ada di urutan ke-2! Bersiap-siap ya! 🎤`;
        queueStatus.style.background = "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)";
        queueStatus.style.color = "#92400e";
      } else {
        queueStatus.innerHTML = `⏳ <strong>${myItem.name}</strong> kamu ada di urutan ke-${position}. Tunggu ya! 🎵`;
        queueStatus.style.background = "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)";
        queueStatus.style.color = "#92400e";
      }
    }

    // Jika sedang edit mode dan posisi berubah jadi <= 2, batalkan edit
    if (isEditMode && position <= 2) {
      showAlert(`⚠️ Posisi kamu sudah ke-${position}! Mode edit dibatalkan otomatis.`, "error");
      cancelEditMode();
    }

  } else {
    // User tidak ada di antrean
    if (editBtn) editBtn.style.display = 'none';
    if (isEditMode) cancelEditMode();

    if (queueStatus) {
      const nowPlaying = sortedItems[0];
      if (nowPlaying) {
        queueStatus.innerHTML = `🎤 <strong>${nowPlaying.name}</strong> sedang bernyanyi! ${count > 1 ? `(${count - 1} orang menunggu)` : ''}`;
      } else {
        queueStatus.innerHTML = "⏳ Menunggu antrean...";
      }
      queueStatus.style.background = "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)";
      queueStatus.style.color = "#166534";
    }
  }
});

// ================= SHAKE ANIMATION =================
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// ================= ENTER KEY =================
document.addEventListener('DOMContentLoaded', function () {
  const nameEl = document.getElementById("name");
  const linkEl = document.getElementById("youtube-link");

  if (nameEl) {
    nameEl.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        if (linkEl) linkEl.focus();
      }
    });
  }

  if (linkEl) {
    linkEl.addEventListener("keypress", function (e) {
      if (e.key === "Enter") submitSong();
    });
  }

  // Tombol edit & cancel
  const editBtn = document.getElementById('edit-request-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  if (editBtn) editBtn.addEventListener('click', enterEditMode);
  if (cancelBtn) cancelBtn.addEventListener('click', cancelEditMode);
});

console.log('✅ Form.js with Edit Request feature loaded');