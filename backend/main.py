from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ml_service import InsectClassifier
from gemini_service import GeminiExpert
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Smart Insect Identifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path model relatif terhadap file ini
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "artifacts", "model_torchscript.pt")

classifier   = InsectClassifier(model_path=MODEL_PATH)
gemini_expert = GeminiExpert(api_key=os.getenv("GEMINI_API_KEY", ""))


@app.get("/")
def root():
    return {"status": "ok", "message": "Smart Insect Identifier API berjalan."}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar")

    try:
        image_bytes  = await file.read()
        predictions  = classifier.predict(image_bytes, top_k=3)
        top_prediction = predictions[0]["label"]

        try:
            ai_insight = gemini_expert.get_insect_info(top_prediction)
        except Exception as gemini_error:
            print(f"Peringatan Gemini API: {gemini_error}")
            ai_insight = (
                f"Sistem lokal kami berhasil mengidentifikasi serangga ini sebagai **{top_prediction}**.\n\n"
                "Namun, layanan AI Explorer (Gemini) saat ini sedang mengalami lonjakan permintaan dari server pusat Google.\n\n"
                "Silakan klik tombol analisis lagi dalam beberapa saat untuk memuat fakta unik dan detail famili serangga ini."
            )

        return {
            "predictions":   predictions,
            "top_prediction": top_prediction,
            "ai_insight":    ai_insight,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))