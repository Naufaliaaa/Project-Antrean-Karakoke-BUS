# TODO - Roulette Updates

## Task: Update Roulette UI
- [x] Update roulette.html - navbar with back button left, logo center; remove hero header
- [x] Update CSS/roulette.css - navbar styles and center circle styles
- [x] Update JS/roulette.js - change center emoji to empty (handled in HTML)

## Changes Summary:
1. **Emote di tengah roda**: Changed to white circle (white background with gray border)
2. **Header simplification**:
   - Navbar: Logo centered
   - Back button: Positioned at top left corner (outside navbar)
   - Removed: Hero header with title and subtitle
3. **Reset button**: Changed from "Hapus Semua" to "Reset Semua" with reset.png icon
4. **Real-time wheel update**:
   - Wheel updates in real-time as user types in textarea
   - When Enter is pressed, new entries are added to wheel immediately with colors
5. **Spin button logic**:
   - Button is disabled until "Terapkan" is clicked
   - After apply, textarea is locked (cannot edit names)
   - Can spin until only 1 name remains (last nomination can still spin)
   - Use "Reset Semua" to clear and start over

