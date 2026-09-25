#!/usr/bin/env python3
"""Pre-records every spoken text as a small MP3 (so audio works on phones/webviews without
speechSynthesis). Voices: Piper TTS (MIT) with open voice models from rhasspy/piper-voices.

    pip install piper-tts lameenc
    node scripts/speech-export.mjs && python3 scripts/tts.py

Writes public/audio/<key>.mp3 and src/audio/manifest.json (list of available keys).
Only missing clips are generated; stale clips are deleted.
"""
import io, json, os, sys, urllib.request, wave
from pathlib import Path

import lameenc
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
CACHE = Path(os.environ.get("PIPER_VOICES", Path.home() / ".cache" / "piper-voices"))
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
VOICES = {
    # Rosa, the instructor (female, Mexican Spanish)
    "rosa": ("es/es_MX/claude/high/es_MX-claude-high", 1.0),
    # Big Mike's lines subtitled in Spanish (male, Mexican Spanish)
    "mike_es": ("es/es_MX/ald/medium/es_MX-ald-medium", 1.0),
    # English: foreman orders, boss lines, technical terms (male, US)
    "en": ("en/en_US/ryan/high/en_US-ryan-high", 1.12),
}


def voice_file(path: str) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    name = path.split("/")[-1]
    for ext in (".onnx", ".onnx.json"):
        f = CACHE / f"{name}{ext}"
        if not f.exists():
            print(f"downloading {name}{ext} …", flush=True)
            urllib.request.urlretrieve(HF + path + ext, f)
    return CACHE / f"{name}.onnx"


def to_mp3(pcm: bytes, rate: int) -> bytes:
    enc = lameenc.Encoder()
    enc.set_bit_rate(40)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def main():
    items = json.loads((ROOT / "scripts" / ".speech-texts.json").read_text())
    out_dir = ROOT / "public" / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    loaded = {}
    made = 0
    for it in items:
        dst = out_dir / f"{it['key']}.mp3"
        if dst.exists():
            continue
        v = it["voice"]
        if v not in loaded:
            path, speed = VOICES[v]
            loaded[v] = (PiperVoice.load(str(voice_file(path))), SynthesisConfig(length_scale=speed))
        voice, cfg = loaded[v]
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            voice.synthesize_wav(it["text"], wf, syn_config=cfg)
        buf.seek(0)
        with wave.open(buf) as wf:
            rate = wf.getframerate()
            pcm = wf.readframes(wf.getnframes())
        dst.write_bytes(to_mp3(pcm, rate))
        made += 1
        print(f"  {it['key']} [{v}] {it['text'][:60]}", flush=True)
    keys = sorted(it["key"] for it in items)
    for f in out_dir.glob("*.mp3"):
        if f.stem not in keys:
            f.unlink()
    (ROOT / "src" / "audio" / "manifest.json").write_text(json.dumps(keys) + "\n")
    total = sum(f.stat().st_size for f in out_dir.glob("*.mp3"))
    print(f"{made} new clips, {len(keys)} total, {total / 1e6:.1f} MB")


if __name__ == "__main__":
    sys.exit(main())
