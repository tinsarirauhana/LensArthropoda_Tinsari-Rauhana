import os
from google import genai
from google.genai import types

class GeminiExpert:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def get_insect_info(self, insect_name: str) -> str:
        prompt = f"""
        Berdasarkan hasil identifikasi gambar, serangga ini adalah "{insect_name}".
        Tolong berikan informasi detail dengan format yang rapi dan menarik:
        - Nama Ilmiah:
        - Nama Umum:
        - Spesies:
        - Genus:
        - Famili:
        - Habitat:
        - Fun Fact: (Berikan 1 atau 2 fakta unik yang jarang diketahui)
        
        Berikan jawaban langsung tanpa basa-basi pengantar.
        """

        contents = [
            types.Content(
                role="user",
                parts=[types.Part(text=prompt)],
            )
        ]

        generate_content_config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=512),
            tools=[types.Tool(google_search=types.GoogleSearch())],
            response_modalities=["TEXT"],
        )

        response_text = ""
        for chunk in self.client.models.generate_content_stream(
            model="gemini-2.5-flash-lite",
            contents=contents,
            config=generate_content_config,
        ):
            if hasattr(chunk, 'candidates') and chunk.candidates:
                for candidate in chunk.candidates:
                    if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                        print("GOOGLE SEARCH AKTIF:", candidate.grounding_metadata)
            if chunk.text:
                response_text += chunk.text

        return response_text