# services.py
from dotenv import load_dotenv
load_dotenv()

import os
import json
from datetime import datetime

import whisper
from openai import OpenAI

print("🔄 Loading Whisper model (large-v3)...")
model = whisper.load_model("large-v3")


def transcribe_audio(file_path: str) -> str:
    result = model.transcribe(
        file_path,
        language="he",
        temperature=0.2,
        beam_size=5,
        initial_prompt="הודעה קולית שמכילה משימה לביצוע"
    )
    return result["text"]


def parse_task_with_gpt(text: str) -> dict:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    with open("prompts/prompt_gemini.txt", encoding="utf-8") as f:
        system_prompt = f.read().replace("{{CURRENT_DATETIME}}", now)

    

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"טקסט לניתוח: {text}"}
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)