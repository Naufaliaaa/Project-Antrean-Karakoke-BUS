/*************************************************
 * PIN-LOGIN.JS - Modal Style with PIN Boxes
 *************************************************/

// ========= GET ROOM ID =========
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

if (!roomId) {
  window.location.href = 'index.html';
}

// ========= HAPUS TOKEN LAMA =========
sessionStorage.removeItem(`room_token_${roomId}`);
sessionStorage.removeItem(`room_pin_verified_${roomId}`);

// ========= ELEMENTS =========
const pinBoxes = document.querySelectorAll('.pin-box');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const errorMessage = document.getElementById('error-message');
const busNameEl = document.getElementById('bus-name');
const busIdEl = document.getElementById('bus-id');

// ========= BUS DATA MAPPING =========
const busData = {
  'BUS-001': { name: 'Hiace 1', displayId: 'HIC-001' },
  'BUS-002': { name: 'Hiace 2', displayId: 'HIC-002' },
  'BUS-003': { name: 'Hiace 3', displayId: 'HIC-003' },
  'BUS-004': { name: 'Hiace 4', displayId: 'HIC-004' },
  'BUS-005': { name: 'Hiace 5', displayId: 'HIC-005' },
  'BUS-006': { name: 'Hiace 6', displayId: 'HIC-006' },
  'BUS-007': { name: 'Hiace 7', displayId: 'HIC-007' },
};

// ========= SET BUS INFO =========
function setBusInfo() {
  const bus = busData[roomId] || { name: roomId, displayId: roomId };
  
  if (busNameEl) busNameEl.textContent = bus.name;
  if (busIdEl) busIdEl.textContent = bus.displayId;
  
  console.log('✅ Bus info set:', bus);
}

// ========= PIN BOX NAVIGATION =========
pinBoxes.forEach((box, index) => {
  // Auto-focus first box on load
  if (index === 0) {
    setTimeout(() => box.focus(), 300);
  }
  
  // Input event - auto move to next box
  box.addEventListener('input', function(e) {
    const value = this.value;
    
    // Only allow numbers
    this.value = value.replace(/[^0-9]/g, '');
    
    // Add filled class
    if (this.value) {
      this.classList.add('filled');
      
      // Move to next box
      if (index < pinBoxes.length - 1) {
        pinBoxes[index + 1].focus();
      } else {
        // Last box - auto submit
        setTimeout(() => verifyPin(), 100);
      }
    } else {
      this.classList.remove('filled');
    }
    
    // Hide error on input
    hideError();
  });
  
  // Keydown event - handle backspace
  box.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace' && !this.value && index > 0) {
      pinBoxes[index - 1].focus();
      pinBoxes[index - 1].value = '';
      pinBoxes[index - 1].classList.remove('filled');
    }
    
    // Enter key - submit
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyPin();
    }
  });
  
  // Paste event - distribute digits
  box.addEventListener('paste', function(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    
    if (pastedData.length === 6) {
      pastedData.split('').forEach((digit, i) => {
        if (pinBoxes[i]) {
          pinBoxes[i].value = digit;
          pinBoxes[i].classList.add('filled');
        }
      });
      pinBoxes[5].focus();
      setTimeout(() => verifyPin(), 100);
    }
  });
});

// ========= GET PIN VALUE =========
function getPinValue() {
  return Array.from(pinBoxes).map(box => box.value).join('');
}

// ========= CLEAR PIN =========
function clearPin() {
  pinBoxes.forEach(box => {
    box.value = '';
    box.classList.remove('filled', 'error');
  });
  pinBoxes[0].focus();
}

// ========= SHOW ERROR =========
function showError(message = '❌ PIN yang Anda masukkan salah!') {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }
  
  // Add error class to all boxes
  pinBoxes.forEach(box => box.classList.add('error'));
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    hideError();
    clearPin();
  }, 3000);
}

// ========= HIDE ERROR =========
function hideError() {
  if (errorMessage) {
    errorMessage.style.display = 'none';
  }
  
  pinBoxes.forEach(box => box.classList.remove('error'));
}

// ========= VERIFY PIN =========
async function verifyPin() {
  const pinValue = getPinValue();
  
  // Validation
  if (pinValue.length !== 6) {
    showError('⚠️ PIN harus 6 digit!');
    return;
  }
  
  if (!/^\d{6}$/.test(pinValue)) {
    showError('⚠️ PIN harus berupa angka!');
    return;
  }
  
  console.log('🔐 Verifying PIN:', pinValue);
  
  // Disable button and add loading state
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  submitBtn.textContent = '';
  
  const pin = Number(pinValue);
  const pinRef = db.ref(`karaoke/room/${roomId}/Setting/pin`);
  
  try {
    const snap = await pinRef.once('value');
    
    if (snap.exists() && snap.val() === pin) {
      // ✅ PIN BENAR
      console.log('✅ PIN correct!');
      
      const token = generateSecureToken(roomId, pin);
      sessionStorage.setItem(`room_token_${roomId}`, token);
      sessionStorage.setItem(`room_pin_verified_${roomId}`, Date.now());
      localStorage.setItem('karaoke_room_id', roomId);
      
      // Success feedback
      submitBtn.textContent = ' Berhasil!';
      submitBtn.classList.remove('loading');
      submitBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      
      // Redirect
      setTimeout(() => {
        window.location.href = `bus-menu.html?room=${roomId}`;
      }, 800);
      
    } else {
      // ❌ PIN SALAH
      console.warn('PIN incorrect');
      
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'Masuk';
      
      showError('❌ PIN yang Anda masukkan salah!');
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = 'Masuk';
    
    if (typeof customError === 'function') {
      await customError('Gagal memeriksa PIN. Silakan coba lagi.', 'Koneksi Error');
    } else {
      showError('⚠️ Koneksi gagal! Coba lagi.');
    }
  }
}

// ========= GENERATE TOKEN =========
function generateSecureToken(roomId, pin) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const data = `${roomId}-${pin}-${timestamp}-${random}`;
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `TOKEN_${Math.abs(hash).toString(36)}_${timestamp}`;
}

// ========= CANCEL BUTTON =========
cancelBtn.addEventListener('click', async function() {
  let confirmed = true;
  
  if (typeof customConfirm === 'function') {
    confirmed = await customConfirm(
      'Anda akan kembali ke halaman pemilihan bus.',
      {
        title: '🔙 Kembali?',
        confirmText: 'Ya, Kembali',
        cancelText: 'Tetap di Sini'
      }
    );
  } else {
    confirmed = confirm('Kembali ke halaman pemilihan bus?');
  }
  
  if (confirmed) {
    window.location.href = 'index.html';
  }
});

// ========= SUBMIT BUTTON =========
submitBtn.addEventListener('click', verifyPin);

// ========= INIT =========
setBusInfo();
console.log('✅ Pin-login.js loaded (Modal Style)');
console.log('🚌 Room ID:', roomId);