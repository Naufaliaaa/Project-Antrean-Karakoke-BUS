# TODO - Batas Antrean Karaoke 25 Orang

## Task: Menambahkan batas antrean max 25 orang dengan validasi

### Steps:

- [x] 1. Modify JS/form.js - Add queue limit validation (MAX_QUEUE = 25)
- [x] 2. Modify form.html - Update queue display to show "X/25" format
- [x] 3. Modify JS/admin.js - Update queue count display to show "X/25"
- [x] 4. Modify admin.html - Update queue display to show "X/25" format

### Details:

#### Step 1: JS/form.js ✅
- [x] Add constant: MAX_QUEUE = 25
- [x] Add checkQueueCount() helper function
- [x] Add isQueueFull() helper function
- [x] Add validation in submitSong() function
- [x] Show error alert "Mohon maaf antrean penuh Silahkan Tunggu beberapa saat lagi" when queue >= 25
- [x] Update queue count display to show "X/25"

#### Step 2: form.html ✅
- [x] Change `<span id="queue-count">0</span>` to `<span id="queue-count">0/25</span>`

#### Step 3: admin.html ✅
- [x] Update queue count display to show "X/25"
- [x] Change "/20" to "/25"

#### Step 4: JS/admin.js ✅
- [x] Add constant: MAX_QUEUE = 25
- [x] Update queue count display to show "X/25"

---

## Status: COMPLETED ✅
## Completed: [Current Date]


