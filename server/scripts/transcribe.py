#!/usr/bin/env python3
"""
Transcribe an audio file using OpenAI Whisper (self-hosted).
Outputs JSON to stdout: { "text": "...", "language": "fr" }

Usage: python3 transcribe.py <audio_file_path>

Requirements:
    pip install openai-whisper
    System: ffmpeg
"""

import sys
import json
import whisper


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file path provided"}), file=sys.stderr)
        sys.exit(1)

    audio_path = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "base"

    try:
        model = whisper.load_model(model_name)
        result = model.transcribe(audio_path, language="fr")

        output = {
            "text": result["text"].strip(),
            "language": result.get("language", "fr"),
        }

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
