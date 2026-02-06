# TODO - Batas Antrean Karaoke 25 Orang + Keamanan Password

## Task: Menambahkan batas antrean max 25 orang dengan validasi + Amankan Password

### Steps - Batas Antrean (COMPLETED) ✅

- [x] 1. Modify JS/form.js - Add queue limit validation (MAX_QUEUE = 25)
- [x] 2. Modify form.html - Update queue display to show "X/25" format
- [x] 3. Modify JS/admin.js - Update queue count display to show "X/25"
- [x] 4. Modify admin.html - Update queue display to show "X/25"

### Steps - Keamanan Password (COMPLETED) ✅

- [x] 1. Create JS/config.js - File konfigurasi terpusat untuk password
- [x] 2. Update JS/admin-login.js - Load password dari config.js
- [x] 3. Update JS/display-login.js - Load password dari config.js
- [x] 4. Update JS/camera-login.js - Load password dari config.js
- [x] 5. Update admin-login.html - Load config.js sebelum login script
- [x] 6. Update display-login.html - Load config.js sebelum login script
- [x] 7. Update camera-login.html - Load config.js sebelum login script
- [x] 8. Update .gitignore - Tambahkan js/config.js agar tidak di-commit

---

## Status: COMPLETED ✅

## Perubahan Utama:

### Batas Antrean:
- Maksimum antrean: 25 orang
- Format display: "X/25"
- Pesan error: "Mohon maaf antrean penuh Silahkan Tunggu beberapa saat lagi"

### Keamanan Password:
- Password dipindahkan ke JS/config.js
- JS/config.js sudah di-gitignore
- ⚠️ Untuk keamanan maksimal, buat JS/config.local.js dengan password berbeda


