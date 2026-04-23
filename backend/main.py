from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(override=True)

app = FastAPI()

# CORS (important)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The API keys are loaded directly inside the endpoint logic to allow fallbacks.

class CodeInput(BaseModel):
    code: str

@app.post("/analyze")
def analyze_code(input: CodeInput):
    prompt = f"""
You are a senior software engineer performing a code review.

Analyze the given code and return ONLY valid JSON.

Format:
{{
  "bugs": ["..."],
  "improvements": ["..."],
  "style": ["..."],
  "security": ["..."],
  "performance": ["..."]
}}

Rules:
- ALWAYS return valid JSON
- NO explanation text
- NO markdown (no ```)

Code:
{input.code}
"""

    try:
        providers = [
            {
                "name": "Groq (Llama 3.1 8b)",
                "api_key": os.getenv("GROQ_API_KEY"),
                "base_url": "https://api.groq.com/openai/v1",
                "model": "llama-3.1-8b-instant"
            },
            {
                "name": "Grok (xAI)",
                "api_key": os.getenv("GROK_API_KEY"),
                "base_url": "https://api.x.ai/v1",
                "model": "grok-2-latest"
            },
            {
                "name": "Gemini (Google)",
                "api_key": os.getenv("GOOGLE_API_KEY"),
                "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
                "model": "gemini-2.5-flash"
            }
        ]

        raw_text = None
        last_error = None

        for provider in providers:
            if not provider["api_key"] or provider["api_key"] == "placeholder_key_here" or provider["api_key"] == "placeholder_grok_key_here":
                print(f"Skipping {provider['name']} due to missing API key.")
                continue
                
            try:
                print(f"Attempting to use {provider['name']}...")
                client = OpenAI(
                    api_key=provider["api_key"],
                    base_url=provider["base_url"],
                )
                response = client.chat.completions.create(
                    model=provider["model"],
                    messages=[{"role": "user", "content": prompt}]
                )
                raw_text = response.choices[0].message.content.strip()
                print(f"Successfully generated response with {provider['name']}!")
                break # Success! Exit the fallback loop.
            except Exception as e:
                print(f"Error with {provider['name']}: {repr(e)}")
                last_error = e

        if not raw_text:
            raise Exception(f"All configured providers failed or no API keys were valid. Last error: {last_error}")

        print("RAW RESPONSE:", raw_text)  # DEBUG

        # Remove markdown if present
        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        try:
            data = json.loads(raw_text)
        except:
            # fallback if parsing fails
            data = {
                "bugs": [],
                "improvements": [raw_text],
                "style": [],
                "security": [],
                "performance": []
            }

        return data

    except Exception as e:
        print("ERROR:", repr(e))
        return {"error": str(e)}