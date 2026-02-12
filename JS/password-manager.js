/*************************************************
 * PASSWORD-MANAGER.JS
 * 
 * Solusi Sederhana: Password disimpan di Firebase
 * 
 * CARA KERJA:
 * 1. config.js di-gitignore (tidak push ke GitHub)
 * 2. Password disimpan di Firebase Database
 * 3. JS load dari Firebase saat login
 * 
 * KEUNTUNGAN:
 * - GitHub tidak punya password
 * - Password tetap bisa diakses saat hosting di GitHub Pages
 * - Mudah diubah via Firebase Console
 *************************************************/

// Password dari config.js (fallback untuk local development)
const LOCAL_PASSWORDS = {
  admin: window.ADMIN_PASSWORD || "hioo_default_admin",
  display: window.DISPLAY_PASSWORD || "hioo_default_display", 
  camera: window.CAMERA_PASSWORD || "hioo_default_camera"
};

// Cache untuk password dari Firebase
let firebasePasswordsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// ========= GET PASSWORD =========
async function getPassword(type) {
  // 1. Coba load dari Firebase
  const fbPasswords = await loadPasswordsFromFirebase();
  
  if (fbPasswords && fbPasswords[type]) {
    console.log(`✅ Password ${type} loaded dari Firebase`);
    return fbPasswords[type];
  }
  
  // 2. Fallback ke config.js
  if (LOCAL_PASSWORDS[type]) {
    console.log(`⚠️ Password ${type} loaded dari config.js (local only)`);
    return LOCAL_PASSWORDS[type];
  }
  
  // 3. Default
  console.warn(`⚠️ Password ${type} tidak ditemukan, menggunakan default`);
  return "hioo_default";
}

// ========= LOAD DARI FIREBASE =========
async function loadPasswordsFromFirebase() {
  // Cek cache
  if (firebasePasswordsCache && cacheTimestamp) {
    const age = Date.now() - cacheTimestamp;
    if (age < CACHE_DURATION) {
      return firebasePasswordsCache;
    }
  }
  
  // Load dari Firebase
  try {
    if (!window.db) {
      console.warn('⚠️ Firebase belum ready');
      return null;
    }
    
    const snapshot = await window.db.ref('karaoke/system/passwords').once('value');
    const data = snapshot.val();
    
    if (data) {
      firebasePasswordsCache = {
        admin: data.admin || null,
        display: data.display || null,
        camera: data.camera || null
      };
      cacheTimestamp = Date.now();
      return firebasePasswordsCache;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error load password dari Firebase:', error);
    return null;
  }
}

// ========= SET PASSWORD (UNTUK ADMIN) =========
async function setPassword(type, newPassword) {
  try {
    if (!window.db) {
      throw new Error('Firebase belum ready');
    }
    
    await window.db.ref(`karaoke/system/passwords/${type}`).set(newPassword);
    
    // Update cache
    if (firebasePasswordsCache) {
      firebasePasswordsCache[type] = newPassword;
    }
    
    console.log(`✅ Password ${type} berhasil diupdate`);
    return true;
  } catch (error) {
    console.error('❌ Error set password:', error);
    return false;
  }
}

// ========= EXPORT =========
window.getPassword = getPassword;
window.setPassword = setPassword;
window.loadPasswordsFromFirebase = loadPasswordsFromFirebase;

console.log('✅ PASSWORD-MANAGER.JS LOADED');

