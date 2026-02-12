/*************************************************
 * PASSWORD-LOADER.JS - Password Loading Utility
 * 
 * Fungsi: Load password dari config.js atau Firebase
 * 
 * Cara kerja:
 * 1. Coba load dari config.js (untuk local development)
 * 2. Jika config.js tidak tersedia, fetch dari Firebase
 * 
 * NOTE: Pastikan firebase.js sudah di-load sebelum file ini!
 *************************************************/

// Cache untuk password dari Firebase
let firebasePasswordsCache = null;
let firebasePasswordsLoaded = false;

// ========= LOAD SEMUA PASSWORD =========
async function loadAllPasswords() {
  const passwords = {
    admin: null,
    display: null,
    camera: null
  };

  // 1. Coba load dari config.js (window variables)
  if (typeof window.ADMIN_PASSWORD !== 'undefined') {
    passwords.admin = window.ADMIN_PASSWORD;
    console.log('✅ Admin password loaded from config.js');
  }
  if (typeof window.DISPLAY_PASSWORD !== 'undefined') {
    passwords.display = window.DISPLAY_PASSWORD;
    console.log('✅ Display password loaded from config.js');
  }
  if (typeof window.CAMERA_PASSWORD !== 'undefined') {
    passwords.camera = window.CAMERA_PASSWORD;
    console.log('✅ Camera password loaded from config.js');
  }

  // 2. Jika ada yang missing, coba fetch dari Firebase
  if (!passwords.admin || !passwords.display || !passwords.camera) {
    console.log('📡 Some passwords missing, fetching from Firebase...');
    const fbPasswords = await fetchPasswordsFromFirebase();
    
    if (fbPasswords) {
      if (!passwords.admin && fbPasswords.admin) {
        passwords.admin = fbPasswords.admin;
        console.log('✅ Admin password loaded from Firebase');
      }
      if (!passwords.display && fbPasswords.display) {
        passwords.display = fbPasswords.display;
        console.log('✅ Display password loaded from Firebase');
      }
      if (!passwords.camera && fbPasswords.camera) {
        passwords.camera = fbPasswords.camera;
        console.log('✅ Camera password loaded from Firebase');
      }
    }
  }

  return passwords;
}

// ========= FETCH DARI FIREBASE =========
async function fetchPasswordsFromFirebase() {
  try {
    // Cek apakah Firebase sudah ready
    if (!window.db) {
      console.warn('⚠️ Firebase database not ready yet');
      return null;
    }

    // Fetch dari path: karaoke/system/passwords
    const snapshot = await window.db.ref('karaoke/system/passwords').once('value');
    const data = snapshot.val();

    if (data) {
      return {
        admin: data.admin || null,
        display: data.display || null,
        camera: data.camera || null
      };
    } else {
      console.warn('⚠️ Passwords not found in Firebase');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching passwords from Firebase:', error);
    return null;
  }
}

// ========= GET SINGLE PASSWORD =========
async function getAdminPassword() {
  const passwords = await loadAllPasswords();
  return passwords.admin;
}

async function getDisplayPassword() {
  const passwords = await loadAllPasswords();
  return passwords.display;
}

async function getCameraPassword() {
  const passwords = await loadAllPasswords();
  return passwords.camera;
}

// ========= EXPORT KE GLOBAL =========
window.loadAllPasswords = loadAllPasswords;
window.getAdminPassword = getAdminPassword;
window.getDisplayPassword = getDisplayPassword;
window.getCameraPassword = getCameraPassword;

console.log('✅ PASSWORD-LOADER.JS LOADED');

