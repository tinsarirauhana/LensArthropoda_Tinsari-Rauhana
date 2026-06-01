import json
import torch
import io
from PIL import Image
import torchvision.transforms as transforms

class InsectClassifier:
    def __init__(self, model_path: str):
        # Load metadata
        import os
        meta_path = os.path.join(os.path.dirname(model_path), "model_metadata.json")
        with open(meta_path, "r") as f:
            metadata = json.load(f)

        self.class_names = metadata["class_names"]
        self.img_size    = metadata.get("img_size", 224)
        mean             = metadata.get("imagenet_mean", [0.485, 0.456, 0.406])
        std              = metadata.get("imagenet_std",  [0.229, 0.224, 0.225])

        # Load TorchScript model
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model  = torch.jit.load(model_path, map_location=self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((self.img_size, self.img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ])

    def predict(self, image_bytes: bytes, top_k: int = 3):
        image  = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probs  = torch.softmax(logits, dim=1)[0]

        top_k      = min(top_k, len(self.class_names))
        top_probs, top_idx = torch.topk(probs, top_k)

        predictions = [
            {
                "label":      self.class_names[i.item()],
                "confidence": round(p.item() * 100, 2),
            }
            for p, i in zip(top_probs, top_idx)
        ]
        return predictions