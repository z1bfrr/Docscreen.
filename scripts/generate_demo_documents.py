"""
Generate 8 synthetic demo documents as PIL images.
All names, IDs, and addresses are entirely fictional.
Run: python scripts/generate_demo_documents.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import json
import random
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import qrcode
import io

OUTPUT_DIR = Path("data/synthetic")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Fictional Data ────────────────────────────────────────────────────────────
NAMES = [
    "ARJUN MEHTA", "PRIYA SHARMA", "VIKRAM NAIR", "ANITA JOSHI",
    "ROHIT VERMA", "SUNITA PATEL", "DEEPAK REDDY", "KAVITA SINGH",
]
IDS = [
    "NIC-4821-7734-0092", "NIC-3312-8821-4450", "NIC-9901-2234-6677",
    "NIC-5544-1123-8800", "NIC-7732-9988-1234",
]
ADDRESSES = [
    "42, Lakeview Colony, Bhopal, MP 462001",
    "17, Green Park, Pune, MH 411001",
    "8, Rose Lane, Jaipur, RJ 302001",
    "91, Nehru Street, Chennai, TN 600001",
]
DOBS = ["14/03/1992", "22/07/1988", "05/11/1995", "30/01/1985", "18/09/2000"]
ISSUES = ["01/07/2018", "15/03/2020", "22/08/2019", "10/01/2021"]
EXPIRIES = ["01/07/2028", "15/03/2030", "22/08/2029", "10/01/2031"]

W, H = 1200, 800  # Landscape ID card

# ── Color Theme ───────────────────────────────────────────────────────────────
BLUE_DARK  = (15, 40, 80)
BLUE_MID   = (30, 80, 160)
BLUE_LIGHT = (60, 120, 200)
WHITE      = (255, 255, 255)
GRAY_LIGHT = (220, 225, 235)
GOLD       = (200, 160, 40)
TEXT_DARK  = (20, 20, 40)
RED_ACCENT = (200, 40, 40)


def _try_font(size):
    for font_name in ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf", "LiberationSans-Regular.ttf"]:
        try:
            return ImageFont.truetype(font_name, size)
        except Exception:
            pass
    return ImageFont.load_default()


def _draw_card_base(draw, img):
    """Draw the base card with header, logo area, and layout."""
    # Background gradient effect
    for y in range(H):
        r = int(15 + (y / H) * 10)
        g = int(40 + (y / H) * 15)
        b = int(80 + (y / H) * 30)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Header band
    draw.rectangle([(0, 0), (W, 110)], fill=BLUE_DARK)
    draw.rectangle([(0, 108), (W, 115)], fill=GOLD)

    # Footer band
    draw.rectangle([(0, H - 60), (W, H)], fill=BLUE_DARK)
    draw.rectangle([(0, H - 62), (W, H - 55)], fill=GOLD)

    # Side accent
    draw.rectangle([(0, 0), (8, H)], fill=BLUE_LIGHT)

    # Photo placeholder
    draw.rectangle([(30, 140), (230, 370)], fill=BLUE_MID, outline=GOLD, width=3)
    draw.rectangle([(35, 145), (225, 365)], fill=(50, 100, 180))

    # Person silhouette
    draw.ellipse([(100, 165), (165, 235)], fill=(180, 200, 230))
    draw.ellipse([(75, 240), (195, 360)], fill=(150, 175, 210))

    # QR code area placeholder
    draw.rectangle([(920, 500), (1080, 660)], fill=WHITE, outline=GRAY_LIGHT, width=2)

    return draw


def _draw_logo(draw):
    """Draw a synthetic government logo."""
    draw.ellipse([(20, 10), (100, 90)], fill=GOLD, outline=WHITE, width=2)
    draw.ellipse([(35, 25), (85, 75)], fill=BLUE_DARK)
    draw.ellipse([(45, 35), (75, 65)], fill=GOLD)


def _draw_header(draw):
    f_large = _try_font(28)
    f_small = _try_font(16)
    draw.text((120, 20), "REPUBLIC OF SYNTHLAND", font=f_large, fill=WHITE)
    draw.text((120, 58), "NATIONAL IDENTITY AUTHORITY", font=f_small, fill=GRAY_LIGHT)
    draw.text((120, 80), "SYNTHETIC IDENTITY CARD", font=f_small, fill=GOLD)


def _draw_fields(draw, name, dob, doc_id, address, issue, expiry, shift_id=False):
    """Draw identity fields on card."""
    f_label = _try_font(16)
    f_value = _try_font(22)
    f_bold  = _try_font(26)

    x_label = 260
    x_value = 260
    id_x = 180 if shift_id else x_value  # shifted for layout tamper demo

    # Name
    draw.text((x_label, 150), "Name / नाम", font=f_label, fill=GRAY_LIGHT)
    draw.text((x_value, 175), name, font=f_bold, fill=WHITE)

    # DOB
    draw.text((x_label, 225), "Date of Birth / जन्म तिथि", font=f_label, fill=GRAY_LIGHT)
    draw.text((x_value, 250), f"DOB: {dob}", font=f_value, fill=WHITE)

    # ID
    draw.text((x_label, 300), "ID Number / पहचान संख्या", font=f_label, fill=GRAY_LIGHT)
    draw.text((id_x, 325), doc_id, font=f_value, fill=GOLD)

    # Address
    draw.text((x_label, 375), "Address / पता", font=f_label, fill=GRAY_LIGHT)
    addr_lines = address[:50] + ("..." if len(address) > 50 else "")
    draw.text((x_value, 400), addr_lines, font=f_value, fill=WHITE)

    # Issue / Expiry
    draw.text((x_label, 455), "Issue Date", font=f_label, fill=GRAY_LIGHT)
    draw.text((x_value, 475), issue, font=f_value, fill=WHITE)

    draw.text((600, 455), "Valid Until", font=f_label, fill=GRAY_LIGHT)
    draw.text((600, 475), expiry, font=f_value, fill=WHITE)


def _draw_qr(img, data: str, position=(925, 505), size=150):
    """Generate and paste QR code."""
    try:
        qr = qrcode.QRCode(version=1, box_size=4, border=2)
        qr.add_data(data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
        qr_img = qr_img.resize((size, size), Image.LANCZOS)
        img.paste(qr_img, position)
    except Exception:
        pass


def _draw_footer(draw, doc_id):
    f = _try_font(14)
    draw.text((20, H - 45), f"ID: {doc_id}", font=f, fill=GRAY_LIGHT)
    draw.text((400, H - 45), "DEMO DOCUMENT — NOT FOR OFFICIAL USE", font=f, fill=GOLD)
    draw.text((950, H - 45), "v0.1.0 | SIH 2026", font=f, fill=GRAY_LIGHT)


def _make_base_card(name, dob, doc_id, address, issue, expiry, qr_data=None, shift_id=False):
    img = Image.new("RGB", (W, H), color=BLUE_DARK)
    draw = ImageDraw.Draw(img)
    _draw_card_base(draw, img)
    _draw_logo(draw)
    _draw_header(draw)
    _draw_fields(draw, name, dob, doc_id, address, issue, expiry, shift_id)
    qr_payload = qr_data or f"name:{name}\ndate_of_birth:{dob}\ndocument_id:{doc_id}\nissue_date:{issue}"
    _draw_qr(img, qr_payload)
    _draw_footer(draw, doc_id)
    return img


def _save(img, name):
    path = OUTPUT_DIR / f"{name}.jpg"
    img.save(str(path), "JPEG", quality=95)
    print(f"  [OK] {path}")
    return path


def _save_ground_truth(name, data):
    path = OUTPUT_DIR / f"{name}_ground_truth.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# ═══════════════════════════════════════════════════════════════════
# Document Generators
# ═══════════════════════════════════════════════════════════════════

def gen_authentic():
    """1. Genuine synthetic document — no modifications."""
    name, dob, doc_id = NAMES[0], DOBS[0], IDS[0]
    address, issue, expiry = ADDRESSES[0], ISSUES[0], EXPIRIES[0]
    img = _make_base_card(name, dob, doc_id, address, issue, expiry)
    _save(img, "authentic")
    _save_ground_truth("authentic", {
        "label": "authentic", "modifications": [],
        "expected_risk": "LOW", "expected_score": 12,
        "fields": {"name": name, "dob": dob, "doc_id": doc_id}
    })


def gen_text_tampered():
    """2. Text-modified document — DOB field altered."""
    name, dob, doc_id = NAMES[1], DOBS[4], IDS[1]  # Different DOB (younger)
    address, issue, expiry = ADDRESSES[1], ISSUES[1], EXPIRIES[1]
    img = _make_base_card(name, dob, doc_id, address, issue, expiry)

    # Patch DOB field with obviously wrong text
    draw = ImageDraw.Draw(img)
    f = _try_font(22)
    # Whiteout original DOB region and overdraw with modified value
    draw.rectangle([(260, 248), (560, 278)], fill=BLUE_DARK)
    draw.text((260, 250), "DOB: 14/03/2008", font=f, fill=WHITE)  # changed year

    _save(img, "text_tampered")
    _save_ground_truth("text_tampered", {
        "label": "text_tampered", "modifications": ["dob_field_altered"],
        "expected_risk": "HIGH", "expected_score": 84,
        "original_dob": DOBS[0], "tampered_dob": "14/03/2008"
    })


def gen_photo_tampered():
    """3. Photo-modified document — face region replaced with clearly different block."""
    name, dob, doc_id = NAMES[2], DOBS[1], IDS[2]
    address, issue, expiry = ADDRESSES[2], ISSUES[2], EXPIRIES[2]
    img = _make_base_card(name, dob, doc_id, address, issue, expiry)

    # Replace face region with a distinctly different colored/textured block
    draw = ImageDraw.Draw(img)
    # Fill with different background
    draw.rectangle([(35, 145), (225, 365)], fill=(200, 100, 80))
    # Add noise texture
    px = img.load()
    for y in range(145, 365):
        for x in range(35, 225):
            noise = random.randint(-30, 30)
            r, g, b = px[x, y]
            px[x, y] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise)),
            )

    _save(img, "photo_tampered")
    _save_ground_truth("photo_tampered", {
        "label": "photo_tampered", "modifications": ["face_region_replaced"],
        "expected_risk": "HIGH", "expected_score": 79
    })


def gen_layout_tampered():
    """4. Layout-modified — ID field shifted significantly."""
    name, dob, doc_id = NAMES[3], DOBS[2], IDS[3]
    address, issue, expiry = ADDRESSES[3], ISSUES[3], EXPIRIES[3]
    img = _make_base_card(name, dob, doc_id, address, issue, expiry, shift_id=True)

    _save(img, "layout_tampered")
    _save_ground_truth("layout_tampered", {
        "label": "layout_tampered", "modifications": ["id_field_shifted"],
        "expected_risk": "MEDIUM", "expected_score": 58
    })


def gen_qr_mismatch():
    """5. QR payload differs from visible fields."""
    name, dob, doc_id = NAMES[4], DOBS[3], IDS[4]
    address, issue, expiry = ADDRESSES[0], ISSUES[0], EXPIRIES[0]

    # QR has WRONG ID
    qr_data = f"name:{name}\ndate_of_birth:{dob}\ndocument_id:NIC-4821-7734-9999\nissue_date:{issue}"
    img = _make_base_card(name, dob, doc_id, address, issue, expiry, qr_data=qr_data)

    _save(img, "qr_mismatch")
    _save_ground_truth("qr_mismatch", {
        "label": "qr_mismatch",
        "modifications": ["qr_id_differs_from_visible"],
        "visible_id": doc_id,
        "qr_id": "NIC-4821-7734-9999",
        "expected_risk": "HIGH", "expected_score": 76
    })


def gen_low_quality():
    """6. Low quality scan — blur + low resolution."""
    name, dob, doc_id = NAMES[0], DOBS[0], IDS[0]
    address, issue, expiry = ADDRESSES[0], ISSUES[0], EXPIRIES[0]
    img = _make_base_card(name, dob, doc_id, address, issue, expiry)

    # Downscale then upscale (quality loss)
    img = img.resize((400, 267), Image.LANCZOS)
    img = img.resize((W, H), Image.NEAREST)
    # Heavy blur
    img = img.filter(ImageFilter.GaussianBlur(radius=4))
    # Reduce contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(0.5)

    _save(img, "low_quality")
    _save_ground_truth("low_quality", {
        "label": "low_quality", "modifications": ["blur", "low_resolution", "low_contrast"],
        "expected_risk": "MEDIUM", "expected_score": 45
    })


def gen_inconsistent():
    """7. Multiple inconsistent fields — impossible dates."""
    name = NAMES[1]
    dob = "01/01/2010"    # Born 2010
    issue = "01/01/2012"  # Issued at age 2 — impossible
    expiry = "01/01/2010" # Expires before issue
    doc_id = IDS[2]
    address = ADDRESSES[1]

    img = _make_base_card(name, dob, doc_id, address, issue, expiry)

    _save(img, "inconsistent")
    _save_ground_truth("inconsistent", {
        "label": "inconsistent",
        "modifications": ["dob_issue_age_impossible", "expiry_before_issue"],
        "expected_risk": "HIGH", "expected_score": 71
    })


def gen_anomaly():
    """8. Combined anomaly — editing noise + compression + unusual data."""
    name, dob, doc_id = NAMES[2], DOBS[1], IDS[3]
    address, issue, expiry = ADDRESSES[2], ISSUES[2], EXPIRIES[2]
    img = _make_base_card(name, dob, doc_id, address, issue, expiry)

    # Apply multiple subtle degradations
    px = img.load()
    rng = random.Random(42)
    for y in range(H):
        for x in range(0, W, 2):
            if rng.random() < 0.05:
                noise = rng.randint(-60, 60)
                r, g, b = px[x, y]
                px[x, y] = (max(0, min(255, r + noise)),
                             max(0, min(255, g + noise)),
                             max(0, min(255, b + noise)))

    # Multiple JPEG re-saves (compression artifacts)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=30)
    buf.seek(0)
    img = Image.open(buf)
    buf2 = io.BytesIO()
    img.save(buf2, "JPEG", quality=50)
    buf2.seek(0)
    img = Image.open(buf2)

    _save(img, "anomaly")
    _save_ground_truth("anomaly", {
        "label": "anomaly",
        "modifications": ["random_noise_injection", "multiple_recompression"],
        "expected_risk": "HIGH", "expected_score": 88
    })


if __name__ == "__main__":
    print("Generating 8 synthetic demo documents...")
    print(f"Output: {OUTPUT_DIR.resolve()}\n")

    try:
        import qrcode
    except ImportError:
        print("[WARN] qrcode not installed — QR codes will be skipped")
        print("  Install: pip install qrcode[pil]\n")

    gen_authentic()
    gen_text_tampered()
    gen_photo_tampered()
    gen_layout_tampered()
    gen_qr_mismatch()
    gen_low_quality()
    gen_inconsistent()
    gen_anomaly()

    print(f"\n[SUCCESS] All 8 demo documents generated in {OUTPUT_DIR.resolve()}")
    print("Next: python scripts/train_anomaly_model.py")
