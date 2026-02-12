# 🎤 Hioo Karaoke Bus System

<div align="center">

![Hioo Logo](img/Logo.png)

**Sistem Karaoke Bus Interaktif dengan WebRTC Streaming & Real-time Queue Management**

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

**Ingat Wisata Ingat Hioo - Jalan Jalan NYAMAN, Cuan AMAN**

[Demo](#-demo) • [Features](#-fitur-utama) • [Installation](#-instalasi) • [Documentation](#-dokumentasi) • [Support](#-dukungan)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi-yang-digunakan)
- [Struktur Proyek](#-struktur-proyek)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Penggunaan](#-penggunaan)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [API & Database](#-api--database-structure)
- [Security](#-keamanan)
- [Contributing](#-kontribusi)
- [License](#-lisensi)
- [Tim & Kontak](#-tim--kontak)

---

## 🎯 Tentang Proyek

**Hioo Karaoke Bus System** adalah solusi hiburan modern untuk armada bus pariwisata yang mengintegrasikan sistem karaoke interaktif dengan teknologi WebRTC untuk live camera streaming, real-time queue management menggunakan Firebase, dan antarmuka yang responsif untuk berbagai perangkat.

### 🌟 Keunggulan

- ✅ **Multi-Bus Support** - Kelola hingga 7 unit bus secara simultan
- ✅ **Real-time Synchronization** - Firebase Realtime Database untuk update instan
- ✅ **WebRTC Camera Streaming** - Live video dari kamera bus ke display utama
- ✅ **Interactive Emotes** - Penumpang bisa kirim reaksi real-time ke layar
- ✅ **Queue Management** - Sistem antrian lagu otomatis dengan drag & drop
- ✅ **YouTube Integration** - Embed validation & auto-play support
- ✅ **Audio Control** - Volume control terpisah untuk musik & microphone
- ✅ **Responsive Design** - Optimized untuk desktop, tablet, dan mobile
- ✅ **Security First** - Multi-layer authentication (PIN, Password, Token)

---

## 🚀 Fitur Utama

### 1. 🎵 **Karaoke Display System**
- YouTube video player dengan full control
- Real-time queue display dengan smooth animations
- Live emote reactions dari penumpang
- Picture-in-Picture (PiP) camera support
- Timer countdown untuk setiap lagu
- Automatic next song playback

### 2. 📱 **Request Form (Penumpang)**
- Simple song request interface
- YouTube link validation
- Embed compatibility check
- Device-based request limiting
- Real-time queue status
- Interactive emote sender

### 3. 🎛️ **Admin Panel**
- Complete queue management (add, delete, reorder)
- System monitoring (Display & Camera status)
- Audio control (YouTube & Mic volume)
- Manual song addition
- Live reaction emotes
- Session-based request counter
- QR code generator untuk form access

### 4. 📹 **Video Panel (Camera Control)**
- WebRTC-based live streaming
- Front/rear camera switching
- Video recording dengan download
- Mute/unmute audio control
- Volume adjustment from admin
- Connection status monitoring

### 5. 🎰 **Roulette Arisan (Wheel of Names)**
- **Real-time Wheel Updates** - Wheel updates automatically as you type names
- **Continuous Spin Animation** - Wheel spins smoothly while editing
- **Instant Apply** - Click "Terapkan" to lock entries and stop spinning
- **Smart Spin Button** - Disabled until "Terapkan" is clicked
- **Editable Before Apply** - Can modify names before clicking apply
- **Locked After Apply** - Textarea and apply button disabled after apply
- **Reset to Start Over** - Use "Reset Semua" button to clear and start fresh
- **Last Nomination Support** - Can spin until only 1 name remains
- **Multiple Winners** - Winner list with rankings (Gold, Silver, Bronze)
- **Confetti Celebration** - Animated confetti when winner is selected
- **Visual Wheel Center** - White circle center design
- **Colorful Slices** - Each entry gets a unique color
- **Keyboard Shortcuts** - ESC to go back, Ctrl+Space to spin

### 6. 🔐 **Security System**
- **PIN Authentication** - 6-digit PIN untuk akses bus (disimpan di Firebase)
- **Password Protection** - Terpisah untuk Admin, Display, dan Camera (disimpan di Firebase)
- **Session Management** - Token-based dengan auto-expiry
- **Room Isolation** - Data terpisah per bus unit
- **Secure Password Storage** - Password disimpan di Firebase, bukan di GitHub

---

## 🛠️ Teknologi yang Digunakan

### **Frontend**
```
HTML5, CSS3, JavaScript (Vanilla ES6+)
```

### **Backend Services**
```
Firebase Realtime Database
Firebase Hosting (optional)
```

### **APIs & Libraries**
```
- YouTube IFrame API v3
- WebRTC API
- QR Code Generator API
- MediaRecorder API
- Navigator.mediaDevices API
```

### **Design & UI**
```
- Custom CSS (No frameworks - Pure CSS)
- Glassmorphism Effects
- Modern Gradient Design
- Smooth Animations & Transitions
```

---

## 📁 Struktur Proyek

```
karaoke-bus/
│
├── index.html                    # Bus selection page
├── pin-login.html               # PIN authentication
├── bus-menu.html                # Bus menu navigation
│
├── admin-login.html             # Admin authentication
├── admin.html                   # Admin control panel
│
├── display-login.html           # Display authentication
├── display.html                 # Main karaoke display
│
├── camera-login.html            # Camera panel auth
├── video-panel.html             # Camera control panel
├── camera-stream.html           # Camera streaming page
│
├── form.html                    # Song request form
├── emote.html                   # Standalone emote sender
├── roulette.html                # Roulette Arisan (Wheel of Names)
│
├── css/
│   ├── index.css               # Bus selection styles
│   ├── pin-login.css           # PIN login styles
│   ├── bus-menu.css            # Menu styles
│   ├── admin-login.css         # Admin login styles
│   ├── admin.css               # Admin panel styles
│   ├── display-login.css       # Display login styles
│   ├── display.css             # Display karaoke styles
│   ├── camera-login.css        # Camera login styles
│   ├── video-panel.css         # Video panel styles
│   ├── form.css                # Request form styles
│   ├── emote.css               # Emote page styles
│   └── roulette.css            # Roulette Arisan styles
│
├── js/
│   ├── firebase.js             # Firebase configuration
│   ├── room.js                 # Room management system
│   ├── custom-modal.js         # Custom alert/confirm modals
│   │
│   ├── index.js                # Bus selection logic
│   ├── pin-login.js            # PIN authentication
│   ├── bus-menu.js             # Menu navigation logic
│   │
│   ├── admin-login.js          # Admin auth logic
│   ├── admin-page.js           # Admin page init
│   ├── admin.js                # Admin panel logic
│   │
│   ├── display-login.js        # Display auth logic
│   ├── display-page.js         # Display page init
│   ├── display.js              # Display karaoke logic
│   │
│   ├── camera-login.js         # Camera auth logic
│   ├── video-panel-page.js     # Video panel init
│   ├── video-panel.js          # Video panel logic
│   ├── camera-stream.js        # Camera streaming logic
│   │
│   ├── form.js                 # Request form logic
│   ├── emote.js                # Emote sender logic
│   └── roulette.js             # Roulette Arisan logic
│
├── img/
│   ├── hioo.jpeg               # Main logo
│   ├── Logo.png                # Alternative logo
│   ├── background.png          # Hero background
│   ├── unit.png                # Bus unit icon
│   ├── microphone.png          # Mic icon
│   ├── layar.png               # Display icon
│   ├── video.png               # Video icon
│   ├── admin.png               # Admin icon
│   ├── req.png                 # Request icon
│   ├── log-out.png             # Logout icon
│   ├── mute.png                # Mute icon
│   ├── voice-search.png        # Voice search icon
│   ├── loud-speaker.png        # Speaker icon
│   ├── camera.png              # Camera icon
│   ├── video-record.png        # Record icon
│   ├── reset.png               # Reset icon
│   ├── next.png                # Next icon
│   └── exit.png                # Exit icon
│
├── README.md                    # Project documentation
└── .firebaserc / firebase.json  # Firebase config (optional)
```

---

## 📦 Instalasi

### **Prasyarat**

- **Web Server** (Apache, Nginx, atau Live Server)
- **Firebase Account** (untuk Realtime Database)
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+)
- **HTTPS Connection** (required untuk WebRTC & Camera access)

### **Langkah Instalasi**

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/Naufaliaaa/Project-Antrean-Karakoke-BUS.git
cd hioo-karaoke-bus
```

#### 2️⃣ Setup Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Enable **Realtime Database**
3. Copy Firebase config ke `js/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. Setup Database Rules (lihat [Database Rules](#database-rules))

#### 3️⃣ Setup Bus Units

Edit `js/index.js` untuk konfigurasi bus:

```javascript
const buses = [
  { id: 'BUS-001', name: 'Hiace 1', color: '#667eea' },
  { id: 'BUS-002', name: 'Hiace 2', color: '#f093fb' },
  // Tambahkan bus sesuai kebutuhan
];
```

#### 4️⃣ Setup Passwords & PINs

Password disimpan di Firebase untuk keamanan (tidak tersimpan di GitHub).

Di Firebase Console, buat structure:

```
karaoke/
├── room/
│   └── BUS-001/
│       └── Setting/
│           ├── pin: 101010
│           └── busName: "Hiace 1"
└── system/
    └── passwords/
        ├── admin: "password_admin_anda"
        ├── display: "password_display_anda"
        └── camera: "password_camera_anda"
```

**Urutan Pencarian Password:**
1. **Prioritas Utama:** Firebase (`karaoke/system/passwords/`)
2. **Cadangan:** `config.js` (hanya untuk development lokal)
3. **Default:** `hioo_default_admin`, `hioo_default_display`, `hioo_default_camera`

#### 5️⃣ Deploy ke Server

**Opsi A: Local Development**
```bash
# Menggunakan Python
python -m http.server 8000

# Atau menggunakan Node.js
npx http-server -p 8000

# Atau menggunakan Live Server (VS Code Extension)
```

**Opsi B: Firebase Hosting**
```bash
firebase login
firebase init hosting
firebase deploy
```

**Opsi C: cPanel / Shared Hosting**
- Upload semua file via FTP
- Pastikan HTTPS aktif
- Set permissions folder `img/` ke 755

---

## ⚙️ Konfigurasi

### **Database Rules**

Paste ke Firebase Console → Realtime Database → Rules:

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
          },
          "audioControl": {
            ".read": true,
            ".write": true
          },
          "displayStatus": {
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

### **Environment Variables (Optional)**

Buat file `.env` untuk production:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_DATABASE_URL=your_database_url
ADMIN_PASSWORD=k**************
DISPLAY_PASSWORD=d*************
CAMERA_PASSWORD=p*************
```

---

## 🎮 Penggunaan

### **Alur Kerja Sistem**

```
┌─────────────┐
│  1. Pilih   │
│    Bus      │ → PIN Login (6 digit)
└─────────────┘

┌─────────────┐
│  2. Menu    │
│    Bus      │ → Pilih Fitur:
└─────────────┘   ├─ Display (password)
                  ├─ Form Request
                  ├─ Video Panel (password)
                  └─ Admin Panel (password)

┌─────────────┐
│  3. Admin   │
│    Panel    │ → Control system
└─────────────┘   ├─ Monitor status
                  ├─ Manage queue
                  ├─ Audio control
                  └─ Send emotes

┌─────────────┐
│  4. Display │
│   Karaoke   │ → Main screen
└─────────────┘   ├─ Play YouTube
                  ├─ Show queue
                  ├─ Display emotes
                  └─ PiP camera

┌─────────────┐
│  5. Video   │
│    Panel    │ → Camera control
└─────────────┘   ├─ Start camera
                  ├─ WebRTC stream
                  ├─ Record video
                  └─ Mute/unmute
```

### **Untuk Admin:**

1. Akses `index.html` → Pilih bus
2. Masukkan PIN (default: `1*****`)
3. Klik "Panel Admin"
4. Login dengan password: `k**************`
5. Kelola sistem dari admin panel

### **Untuk Display:**

1. Akses `index.html` → Pilih bus → PIN
2. Klik "Layar Karaoke"
3. Login dengan password: `d**************`
4. Klik "MULAI KARAOKE" untuk aktivasi

### **Untuk Penumpang:**

1. Scan QR Code (ditampilkan di admin panel)
2. Isi nama & link YouTube
3. Klik "Tambah Antrean"
4. Kirim emote untuk interaksi

### **Untuk Camera Operator:**

1. Akses `index.html` → Pilih bus → PIN
2. Klik "Video Panel"
3. Login dengan password: `p**************`
4. Klik "Aktifkan Kamera" untuk streaming

---

## 🏗️ Arsitektur Sistem

### **System Architecture Diagram**

```
┌──────────────────────────────────────────────────────────┐
│                    FIREBASE REALTIME DB                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ karaoke/room/BUS-001/                              │  │
│  │  ├─ queue/          (Song requests)                │  │
│  │  ├─ emotes/         (Live reactions)               │  │
│  │  ├─ Setting/        (PIN, busName)                 │  │
│  │  ├─ videoSession/   (WebRTC signaling)             │  │
│  │  ├─ audioControl/   (Volume settings)              │  │
│  │  └─ displayStatus/  (Online/offline)               │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                            ↕
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Admin Panel  │   │    Display    │   │  Video Panel  │
│               │   │   Karaoke     │   │   (Camera)    │
│  - Monitor    │   │               │   │               │
│  - Control    │   │  - YouTube    │   │  - WebRTC     │
│  - Manage     │   │  - Queue      │   │  - Streaming  │
│               │   │  - Emotes     │   │  - Recording  │
└───────────────┘   └───────────────┘   └───────────────┘
        ↑                   ↑
        │                   │
        └───────────────────┘
                ↓
        ┌───────────────┐
        │  Form Request │
        │  (Penumpang)  │
        │               │
        │  - Add Song   │
        │  - Send Emote │
        └───────────────┘
```

### **Data Flow**

1. **Request Flow:**
   ```
   Form → Firebase → Display (auto-play)
   ```

2. **Emote Flow:**
   ```
   Form/Admin → Firebase → Display (animation)
   ```

3. **WebRTC Flow:**
   ```
   Video Panel → Firebase (signaling) → Display (PiP)
   ```

4. **Audio Control Flow:**
   ```
   Admin → Firebase → Display/Video Panel
   ```

---

## 🗄️ API & Database Structure

### **Firebase Database Schema**

```javascript
{
  "karaoke": {
    "room": {
      "BUS-001": {
        "queue": {
          "-NXhY7K9mZ3pQ2sT5uV": {
            "name": "John Doe",
            "videoId": "dQw4w9WgXcQ",
            "order": 1,
            "deviceId": "DEV_1234567890",
            "createdAt": 1704067200000
          }
        },
        "emotes": {
          "-NXhY8L1nA4qR3tU6vW": {
            "name": "Jane Smith",
            "emote": "👏",
            "emoteName": "Tepuk Tangan",
            "timestamp": 1704067260000,
            "isAdmin": false
          }
        },
        "Setting": {
          "pin": 101010,
          "busName": "Hiace 1"
        },
        "videoSession": {
          "cameraStatus": "connected",
          "offer": { /* WebRTC offer SDP */ },
          "answer": { /* WebRTC answer SDP */ },
          "cameraCandidates": { /* ICE candidates */ },
          "displayCandidates": { /* ICE candidates */ }
        },
        "audioControl": {
          "youtubeVolume": 100,
          "micVolume": 100
        },
        "displayStatus": "active"
      }
    },
    "system": {
      "passwords": {
        "admin": "rahasia123",
        "display": "display123",
        "camera": "camera123"
      }
    }
  }
}
```

### **Key APIs Used**

#### **YouTube IFrame API**

```javascript
// Load video
player = new YT.Player("player", {
  videoId: videoId,
  events: {
    onReady: onPlayerReady,
    onStateChange: onPlayerStateChange,
    onError: onPlayerError
  }
});
```

#### **WebRTC API**

```javascript
// Create peer connection
const peerConnection = new RTCPeerConnection(configuration);

// Add local stream
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});

// Create offer/answer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
```

#### **Firebase Realtime Database**

```javascript
// Listen to queue changes
queueRef.orderByChild("order").on("value", snapshot => {
  renderQueue(snapshot);
});

// Add new song
queueRef.push({
  name: name,
  videoId: videoId,
  order: maxOrder + 1,
  deviceId: deviceId,
  createdAt: Date.now()
});
```

---

## 🔒 Keamanan

### **Security Layers**

1. **Level 1: PIN Authentication**
   - 6-digit numeric PIN per bus
   - Stored in Firebase
   - Session-based verification

2. **Level 2: Password Protection**
   - Separate passwords for Admin, Display, Camera
   - Client-side validation
   - Token-based session

3. **Level 3: Session Management**
   - SessionStorage untuk tokens
   - Auto-expiry (2-8 hours)
   - Logout functionality

4. **Level 4: Firebase Rules**
   - Read/write validation
   - Data structure enforcement
   - No anonymous access to sensitive data

### **Best Practices**

```javascript
// ✅ DO: Use token-based auth
sessionStorage.setItem('admin_token', generateToken());

// ✅ DO: Validate user input
if (!videoId || videoId.length !== 11) {
  showError('Invalid YouTube link');
}

// ✅ DO: Check authentication
if (!isAuthenticated()) {
  redirectToLogin();
}

// ❌ DON'T: Store passwords in localStorage
// ❌ DON'T: Trust client-side validation only
// ❌ DON'T: Expose Firebase config in public repos
```

### **Rekomendasi Production**

- 🔐 Gunakan Firebase Authentication untuk user management
- 🔐 Implementasi rate limiting untuk requests
- 🔐 Enable Firebase App Check
- 🔐 Setup CORS untuk domain spesifik
- 🔐 Encrypt sensitive data di database
- 🔐 Regular security audits

---

## 🧪 Testing

### **Manual Testing Checklist**

#### **Bus Selection & Authentication**
- [ ] Bus cards tampil dengan benar
- [ ] Custom room ID berfungsi
- [ ] PIN validation (6 digit)
- [ ] Token generation & storage
- [ ] Session persistence

#### **Admin Panel**
- [ ] Password authentication
- [ ] System status monitoring (Display, Camera)
- [ ] Queue management (add, delete, reorder)
- [ ] Audio controls (YouTube, Mic volume)
- [ ] QR code generation
- [ ] Emote sending
- [ ] Logout functionality

#### **Display Karaoke**
- [ ] YouTube player embed
- [ ] Auto-play next song
- [ ] Queue display & updates
- [ ] Emote animations
- [ ] PiP camera stream
- [ ] Timer countdown
- [ ] Error handling (invalid videos)

#### **Video Panel**
- [ ] Camera permission request
- [ ] Camera activation
- [ ] WebRTC streaming to display
- [ ] Front/rear camera switch
- [ ] Video recording & download
- [ ] Mute/unmute functionality
- [ ] Volume adjustment from admin

#### **Request Form**
- [ ] Name & YouTube link input
- [ ] YouTube embed validation
- [ ] Device-based limiting
- [ ] Queue status display
- [ ] Emote sending
- [ ] Real-time updates

### **Browser Compatibility**
-------------------------------------
| Browser | Version |      Status     |
|---------|---------|-----------------|
| Chrome  | 90+     | ✅ Full Support |
| Firefox | 88+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 90+     | ✅ Full Support |
| Opera   | 76+     | ✅ Full Support |

### **Device Testing**

- ✅ Desktop (1920x1080, 1366x768)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iOS, Android)
- ✅ TV Display (1080p, 4K)

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Camera tidak bisa diakses**

**Masalah:**
```
NotAllowedError: Permission denied
```

**Solusi:**
- Pastikan akses HTTPS (bukan HTTP)
- Allow camera permission di browser
- Check browser settings → Privacy → Camera
- Pastikan tidak ada app lain yang pakai camera

#### **2. YouTube video tidak bisa diputar**

**Masalah:**
```
Video unavailable / Embedding disabled
```

**Solusi:**
- System sudah ada embed validation
- Gunakan video yang allow embedding
- Cek dengan oEmbed API sebelum add

#### **3. Firebase connection error**

**Masalah:**
```
Firebase: Error (auth/network-request-failed)
```

**Solusi:**
- Check internet connection
- Verify Firebase config di `firebase.js`
- Check Firebase Console → Database rules
- Clear browser cache & cookies

#### **4. WebRTC tidak connect**

**Masalah:**
```
ICE connection failed
```

**Solusi:**
- Check STUN server configuration
- Verify network allows WebRTC (tidak di-block)
- Test dengan different network
- Check browser console untuk errors

#### **5. Emote tidak muncul**

**Masalah:**
- Emote sent tapi tidak tampil di display

**Solusi:**
- Check Firebase path: `karaoke/room/{roomId}/emotes`
- Verify display.js listener aktif
- Check z-index CSS di `.emote-container`
- Clear old emotes dari Firebase

---

## 🤝 Kontribusi

Kami sangat welcome kontribusi dari komunitas! Berikut cara berkontribusi:

### **How to Contribute**

1. **Fork** repository ini
2. **Create** branch baru (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** ke branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

### **Contribution Guidelines**

- ✅ Follow existing code style
- ✅ Add comments untuk complex logic
- ✅ Test thoroughly sebelum PR
- ✅ Update documentation jika perlu
- ✅ Gunakan meaningful commit messages

### **Areas yang Perlu Improvement**

- 🔨 Multi-language support (EN, ID)
- 🔨 Dark mode toggle
- 🔨 Playlist management
- 🔨 Song history & favorites
- 🔨 User profiles & leaderboards
- 🔨 Advanced analytics dashboard
- 🔨 Mobile app (React Native / Flutter)
- 🔨 Lyrics display sync

---

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

```
MIT License

Copyright (c) 2024 Hioo Karaoke Bus System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Tim & Kontak

### **Developer Team**

- **Project Lead** - [Naufal Zul Faza](https://www.instagram.com/_naufaliaaa/)
- **Frontend Developer** - [Zul](https://www.facebook.com/profile.php?id=100011473811622&locale=id_ID)
- **System Architect** - [Hemalia Putri](https://www.instagram.com/hmptr_09/)

### **Hioo Official**

- 🌐 **Website:** [https://hioo.co.id](https://hioo.co.id)
- 📧 **Linkedin:** [hioo](https://www.linkedin.com/company/hioojalanjalanyo/people/?viewAsMember=true)
- 📱 **WhatsApp:** +62 8221-1902-246
- 📍 **Address:** [Jl. Tirta Raya VIDA Bekasi, Bekasi, Jawa Barat 17151, ID](https://maps.app.goo.gl/i4qvWVSzy2p1eGQa9)

### **Support & Documentation**

- 📚 **Documentation:** [Wiki](https://github.com/yourusername/hioo-karaoke-bus/wiki)
- 🐛 **Bug Reports:** [Issues](https://github.com/yourusername/hioo-karaoke-bus/issues)
- 💬 **Discussions:** [Discussions](https://github.com/yourusername/hioo-karaoke-bus/discussions)
- 📹 **Video Tutorials:** [YouTube Channel](https://youtube.com/yourchannel)

---

## 🙏 Acknowledgments

- **Firebase Team** - Untuk real-time database yang powerful
- **YouTube IFrame API** - Untuk video player integration
- **WebRTC Community** - Untuk live streaming technology
- **Open Source Community** - Untuk inspirasi dan support

---