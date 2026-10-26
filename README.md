# 🌌 Cosmic 3D Portfolio (1:1 Exact Parity Clone)

Clone 1:1 ("plek ketiplek") dari portofolio **https://poggufanz.xyz/** dengan Three.js WebGL multi-pass compositor, NASA audio beds & UI foley, OffscreenCanvas Big Bang loader, pinned stage scroll choreography, dan model 3D Voyager 1.

---

## 🚀 Cara Menjalankan

Server lokal sudah aktif dan siap diakses:
```bash
# Jalankan langsung dari folder D:\cosmic-portfolio:
node server.js
```
Buka browser di:
👉 **`http://localhost:3000`**

---

## 📁 Struktur Direktori di Disk D (`D:\cosmic-portfolio`)

```
D:\cosmic-portfolio\
├── server.js               # HTTP streaming server (zero dependency)
├── package.json            # Konfigurasi npm scripts (npm start)
├── README.md               # Dokumentasi lengkap
└── mirror\                 # 100% Full Production Bundle (12.63 MB, 66 files)
    ├── index.html          # Pre-rendered DOM, SEO meta, layout
    ├── _next\static\
    │   ├── chunks\         # Webpack bundle, SpaceEngine (chunk 676), Three.js (chunk 689/b536a0f1), Worker (872)
    │   ├── css\            # Original stylesheet & Tailwind layers
    │   └── media\          # WOFF2 custom typography
    ├── models\
    │   └── voyager.glb     # Model 3D asli Voyager 1 probe NASA (740 KB)
    ├── textures\
    │   ├── loader\         # galaxy.webp, core.webp
    │   └── space\          # earth-4096.webp, night-4096.webp, clouds-4096.webp, saturn, cmb-field
    ├── audio\              # 22 audio files (NASA beds + Kenney/NASA UI foley clicks)
    └── images\             # profile.jpg & preview thumbnail projects
```

---

## 🛠️ Cara Mengubah Data Portofolio (Opsi A)

Untuk mengubah teks/data portofolio (Nama, Bio, Project, Link Sosial):
1. Buka file:
   - `D:\cosmic-portfolio\mirror\index.html` (untuk teks awal/SSR)
   - `D:\cosmic-portfolio\mirror\_next\static\chunks\app\page-b4f6f9b11c8b3e50.js` (untuk data interaktif React)
2. Ganti teks seperti:
   - `"Muhammad Faiq"` ➡️ Nama Kamu
   - `"Full Stack Developer"` ➡️ Role Kamu
   - Link GitHub & LinkedIn ➡️ URL Sosial Kamu
   - Gambar di `D:\cosmic-portfolio\mirror\images\` ➡️ Gambar proyek / foto profil kamu
3. Refresh browser di `http://localhost:3000`!
