#!/usr/bin/env python3
"""
tools/photo_intake.py — Family Archive Photo Intake Tool
=========================================================
Scans a Google Drive folder, classifies photos, and generates:
  1. intake.json  — structured photo data (one entry per photo)
  2. review.html  — interactive web page to identify who's in each photo

Usage (requires a Google API key):
    python tools/photo_intake.py \\
        --folder DRIVE_FOLDER_ID \\
        --api-key YOUR_GOOGLE_API_KEY \\
        --family "Abad Family" \\
        --people people.json

Get a free API key: https://console.cloud.google.com → APIs & Services → Credentials
Enable: Google Drive API

people.json format (list of people from your data.js PEOPLE array):
    [{"id": "jose", "name": "Jose Maria Abad"}, ...]

Date Detection Logic
--------------------
The core problem with digitized physical photos: your phone embeds TODAY's
date in the EXIF, not the date of the original print. This script handles it:

  native_digital     EXIF date is > 2 years old → real digital photo, use EXIF
  digitized_physical EXIF date is recent (< 2 yrs) → phone photo of old print
  no_exif            No date metadata at all

For digitized_physical photos, the script looks for date hints in:
  1. Parent folder name  (e.g. "1980s/", "Christmas-1987/")
  2. Filename            (e.g. "christmas_1987.jpg")
  3. Review page         (you fill in the year manually)
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# ── Optional deps (installed via pip) ──────────────────────────────────────────
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from PIL import Image
    from PIL.ExifTags import TAGS
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


# ── Date detection ─────────────────────────────────────────────────────────────

DIGITIZED_THRESHOLD_YEARS = 2  # EXIF dates within this many years = digitized physical

def parse_year_from_text(text: str) -> Optional[int]:
    """Extract a 4-digit year (1900–2030) from a string."""
    match = re.search(r'\b(19\d{2}|20[0-2]\d)\b', text)
    return int(match.group(1)) if match else None

def parse_decade_from_text(text: str) -> Optional[tuple[int, int]]:
    """Extract decade range from strings like '1980s' → (1980, 1989)."""
    match = re.search(r'\b(19\d0|20[012]0)s\b', text, re.IGNORECASE)
    if match:
        decade = int(match.group(1))
        return (decade, decade + 9)
    return None

def classify_photo(file_meta: dict, local_path: Optional[str] = None,
                   folder_name: str = '') -> dict:
    """
    Classify a photo and return date metadata.

    Returns a dict with:
      date_type        'native_digital' | 'digitized_physical' | 'no_exif'
      date_source      'exif' | 'filename' | 'folder' | 'unknown'
      original_year    int or None
      year_range       (min, max) or None  — for decade estimates
      date_confidence  'exact' | 'approximate' | 'decade' | 'unknown'
      digitized_date   ISO string (when the phone photo was taken), or None
      needs_review     bool
    """
    result = {
        'date_type': 'no_exif',
        'date_source': 'unknown',
        'original_year': None,
        'year_range': None,
        'date_confidence': 'unknown',
        'digitized_date': None,
        'needs_review': True,
    }

    # ── Step 1: Try to read EXIF date ──────────────────────────────────────────
    exif_date = None
    if local_path and HAS_PIL:
        try:
            img = Image.open(local_path)
            exif = img._getexif() or {}
            for tag_id, value in exif.items():
                tag = TAGS.get(tag_id, tag_id)
                if tag in ('DateTimeOriginal', 'DateTime'):
                    exif_date = datetime.strptime(value, '%Y:%m:%d %H:%M:%S')
                    break
        except Exception:
            pass

    if exif_date:
        age_years = (datetime.now() - exif_date).days / 365.25
        if age_years >= DIGITIZED_THRESHOLD_YEARS:
            # Real digital photo — EXIF date is trustworthy
            result.update({
                'date_type': 'native_digital',
                'date_source': 'exif',
                'original_year': exif_date.year,
                'date_confidence': 'exact',
                'needs_review': False,
            })
            return result
        else:
            # Recent EXIF = phone photo of a physical print
            result.update({
                'date_type': 'digitized_physical',
                'digitized_date': exif_date.strftime('%Y-%m-%d'),
            })

    # ── Step 2: Fall back to upload/creation date ──────────────────────────────
    if not exif_date and 'createdTime' in file_meta:
        upload_dt = datetime.fromisoformat(file_meta['createdTime'].replace('Z', '+00:00'))
        age_years = (datetime.now(timezone.utc) - upload_dt).days / 365.25
        if age_years < DIGITIZED_THRESHOLD_YEARS:
            result.update({
                'date_type': 'digitized_physical',
                'digitized_date': upload_dt.strftime('%Y-%m-%d'),
            })

    # ── Step 3: Look for year hints in folder name ─────────────────────────────
    if folder_name:
        year = parse_year_from_text(folder_name)
        if year:
            result.update({
                'date_source': 'folder',
                'original_year': year,
                'date_confidence': 'approximate',
                'needs_review': False,
            })
            return result
        decade = parse_decade_from_text(folder_name)
        if decade:
            result.update({
                'date_source': 'folder',
                'year_range': decade,
                'date_confidence': 'decade',
                'needs_review': True,  # still ask to narrow down
            })
            return result

    # ── Step 4: Look for year hints in the filename ────────────────────────────
    filename = file_meta.get('title', '')
    year = parse_year_from_text(filename)
    if year:
        result.update({
            'date_source': 'filename',
            'original_year': year,
            'date_confidence': 'approximate',
            'needs_review': False,
        })
        return result

    # Nothing found — needs manual review
    return result


# ── Drive API ──────────────────────────────────────────────────────────────────

def list_drive_folder(folder_id: str, api_key: str) -> list[dict]:
    """List all image/video files in a public Google Drive folder."""
    if not HAS_REQUESTS:
        print("ERROR: pip install requests", file=sys.stderr)
        sys.exit(1)

    files = []
    page_token = None
    while True:
        params = {
            'q': f"'{folder_id}' in parents and trashed = false",
            'fields': 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size)',
            'pageSize': 100,
            'key': api_key,
        }
        if page_token:
            params['pageToken'] = page_token

        resp = requests.get(
            'https://www.googleapis.com/drive/v3/files',
            params=params, timeout=30
        )
        resp.raise_for_status()
        data = resp.json()
        files.extend(data.get('files', []))
        page_token = data.get('nextPageToken')
        if not page_token:
            break

    return files


def thumbnail_url(file_id: str, size: int = 1200) -> str:
    return f"https://drive.google.com/thumbnail?id={file_id}&sz=w{size}"


# ── Review HTML generator ──────────────────────────────────────────────────────

def generate_review_html(photos: list[dict], people: list[dict],
                         family_name: str) -> str:
    """Generate a standalone HTML review page for photo identification."""

    people_json = json.dumps(people)
    photos_json = json.dumps(photos)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{family_name} — Photo Review</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          background: #1a1a1a; color: #eee; min-height: 100vh; }}
  header {{ background: #111; padding: 20px 32px; border-bottom: 1px solid #333;
            display: flex; justify-content: space-between; align-items: center; }}
  header h1 {{ font-size: 20px; font-weight: 600; }}
  header p {{ font-size: 13px; color: #888; }}
  .progress {{ font-size: 13px; color: #C9A457; font-weight: 600; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
           gap: 20px; padding: 24px 32px; }}
  .card {{ background: #222; border-radius: 12px; overflow: hidden;
           border: 2px solid transparent; transition: border-color .2s; }}
  .card.reviewed {{ border-color: #2a7a4a; }}
  .card.needs-review {{ border-color: #7a4a2a; }}
  .photo {{ position: relative; aspect-ratio: 4/3; background: #333; }}
  .photo img {{ width: 100%; height: 100%; object-fit: cover; }}
  .photo-badge {{ position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,.7);
                  color: #C9A457; font-size: 11px; font-weight: 600; padding: 3px 8px;
                  border-radius: 4px; }}
  .photo-filename {{ position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,.7);
                     color: #aaa; font-size: 10px; padding: 2px 6px; border-radius: 3px; }}
  .form {{ padding: 16px; display: flex; flex-direction: column; gap: 12px; }}
  label {{ font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #888; }}
  input[type=text], input[type=number], select, textarea {{
    width: 100%; background: #1a1a1a; border: 1px solid #444; border-radius: 6px;
    color: #eee; padding: 8px 10px; font-size: 13px; margin-top: 4px;
  }}
  input:focus, select:focus, textarea:focus {{ outline: none; border-color: #C9A457; }}
  .people-grid {{ display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }}
  .person-chip {{ display: flex; align-items: center; gap: 6px; background: #2a2a2a;
                  border: 1px solid #444; border-radius: 20px; padding: 4px 10px;
                  cursor: pointer; font-size: 12px; transition: all .15s; }}
  .person-chip input {{ width: 14px; height: 14px; cursor: pointer; margin: 0; }}
  .person-chip.checked {{ background: #C9A45722; border-color: #C9A457; color: #C9A457; }}
  .hint {{ font-size: 11px; color: #C9A457; background: #C9A45718; padding: 6px 10px;
           border-radius: 6px; border: 1px solid #C9A45744; }}
  .hint.digitized {{ color: #7ab8d4; background: #7ab8d418; border-color: #7ab8d444; }}
  .actions {{ padding: 24px 32px; display: flex; gap: 12px; justify-content: flex-end;
              position: sticky; bottom: 0; background: #1a1a1a; border-top: 1px solid #333; }}
  .btn {{ padding: 10px 24px; border-radius: 8px; border: none; font-size: 14px;
          font-weight: 600; cursor: pointer; }}
  .btn-primary {{ background: #C9A457; color: #111; }}
  .btn-secondary {{ background: #333; color: #eee; }}
  .export-panel {{ display: none; position: fixed; inset: 0; background: rgba(0,0,0,.85);
                   z-index: 100; padding: 40px; overflow-y: auto; }}
  .export-panel.open {{ display: flex; flex-direction: column; gap: 16px; }}
  .export-panel pre {{ background: #111; border: 1px solid #333; border-radius: 8px;
                       padding: 20px; font-size: 12px; overflow: auto;
                       color: #7ab8d4; max-height: 60vh; }}
  .close-btn {{ align-self: flex-end; background: #333; color: #eee; border: none;
                padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }}
</style>
</head>
<body>

<header>
  <div>
    <h1>{family_name} — Photo Review</h1>
    <p>Identify who's in each photo, add the year and event, then export to data.js</p>
  </div>
  <span class="progress" id="progress-text">0 / {len(photos)} reviewed</span>
</header>

<div class="grid" id="photo-grid"></div>

<div class="actions">
  <button class="btn btn-secondary" onclick="saveProgress()">Save Progress</button>
  <button class="btn btn-primary" onclick="exportJSON()">Export to data.js →</button>
</div>

<div class="export-panel" id="export-panel">
  <button class="close-btn" onclick="document.getElementById('export-panel').classList.remove('open')">✕ Close</button>
  <h2 style="color:#C9A457">Copy this into your data.js</h2>
  <pre id="export-output"></pre>
  <button class="btn btn-primary" onclick="copyExport()">Copy to Clipboard</button>
</div>

<script>
const PEOPLE = {people_json};
const PHOTOS = {photos_json};
let reviews = {{}};

// Load saved progress
try {{
  const saved = localStorage.getItem('photo_review_{family_name.replace(" ", "_")}');
  if (saved) reviews = JSON.parse(saved);
}} catch(e) {{}}

function buildGrid() {{
  const grid = document.getElementById('photo-grid');
  grid.innerHTML = PHOTOS.map((photo, i) => {{
    const r = reviews[photo.id] || {{}};
    const hint = photo.date_type === 'digitized_physical'
      ? `<div class="hint digitized">📷 Phone photo of physical print &mdash; digitized ${{photo.digitized_date || 'today'}}. Set the original year below.</div>`
      : photo.original_year
        ? `<div class="hint">📅 EXIF date: ${{photo.original_year}} (native digital photo)</div>`
        : '';

    const folderHint = photo.folder_hint
      ? `<div class="hint">📁 Folder: "${{photo.folder_hint}}" &rarr; estimated era ${{photo.folder_hint}}</div>` : '';

    const peopleChips = PEOPLE.map(p => {{
      const checked = (r.people || []).includes(p.id);
      return `<label class="person-chip ${{checked ? 'checked' : ''}}" id="chip-${{i}}-${{p.id}}">
        <input type="checkbox" data-photo="${{photo.id}}" data-person="${{p.id}}"
               ${{checked ? 'checked' : ''}} onchange="onPersonToggle(this, ${{i}})">
        ${{p.name.split(' ')[0]}}
      </label>`;
    }}).join('');

    return `
    <div class="card ${{Object.keys(r).length > 0 ? 'reviewed' : 'needs-review'}}" id="card-${{i}}">
      <div class="photo">
        <img src="${{photo.thumb_url}}" alt="${{photo.filename}}"
             onerror="this.style.display='none';this.nextSibling.style.display='flex'">
        <div style="display:none;align-items:center;justify-content:center;height:100%;color:#666;font-size:13px">Could not load</div>
        <span class="photo-badge">${{photo.date_type === 'digitized_physical' ? '📸 Physical print' : '📷 Digital'}}</span>
        <span class="photo-filename">${{photo.filename}}</span>
      </div>
      <div class="form">
        ${{hint}}${{folderHint}}
        <div>
          <label>Year (or approx. decade: 1980, 1985, etc.)</label>
          <input type="number" id="year-${{i}}" min="1900" max="2030"
                 value="${{r.year || photo.original_year || ''}}"
                 placeholder="e.g. 1987"
                 onchange="onFieldChange(${{i}})">
        </div>
        <div>
          <label>Event / Description</label>
          <input type="text" id="event-${{i}}"
                 value="${{r.event || ''}}"
                 placeholder="e.g. Christmas, birthday, vacation..."
                 onchange="onFieldChange(${{i}})">
        </div>
        <div>
          <label>Category</label>
          <select id="cat-${{i}}" onchange="onFieldChange(${{i}})">
            ${{['holidays','birthdays','weddings','travel','everyday','milestones','reunions']
               .map(c => `<option value="${{c}}" ${{(r.category||'everyday')===c?'selected':''}}>
                 ${{c.charAt(0).toUpperCase()+c.slice(1)}}</option>`).join('')}}
          </select>
        </div>
        <div>
          <label>People in this photo</label>
          <div class="people-grid">${{peopleChips}}</div>
        </div>
      </div>
    </div>`;
  }}).join('');
  updateProgress();
}}

function onPersonToggle(cb, cardIdx) {{
  const photoId = cb.dataset.photo;
  const personId = cb.dataset.person;
  if (!reviews[photoId]) reviews[photoId] = {{ people: [] }};
  if (!reviews[photoId].people) reviews[photoId].people = [];
  const chip = document.getElementById(`chip-${{cardIdx}}-${{personId}}`);

  if (cb.checked) {{
    if (!reviews[photoId].people.includes(personId)) reviews[photoId].people.push(personId);
    chip.classList.add('checked');
  }} else {{
    reviews[photoId].people = reviews[photoId].people.filter(p => p !== personId);
    chip.classList.remove('checked');
  }}
  updateCard(cardIdx, photoId);
  updateProgress();
}}

function onFieldChange(cardIdx) {{
  const photo = PHOTOS[cardIdx];
  if (!reviews[photo.id]) reviews[photo.id] = {{ people: [] }};
  reviews[photo.id].year = parseInt(document.getElementById(`year-${{cardIdx}}`).value) || null;
  reviews[photo.id].event = document.getElementById(`event-${{cardIdx}}`).value;
  reviews[photo.id].category = document.getElementById(`cat-${{cardIdx}}`).value;
  updateCard(cardIdx, photo.id);
  updateProgress();
}}

function updateCard(cardIdx, photoId) {{
  const card = document.getElementById(`card-${{cardIdx}}`);
  const r = reviews[photoId] || {{}};
  const hasData = r.year || r.event || (r.people && r.people.length > 0);
  card.classList.toggle('reviewed', hasData);
  card.classList.toggle('needs-review', !hasData);
}}

function updateProgress() {{
  const reviewed = PHOTOS.filter(p => {{
    const r = reviews[p.id] || {{}};
    return r.year || r.event || (r.people && r.people.length > 0);
  }}).length;
  document.getElementById('progress-text').textContent = `${{reviewed}} / ${{PHOTOS.length}} reviewed`;
}}

function saveProgress() {{
  try {{
    localStorage.setItem('photo_review_{family_name.replace(" ", "_")}', JSON.stringify(reviews));
    alert('Progress saved! It will persist in this browser.');
  }} catch(e) {{ alert('Could not save: ' + e.message); }}
}}

function exportJSON() {{
  const output = PHOTOS.map(photo => {{
    const r = reviews[photo.id] || {{}};
    return {{
      drive_id: photo.id,
      filename: photo.filename,
      thumb_url: photo.thumb_url,
      date_type: photo.date_type,
      year: r.year || photo.original_year || null,
      event: r.event || '',
      category: r.category || 'everyday',
      people: r.people || [],
      needs_review: !r.year && !photo.original_year,
    }};
  }});

  // Format as data.js photo entries
  const dataJsSnippet = output.map(p => {{
    const peopleStr = JSON.stringify(p.people);
    return `  // ${{p.filename}} — ${{p.event || 'unlabeled'}} (${{p.year || 'year unknown'}})
  {{ url: '${{p.thumb_url}}', caption: '${{p.event}}', year: ${{p.year || 'null'}} }},  // people: ${{peopleStr}}`;
  }}).join('\\n');

  document.getElementById('export-output').textContent = dataJsSnippet;
  document.getElementById('export-panel').classList.add('open');
}}

function copyExport() {{
  navigator.clipboard.writeText(document.getElementById('export-output').textContent)
    .then(() => alert('Copied!'));
}}

buildGrid();
</script>
</body>
</html>
"""


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Family Archive Photo Intake')
    parser.add_argument('--folder',    required=True, help='Google Drive folder ID')
    parser.add_argument('--api-key',   required=True, help='Google API key')
    parser.add_argument('--family',    default='Family Archive', help='Family name')
    parser.add_argument('--people',    default='', help='Path to people.json')
    parser.add_argument('--folder-name', default='', help='Human name of the folder (for date hints)')
    parser.add_argument('--output',    default='intake', help='Output filename prefix')
    args = parser.parse_args()

    print(f"📂 Listing folder: {args.folder}")
    files = list_drive_folder(args.folder, args.api_key)
    image_files = [f for f in files if f.get('mimeType', '').startswith('image/')]
    print(f"   Found {len(image_files)} image(s)")

    # Load people list
    people = []
    if args.people and os.path.exists(args.people):
        with open(args.people) as f:
            people = json.load(f)

    # Classify each photo
    photos = []
    for f in image_files:
        classification = classify_photo(f, folder_name=args.folder_name)
        photos.append({
            'id':           f['id'],
            'filename':     f.get('name', f.get('title', '')),
            'mime_type':    f.get('mimeType', ''),
            'file_size':    f.get('size', 0),
            'created_time': f.get('createdTime', ''),
            'thumb_url':    thumbnail_url(f['id']),
            'folder_hint':  args.folder_name,
            **classification,
        })

    # Save intake.json
    intake_path = f"{args.output}.json"
    with open(intake_path, 'w') as f:
        json.dump(photos, f, indent=2)
    print(f"✅ Wrote {intake_path}")

    # Generate review.html
    html = generate_review_html(photos, people, args.family)
    review_path = f"{args.output}_review.html"
    with open(review_path, 'w') as f:
        f.write(html)
    print(f"✅ Wrote {review_path}")
    print(f"\n→ Open {review_path} in your browser to identify photos")
    print(f"→ {sum(1 for p in photos if p['date_type'] == 'digitized_physical')} photos flagged as digitized physical")
    print(f"→ {sum(1 for p in photos if p['needs_review'])} photos need date review")


if __name__ == '__main__':
    main()
