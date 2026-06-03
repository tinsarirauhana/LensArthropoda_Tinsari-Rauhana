# LensArthropoda

Sistem identifikasi serangga berbasis web yang menggabungkan computer vision untuk klasifikasi spesies dan generative AI untuk analisis mendalam secara real-time. Model EfficientNetB3 yang dilatih pada 118 kelas serangga menangani prediksi visual, sementara Google Gemini 2.5 Flash Lite dengan Google Search Grounding menghasilkan informasi taksonomi, habitat, dan fakta ilmiah yang akurat dan terverifikasi sumbernya.

## Kemampuan Sistem

- Klasifikasi 118 spesies serangga dengan test accuracy 73.70%
- Confidence score dengan tiga kategori (tinggi, sedang, rendah) untuk transparansi prediksi
- Distribusi probabilitas top-3 prediksi dalam bentuk bar chart animasi
- AI Insights dari Gemini 2.5 Flash Lite dengan Google Search Grounding aktif
- Fallback mechanism — hasil prediksi model tetap ditampilkan jika Gemini tidak tersedia (503)
- Drag-and-drop upload, skeleton loading, image zoom, session history, copy insights, dark/light mode

## Tech Stack

**Backend**
- FastAPI (Python) — REST API dengan async support
- PyTorch TorchScript — inferensi model EfficientNetB3
- Google GenAI SDK (`google-genai`) — integrasi Gemini API
- Pillow — preprocessing gambar

**Frontend**
- Next.js 16.2.5 dengan React 19 dan App Router
- Tailwind CSS v4 — glassmorphism dark/light theme
- React Markdown — rendering AI Insights

**Model**
- Arsitektur: EfficientNetB3 (Transfer Learning dari ImageNet)
- Dataset: Insects Dataset — Kaggle (Baxtiyor Botiraliyev), 118 kelas, ~5 GB
- Training: Kaggle Notebook, GPU T4, 30 epoch, two-phase fine-tuning

## Struktur Proyek

```
FINAL-ML-LAB-2026/
├── backend/
│   ├── artifacts/
│   │   ├── distribusi_kelas.png
│   │   ├── insect_efficientnetb3.pth
│   │   ├── model_metadata.json
│   │   ├── model_torchscript.pt
│   │   ├── sampel_gambar.png
│   │   └── training_curve.png
│   ├── env/                 # Virtual environment Python (tidak di-push ke Git)
│   ├── .env                 # API Key Gemini (tidak di-push ke Git)
│   ├── .gitignore
│   ├── env.example          # Template variabel environment
│   ├── gemini_service.py    # Integrasi Google Gemini API dan Search Grounding
│   ├── main.py              # Entry point FastAPI, routing, dan CORS
│   ├── ml_service.py        # Preprocessing gambar dan inferensi TorchScript
│   └── requirement.txt      # Dependensi Python
├── files/
│   └── .gitkeep
├── frontend/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx          # Halaman utama — upload, prediksi, AI Insights
│   ├── components/
│   │   └── ResultCard.tsx    # Komponen kartu hasil prediksi
│   ├── public/
│   ├── node_modules/         # Dependensi Node.js (tidak di-push ke Git)
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── 2308107010038_Tinsari Rauhana_UASML.ipynb   # Notebook training model
└── README.md
```

## Persiapan dan Instalasi

### Prasyarat

- Python 3.10+
- Node.js 18+
- Google AI Studio API Key — [dapatkan di sini](https://aistudio.google.com/)
- File model dari hasil training Kaggle: `insect_model_scripted.pt` dan `metadata.json`

### Setup Backend

```bash
cd backend
```

Buat dan aktifkan virtual environment:

```bash
python -m venv env

# Linux/macOS
source env/bin/activate

# Windows
env\Scripts\activate
```

Install dependensi:

```bash
pip install -r requirement.txt
```

Salin template environment dan isi API Key:

```bash
cp env.example .env
```

Buka `.env` dan isi:

```
GEMINI_API_KEY=your_api_key_here
```

Taruh file model di folder `artifacts/`:

```
backend/artifacts/insect_model_scripted.pt
backend/artifacts/metadata.json
```

### Setup Frontend

```bash
cd frontend
npm install
```

## Menjalankan Aplikasi

Jalankan backend terlebih dahulu:

```bash
# Di dalam folder backend, pastikan virtual environment aktif
uvicorn main:app --reload
```

API berjalan di `http://127.0.0.1:8000`. Endpoint utama: `POST /analyze`

Kemudian jalankan frontend di terminal terpisah:

```bash
# Di dalam folder frontend
npm run dev
```

Buka `http://localhost:3000` di browser.

## Catatan Penting

- File `.env` dan folder `env/` (virtual environment) tidak boleh di-push ke GitHub. Keduanya sudah terdaftar di `.gitignore`.
- Model di-load ke CPU secara default di backend lokal. Tidak memerlukan GPU untuk inferensi.
- Jika Gemini mengembalikan error 503 (server sedang sibuk atau rate limit tercapai), sistem tetap menampilkan hasil prediksi model tanpa AI Insights.
- Free tier Gemini AI Studio memiliki rate limit. Gunakan akun dengan email universitas untuk mendapatkan kuota yang memadai.

## Hasil Evaluasi Model

| Metrik | Nilai |
|---|---|
| Test Accuracy | 73.70% |
| Best Validation Accuracy | 72.84% |
| Gap Train-Val | 4.4% |
| Jumlah Kelas | 118 spesies serangga |
| Total Epoch | 30 |
| Hardware Training | Kaggle GPU T4 |

---

Dibuat sebagai project akhir praktikum Machine Learning — Universitas Syiah Kuala, 2026.