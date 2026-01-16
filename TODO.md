# TODO - SYSTEM CONTROL & AUDIO CONTROL Implementation

## Task 1: Update display.js ✅
- [x] 1.1 Set displayStatus ke Firebase saat sistem aktif
- [x] 1.2 Dapatkan dan terapkan YouTube volume dari Firebase
- [x] 1.3 Setup listener untuk perubahan volume dari admin
- [x] 1.4 Cleanup - Set display status ke inactive saat unload

## Task 2: Update video-panel.js ✅
- [x] 2.1 Dapatkan dan terapkan mic volume dari Firebase
- [x] 2.2 Setup listener untuk perubahan volume dari admin
- [x] 2.3 Update mute button untuk menampilkan volume status

## Task 3: Update admin-redesign.js ✅
- [x] 3.1 setupSystemStatusMonitoring sudah berfungsi dengan benar
- [x] 3.2 Audio controls sudah berfungsi ✅

## Task 4: Implementation Complete ✅
- [x] System Control - Display Status (menonton display.js aktif/tidak)
- [x] System Control - Camera Status (menonton video-panel.js terhubung/tidak)
- [x] Audio Control - YouTube Volume (admin bisa atur, display.js aplikasikan)
- [x] Audio Control - Mic Volume (admin bisa atur, video-panel.js aplikasikan)

## Cara Kerja:
1. **Display Status**: display.js set `displayStatus` = 'active' saat dimulai, 'inactive' saat ditutup. Admin panel mendengarkan perubahan ini.
2. **Camera Status**: video-panel.js set `cameraStatus` = 'connected' saat aktif. Admin panel mendengarkan perubahan ini.
3. **YouTube Volume**: Admin set volume ke Firebase, display.js dengarkan dan aplikasikan ke player secara real-time.
4. **Mic Volume**: Admin set volume ke Firebase, video-panel.js dengarkan dan aplikasikan ke audio tracks.

