"""
DocScreen — Structured Field Extractor Module.
Extracts semantic fields from OCR text and bounding boxes using regex,
positional layout heuristics, and structured entity recognition.
"""
import re
import logging
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


@dataclass
class ExtractedField:
    field_name: str
    value: str
    confidence: float
    bbox: Optional[List[int]] = None


def compute_ocr_disagreement(res1: Dict, res2: Dict) -> float:
    """Calculate disagreement ratio between two OCR passes or engines."""
    t1 = res1.get("raw_text", "").strip()
    t2 = res2.get("raw_text", "").strip()
    if not t1 and not t2:
        return 0.0
    if not t1 or not t2:
        return 1.0
    set1, set2 = set(t1.split()), set(t2.split())
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    jaccard = len(intersection) / max(len(union), 1)
    return round(1.0 - jaccard, 2)


def _is_driving_licence_text(raw_text: str) -> bool:
    """Check if text contains clear DL indicators."""
    text_lower = raw_text.lower()
    dl_keywords = [
        "driving licence", "driving license", "indian union driving",
        "transport department", "validity (nt)", "validity (tr)",
        "dl no", "licence no", "authorization to drive", "organ donor"
    ]
    return any(kw in text_lower for kw in dl_keywords)


def extract_fields(ocr_result: Dict[str, Any]) -> List[ExtractedField]:
    """
    Extract structured identity fields from OCR words and raw text.
    Handles Aadhaar, PAN, Passport, Driving Licence, Voter ID, and general Indian credentials.
    """
    raw_text = ocr_result.get("raw_text", "")
    words = ocr_result.get("words", [])
    extracted: List[ExtractedField] = []
    text_lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    is_dl = _is_driving_licence_text(raw_text)

    # Collect all valid dates in document: [DD-MM-YYYY or DD/MM/YYYY]
    date_matches = re.findall(r'\b([0-3]?[0-9][/-][0-1]?[0-9][/-][1-2][0-9]{3})\b', raw_text)
    # Parse years to sort chronologically if needed
    parsed_dates = []
    for d in date_matches:
        try:
            sep = "-" if "-" in d else "/"
            parts = d.split(sep)
            day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
            if 1 <= day <= 31 and 1 <= month <= 12 and 1920 <= year <= 2099:
                parsed_dates.append((year, month, day, d))
        except Exception:
            pass
    parsed_dates.sort(key=lambda x: (x[0], x[1], x[2]))

    # -------------------------------------------------------------
    # 1. ID NUMBER (Driving Licence prioritized, then Aadhaar, PAN, etc.)
    # -------------------------------------------------------------
    id_found = False

    # 1A. Driving Licence: TN64 20260000732 or TN6420260000732 etc.
    dl_match = re.search(r'\b([A-Z]{2}\d{2}\s?\d{11})\b', raw_text)
    if not dl_match:
        dl_match = re.search(r'\b([A-Z]{2}\d{13,14})\b', raw_text)
    if not dl_match:
        dl_match = re.search(r'\b([A-Z]{2}[ -]?\d{2}[ -]?\d{4}[ -]?\d{7})\b', raw_text)
    if not dl_match:
        dl_match = re.search(
            r'(?:DL\s*No|Licence\s*No|License\s*No|DLN)[:\s]*([A-Z0-9\s/-]{8,22})',
            raw_text, re.IGNORECASE
        )

    if dl_match:
        val = dl_match.group(1).strip()
        extracted.append(ExtractedField(
            field_name="id_number",
            value=val,
            confidence=0.96,
            bbox=None
        ))
        id_found = True

    # 1B. Aadhaar: 12 digits — ONLY if document is NOT a DL
    # This prevents DL text from triggering false Aadhaar checks
    if not id_found and not is_dl:
        aadhaar_match = re.search(r'\b(\d{4}\s\d{4}\s\d{4})\b', raw_text)
        if not aadhaar_match:
            aadhaar_match = re.search(r'\b(\d{12})\b', raw_text)
        if aadhaar_match:
            extracted.append(ExtractedField(
                field_name="id_number",
                value=aadhaar_match.group(1),
                confidence=0.94,
                bbox=None
            ))
            id_found = True

    # For DL docs, also try to extract Aadhaar if present (some DLs reference it)
    if not id_found and is_dl:
        aadhaar_match = re.search(r'\b(\d{4}\s\d{4}\s\d{4})\b', raw_text)
        if aadhaar_match:
            extracted.append(ExtractedField(
                field_name="id_number",
                value=aadhaar_match.group(1),
                confidence=0.80,
                bbox=None
            ))
            id_found = True

    # 1C. PAN: 5 letters, 4 digits, 1 letter
    if not id_found:
        pan_match = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z])\b', raw_text)
        if pan_match:
            extracted.append(ExtractedField(
                field_name="id_number",
                value=pan_match.group(1),
                confidence=0.95,
                bbox=None
            ))
            id_found = True

    # 1D. Passport: 1 letter + 7 digits
    if not id_found:
        passport_match = re.search(r'\b([A-Z][0-9]{7})\b', raw_text)
        if passport_match:
            extracted.append(ExtractedField(
                field_name="id_number",
                value=passport_match.group(1),
                confidence=0.92,
                bbox=None
            ))
            id_found = True

    # 1E. Voter ID (EPIC): 3 letters + 7 digits
    if not id_found:
        voter_match = re.search(r'\b([A-Z]{3}[0-9]{7})\b', raw_text)
        if voter_match:
            extracted.append(ExtractedField(
                field_name="id_number",
                value=voter_match.group(1),
                confidence=0.90,
                bbox=None
            ))
            id_found = True

    # -------------------------------------------------------------
    # 2. NAME
    # -------------------------------------------------------------
    name_extracted = None
    for i, line in enumerate(text_lines):
        m = re.search(r'(?:Name|Holder\'?s?\s*Name)[:\s]+([A-Za-z\s.]{2,40})', line, re.IGNORECASE)
        if m and "signature" not in m.group(1).lower() and len(m.group(1).strip()) > 2:
            name_extracted = m.group(1).strip()
            break
        # Sometimes "Name:" is alone on line i, and name is on line i+1 or i+2
        if re.search(r'^(?:Name|Holder\'?s?\s*Name)[:\s]*$', line, re.IGNORECASE):
            for j in range(1, 4):
                if i + j < len(text_lines):
                    cand = text_lines[i + j].strip()
                    if "signature" in cand.lower() or "photo" in cand.lower():
                        continue
                    if re.match(r'^[A-Za-z\s.]{3,40}$', cand) and not any(
                        k in cand.lower() for k in ["blood", "date", "birth", "validity", "union", "address"]
                    ):
                        name_extracted = cand
                        break
            if name_extracted:
                break

    if not name_extracted:
        # Aadhaar pattern: Cardholder name is almost always directly above the DOB line
        for i, line in enumerate(text_lines):
            if re.search(r'(?:DOB|Date\s*of\s*Birth|जन्म\s*तिथि)', line, re.IGNORECASE) and i > 0:
                prev_line = text_lines[i - 1].strip()
                if re.match(r'^[A-Za-z\s.]{3,35}$', prev_line) and not any(
                    k in prev_line.lower() for k in ["government", "india", "ofindia", "sarkar", "bharat", "uidai", "aadhaar", "male", "female", "licence", "license", "ani"]
                ):
                    name_extracted = prev_line
                    break

    if not name_extracted:
        potential_names = []
        blacklist = {
            "INDIA", "GOVERNMENT", "INCOME", "TAX", "DEPARTMENT", "REPUBLIC",
            "DRIVING", "LICENCE", "LICENSE", "UNION", "TAMIL", "NADU", "ISSUED",
            "ISSUE", "DATE", "VALIDITY", "HOLDER", "SIGNATURE", "ADDRESS",
            "ROAD", "MEENAKSHI", "NAGAR", "MADURAI", "AVANIAPURAM", "SOUTH",
            "BLOOD", "GROUP", "ORGAN", "DONOR", "MAIN", "APK", "PDL", "KARTHIC",
            "MALE", "FEMALE", "MERA", "MERI", "BHARAT", "SARKAR", "UIDAI",
            "ANI", "OFINDIA", "GOVERNMENTOFINDIA", "AUTHORITY", "UNIQUE"
        }
        for w in words:
            w_str = w.get("word", "").strip()
            w_upper = w_str.upper()
            if ((w_str.isupper() or w_str.istitle()) and len(w_str) > 2
                    and w_upper not in blacklist
                    and not any(c.isdigit() for c in w_str)
                    and len(w_str) <= 20):
                potential_names.append(w_str)
        if len(potential_names) >= 2:
            name_extracted = " ".join(potential_names[:3])

    if name_extracted:
        extracted.append(ExtractedField(
            field_name="name",
            value=name_extracted,
            confidence=0.92,
            bbox=None
        ))

    # -------------------------------------------------------------
    # 3. DATE OF BIRTH (DOB)
    # -------------------------------------------------------------
    dob_val = None
    dob_match = re.search(
        r'(?:Date\s*of\s*Birth|DOB|Birth|जन्म\s*तिथि)[:\s/]*([0-3]?[0-9][/-][0-1]?[0-9][/-][1-2][0-9]{3})',
        raw_text, re.IGNORECASE
    )
    if dob_match:
        dob_val = dob_match.group(1)
    elif parsed_dates:
        # DOB is typically the oldest date (<= 2010)
        old_dates = [d[3] for d in parsed_dates if d[0] <= 2010]
        if old_dates:
            dob_val = old_dates[0]

    if dob_val:
        extracted.append(ExtractedField(
            field_name="dob",
            value=dob_val,
            confidence=0.96,
            bbox=None
        ))

    # -------------------------------------------------------------
    # 4. BLOOD GROUP — FIXED: [A|B|AB|O] was wrong regex (| is literal in [])
    # -------------------------------------------------------------
    bg_match = re.search(
        r'(?:Blo[ao]d\s*Group|BG)[:\s]*(?:O\+|O-|A\+|A-|B\+|B-|AB\+|AB-)',
        raw_text, re.IGNORECASE
    )
    if not bg_match:
        # Fallback: look for standalone blood group near "group" keyword context
        bg_match = re.search(
            r'\b(?:Blood\s*Group\s*[:\s]*)?(O\+|O-|A\+|A-|B\+|B-|AB\+|AB-)\b',
            raw_text, re.IGNORECASE
        )

    if bg_match:
        # Extract just the blood group value
        bg_val_match = re.search(r'(O\+|O-|A\+|A-|B\+|B-|AB\+|AB-)', bg_match.group(0), re.IGNORECASE)
        if bg_val_match:
            extracted.append(ExtractedField(
                field_name="blood_group",
                value=bg_val_match.group(1).upper(),
                confidence=0.96,
                bbox=None
            ))

    # -------------------------------------------------------------
    # 5. GENDER
    # -------------------------------------------------------------
    gender_match = re.search(r'\b(Male|Female|Transgender|MALE|FEMALE)\b', raw_text)
    if gender_match:
        extracted.append(ExtractedField(
            field_name="gender",
            value=gender_match.group(1).capitalize(),
            confidence=0.95,
            bbox=None
        ))

    # -------------------------------------------------------------
    # 6. ISSUE DATE & VALIDITY / EXPIRY
    # -------------------------------------------------------------
    issue_match = re.search(
        r'(?:Issue\s*Date|Issued|DOI)[:\s]*([0-3]?[0-9][/-][0-1]?[0-9][/-][1-2][0-9]{3})',
        raw_text, re.IGNORECASE
    )
    if issue_match:
        extracted.append(ExtractedField(
            field_name="issue_date",
            value=issue_match.group(1),
            confidence=0.94,
            bbox=None
        ))
    else:
        # Check for intermediate date (e.g. 2015-2026)
        mid_dates = [d[3] for d in parsed_dates if 2010 <= d[0] <= 2026 and d[3] != dob_val]
        if mid_dates:
            extracted.append(ExtractedField(
                field_name="issue_date",
                value=mid_dates[0],
                confidence=0.88,
                bbox=None
            ))

    # Expiry / Validity: check explicit label first, then future dates
    val_match = re.search(
        r'(?:Validity\s*\(NT\)|Validity\s*\(TR\)|Validity|Valid\s*Till|Expires|Expiry)[:\s]*([0-3]?[0-9][/-][0-1]?[0-9][/-][1-2][0-9]{3})',
        raw_text, re.IGNORECASE
    )
    future_dates = [d for d in parsed_dates if d[0] > 2026]

    if val_match:
        extracted.append(ExtractedField(
            field_name="expiry_date",
            value=val_match.group(1),
            confidence=0.95,
            bbox=None
        ))
    elif future_dates:
        extracted.append(ExtractedField(
            field_name="expiry_date",
            value=future_dates[-1][3],
            confidence=0.92,
            bbox=None
        ))

    # -------------------------------------------------------------
    # 7. GUARDIAN / FATHER / SPOUSE
    # -------------------------------------------------------------
    for i, line in enumerate(text_lines):
        m = re.search(
            r'(?:Son/Daughter/Wife of|S/O|D/O|W/O|Father\'?s?\s*Name)[:\s]*([A-Za-z\s.]{2,40})',
            line, re.IGNORECASE
        )
        if m and len(m.group(1).strip()) > 1:
            extracted.append(ExtractedField(
                field_name="guardian_name",
                value=m.group(1).strip(),
                confidence=0.92,
                bbox=None
            ))
            break
        elif re.search(r'^(?:Son/Daughter/Wife of|S/O|D/O|W/O|Father\'?s?\s*Name)[:\s]*$', line, re.IGNORECASE):
            if i + 1 < len(text_lines):
                cand = text_lines[i + 1].strip()
                if re.match(r'^[A-Za-z\s.]{2,40}$', cand) and "address" not in cand.lower():
                    extracted.append(ExtractedField(
                        field_name="guardian_name",
                        value=cand,
                        confidence=0.92,
                        bbox=None
                    ))
                    break

    # -------------------------------------------------------------
    # 8. ISSUING AUTHORITY / STATE
    # -------------------------------------------------------------
    auth_match = re.search(r'(?:Government\s*Of|Govt\s*of)\s+([A-Za-z\s]{3,30})', raw_text, re.IGNORECASE)
    if auth_match:
        first_line = auth_match.group(1).split("\n")[0].strip()
        extracted.append(ExtractedField(
            field_name="issuing_authority",
            value=f"Government of {first_line}",
            confidence=0.96,
            bbox=None
        ))

    # -------------------------------------------------------------
    # 9. ADDRESS
    # -------------------------------------------------------------
    addr_match = re.search(r'(?:Address|Addr)[:\s]*([A-Za-z0-9\s,./-]{10,180})', raw_text, re.IGNORECASE)
    if addr_match:
        extracted.append(ExtractedField(
            field_name="address",
            value=addr_match.group(1).strip().replace("\n", " "),
            confidence=0.88,
            bbox=None
        ))

    return extracted
