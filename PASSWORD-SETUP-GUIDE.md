# 🔐 Panduan Setup Password untuk GitHub Pages

## Masalah
- `config.js` ada di `.gitignore` sehingga **tidak ter-push ke GitHub**
- Saat hosting di GitHub Pages, password tidak tersedia
- Login tidak bisa dilakukan

## Solusi: Dual Password System
Password sekarang disimpan di **Firebase Database** sehingga bisa diakses dari GitHub Pages.

---

## 📋 LANGKAH-LANGKAH SETUP

### Langkah 1: Setup Password di Firebase

#### Opsi A: Via Halaman Web (Mudah & Aman)

1. **Buka halaman setup di browser lokal:**
   ```
   file:///Users/naufal/Downloads/Antrean%20Karaoke%20Bus/admin-password-setup.html
   ```
   
2. **Masukkan password Anda:**
   - 🔐 Admin Panel Password
   - 📺 Display Password  
   - 📹 Camera Password

3. **Klik "Simpan ke Firebase"**

4. ✅ Password sekarang tersimpan di Firebase Database!

#### Opsi B: Via Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **karaoke-bus**
3. Klik **Realtime Database**
4. Klik **Start** jika diminta
5. Buat structure data:

```
{
  "karaoke": {
    "system": {
      "passwords": {
        "admin": "YOUR_ADMIN_PASSWORD",
        "display": "YOUR_DISPLAY_PASSWORD",
        "camera": "YOUR_CAMERA_PASSWORD"
      }
    }
  }
}
```

6. Klik **Publish**

---

### Langkah 2: Hapus File Setup (Keamanan)

Setelah password tersimpan di Firebase:

```bash
# Hapus file setup dari repository
rm admin-password-setup.html
rm setup-passwords.js
rm JS/password-loader.js
```

### Langkah 3: Push ke GitHub

```bash
git add .
git commit -m "Add Firebase password system for GitHub Pages"
git push origin main
```

---

## 🔄 Cara Kerja Sistem

```
┌─────────────────────┐     ┌─────────────────────┐
│  Local Development   │     │   GitHub Pages      │
├─────────────────────┤     ├─────────────────────┤
│ config.js tersedia  │     │ config.js TIDAK ada │
│ ↓                  │     │ ↓                   │
│ Load dari file     │     │ Fetch dari Firebase │
└─────────────────────┘     └─────────────────────┘
```

### Alur Login:

1. **Coba load dari `config.js`** (untuk development lokal)
2. **Jika gagal**, fetch dari Firebase Database
3. **Verifikasi password**
4. **Login berhasil!** ✅

---

## 📁 File yang Dihide (.gitignore)

```
JS/config.js              # Password untuk local
admin-password-setup.html # Halaman setup
setup-passwordups.js     # Script setup
JS/password-loader.js     # Utility (jika tidak diperlukan)
```

---

## ⚠️ PENTING - Keamanan

1. **JANGAN commit password ke GitHub!**
2. **Gunakan password yang berbeda** untuk setiap environment
3. **Rotate password** secara berkala
4. **Firebase Rules** - Pastikan hanya Anda yang bisa edit passwords

### Firebase Rules (Opsional):

```json
{
  "rules": {
    "karaoke": {
      "system": {
        "passwords": {
          ".read": true,
          ".write": false  // Hanya bisa tulis dari Firebase Console
        }
      }
    }
  }
}
```

---

## 🔧 Troubleshooting

### Login tidak berhasil di GitHub Pages?

1. **Cek Firebase Console** - Apakah password sudah tersimpan?
2. **Cek Browser Console** (F12) - Ada error?
3. **Cek Firebase Config** - Apakah sesuai dengan `JS/firebase.js`?

### Error "Firebase not initialized"?

Pastikan Firebase SDK sudah di-load sebelum `password-loader.js`.

---

## ✅ Verifikasi

Setelah setup, cek di browser console:

```javascript
// Should show password dari Firebase
window.db.ref('karaoke/system/passwords').once('value')
  .then(snapshot => console.log(snapshot.val()))
```

Atau cek langsung di Firebase Console:
```
Database → karaoke → system → passwords
```

---

## 📞 Support

Jika ada masalah:
1. Cek browser console untuk error message
2. Pastikan Firebase project aktif
3. Cek koneksi internet

