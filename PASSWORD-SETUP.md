# 🔐 PANDUAN SETUP PASSWORD DI FIREBASE

---

## 📋 LANGKAH 1: BUKA FIREBASE CONSOLE

1. Buka browser dan login ke: **https://console.firebase.google.com/**
2. Pilih project: **`karaoke-bus`**
3. Di menu kiri, klik: **Realtime Database**
4. Klik tab: **Rules**

---

## 📋 LANGKAH 2: COPY PASTE RULES

Hapus semua rules yang ada, lalu **copy paste** kode di bawah ini:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "karaoke": {
      "room": {
        "$roomId": {
          ".read": true,
          ".write": true,
          "queue": {
            ".read": true,
            ".write": true,
            "$songId": {
              ".validate": "newData.hasChildren(['name','videoId','order','deviceId','createdAt']) && newData.child('name').isString() && newData.child('videoId').isString() && newData.child('order').isNumber()"
            }
          },
          "emotes": {
            ".read": true,
            ".write": true,
            "$emoteId": {
              ".validate": "newData.hasChildren(['name','emote','timestamp']) && newData.child('name').isString() && newData.child('emote').isString() && newData.child('timestamp').isNumber()"
            }
          },
          "Setting": {
            ".read": true,
            ".write": true
          },
          "videoSession": {
            ".read": true,
            ".write": true
          }
        }
      },
      "system": {
        "passwords": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
```

5. Klik tombol **Publish** (warna ungu di pojok kanan atas)

---

## 📋 LANGKAH 3: TAMBAH PASSWORD

1. Di Realtime Database, klik **tanda "+"** di samping nama project
2. Isi seperti ini:

```
Name: karaoke
Value: (kosongkan)
```

3. Klik **Add**
4. Klik **tanda "+"** lagi di samping `karaoke`
5. Isi:

```
Name: system
Value: (kosongkan)
```

6. Klik **Add**
7. Klik **tanda "+"** lagi di samping `system`
8. Isi:

```
Name: passwords
Value: (kosongkan)
```

9. Klik **Add**
10. Klik **tanda "+"** lagi di samping `passwords`
11. Isi untuk **Admin Password**:

```
Name: admin
Value: [PASSWORD_ADMIN_ANDA]
```

12. Klik **Add**
13. Klik **tanda "+"** lagi di samping `passwords`
14. Isi untuk **Display Password**:

```
Name: display
Value: [PASSWORD_DISPLAY_ANDA]
```

15. Klik **Add**
16. Klik **tanda "+"** lagi di samping `passwords`
17. Isi untuk **Camera Password**:

```
Name: camera
Value: [PASSWORD_CAMERA_ANDA]
```

---

## 📋 LANGKAH 4: CEK STRUKTUR

Setelah selesai, struktur di Firebase harus seperti ini:

```
📦 karaoke-bus (Firebase)
   └── 📂 karaoke
       ├── 📂 room
       │    └── 📂 BUS-001
       │         ├── 📂 queue
       │         ├── 📂 emotes
       │         ├── 📂 Setting
       │         └── 📂 videoSession
       └── 📂 system
            └── 📂 passwords
                 ├── admin: "password_anda"
                 ├── display: "password_display"
                 └── camera: "camera_password"
```

---

## 📋 LANGKAH 5: TEST LOGIN

1. Buka website GitHub Pages Anda
2. Coba login ke **Admin Panel**
3. Masukkan password yang baru saja Anda buat di Firebase
4. Jika berhasil masuk, berarti **BERHASIL!**

---

## ❓ JIKA GAGAL LOGIN

Cek hal-hal berikut:

| Masalah | Solusi |
|---------|--------|
| Login tidak bekerja | Refresh halaman (Ctrl+F5) |
| Password salah | Cek lagi value di Firebase |
| Tidak bisa akses database | Pastikan Rules sudah di-Publish |
| Errors di console | Buka Developer Tools (F12) → Console |

---

## 🔒 KEAMANAN

| | Sebelum | Sesudah |
|--|---------|---------|
| GitHub | ❌ Password hilang | ❌ Password tidak ada |
| GitHub Pages | ❌ Gagal login | ✅ Login works |
| Ganti Password | ⚠️ Push kode | ✅ Firebase saja |
| Firebase Console | - | ✅ Password ada di sini |

---

## ✅ SELESAI!

Sekarang password tersimpan di Firebase dan bisa diakses dari GitHub Pages tanpa perlu menyimpan di GitHub!

---

## 📞 BUTUH BANTUAN?

Jika ada masalah:
1. Cek Console browser (F12)
2. Refresh halaman
3. Pastikan Rules sudah di-Publish
