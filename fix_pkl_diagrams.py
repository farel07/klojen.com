"""Replace broken diagrams in laporan_pkl.docx with fresh mermaid.ink renders."""
import os, base64, urllib.request, time, io
from docx import Document
from docx.shared import Inches
from lxml import etree

INPUT = r'c:\apps\klojen.com\laporan_pkl.docx'
OUTPUT = r'c:\apps\klojen.com\laporan_pkl_fixed.docx'
MERMAID_API = 'https://mermaid.ink/img/'

THEME = """%%{init: {'theme': 'default', 'themeCSS': 'text { fill: #000 !important; } .actor { fill: #d6e4f5 !important; stroke: #333 !important; } .messageText { fill: #000 !important; font-size: 13px !important; } .noteText { fill: #000 !important; } .loopText { fill: #000 !important; } .label text { fill: #000 !important; } .node rect, .node circle, .node polygon { fill: #d6e4f5 !important; stroke: #333 !important; stroke-width: 1.5px !important; }'} }%%\n"""

# Define the broken diagrams and their mermaid code
DIAGRAMS_TO_FIX = {
    # Use Case Diagram - para 451
    'use_case': THEME + """graph TB
    subgraph System["Sistem Klojen.com"]
        UC1[Login / Register]
        UC2[Buat Artikel]
        UC3[Edit Artikel]
        UC4[Review Artikel]
        UC5[Publish Artikel]
        UC6[Schedule Publish]
        UC7[Hapus Artikel]
        UC8[Bookmark Artikel]
        UC9[Komentar]
        UC10[Upload Media]
        UC11[Pencarian]
        UC12[Manajemen User]
        UC13[Manajemen Kategori]
        UC14[Analytics]
    end
    Jurnalis --> UC1
    Jurnalis --> UC2
    Jurnalis --> UC3
    Jurnalis --> UC8
    Jurnalis --> UC9
    Jurnalis --> UC10
    Jurnalis --> UC11
    Editor --> UC1
    Editor --> UC4
    Editor --> UC5
    Editor --> UC6
    Editor --> UC7
    Editor --> UC9
    Editor --> UC13
    Editor --> UC14
    Admin --> UC1
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Reader --> UC1
    Reader --> UC8
    Reader --> UC9
    Reader --> UC11""",

    # Activity Diagram - Alur Penulisan & Publikasi Artikel - para 470
    'act_penulisan': THEME + """flowchart TD
    A([Jurnalis Mulai]) --> B[Buka halaman Tulis Berita]
    B --> C[Isi form: Judul, Konten, Kategori, Tag]
    C --> D{Upload Gambar?}
    D -->|Ya| E[Upload + Crop Gambar]
    D -->|Tidak| F{Simpan Sebagai?}
    E --> F
    F -->|Draft| G[POST /cms/articles status=draft]
    F -->|Review| H[POST /cms/articles status=review]
    G --> I([Artikel tersimpan sebagai draft])
    H --> J([Artikel masuk antrian review])
    J --> K{Editor Review}
    K -->|Approve| L[Patch status=published]
    K -->|Reject| M[Kembalikan ke draft + catatan]
    K -->|Schedule| N[Patch status=scheduled + waktu]
    L --> O([Artikel terbit di portal])
    M --> P([Jurnalis revisi artikel])
    N --> Q([Cron job auto-publish])
    Q --> O""",

    # Sequence Diagram - Proses Login - para 499
    'seq_login': THEME + """sequenceDiagram
    participant U as User (Browser)
    participant FE as Frontend (Next.js)
    participant API as Backend API (Laravel)
    participant DB as Database
    U->>FE: Masukkan email & password
    FE->>API: POST /auth/login {email, password}
    API->>DB: SELECT user WHERE email=?
    DB-->>API: User data
    API->>API: Verify password (Hash::check)
    alt Login Berhasil
        API->>DB: INSERT refresh_tokens
        DB-->>API: Token saved
        API-->>FE: 200 {access_token, refresh_token, user}
        FE->>FE: Simpan token di authStore
        FE-->>U: Redirect ke dashboard
    else Login Gagal
        API-->>FE: 401 {error: "Invalid credentials"}
        FE-->>U: Tampilkan pesan error
    end""",
}

def render_mermaid(name, code):
    """Render mermaid diagram to PNG bytes."""
    print(f'  Rendering {name}...')
    b64 = base64.urlsafe_b64encode(code.encode('utf-8')).decode('ascii')
    url = MERMAID_API + b64
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        print(f'    OK ({len(data)} bytes)')
        return data
    except Exception as e:
        print(f'    FAILED: {e}')
        return None

# Render all diagrams
print('=== Rendering Diagrams ===')
rendered = {}
for name, code in DIAGRAMS_TO_FIX.items():
    data = render_mermaid(name, code)
    if data:
        rendered[name] = data
    time.sleep(0.3)

# Now replace images in the document
print('\n=== Replacing Images ===')
doc = Document(INPUT)

# Mapping: paragraph index -> diagram name -> image relationship IDs to replace
PARA_MAP = {
    451: ('use_case', ['rId10', 'rId11', 'rId12', 'rId13', 'rId14', 'rId15', 'rId16', 
                        'rId17', 'rId18', 'rId19', 'rId20', 'rId21', 'rId22', 'rId23',
                        'rId24', 'rId25', 'rId26', 'rId27', 'rId28', 'rId29', 'rId30',
                        'rId31', 'rId32', 'rId33']),
    470: ('act_penulisan', ['rId35']),
    499: ('seq_login', ['rId36']),
}

for para_idx, (diag_name, rel_ids) in PARA_MAP.items():
    if diag_name not in rendered:
        print(f'  Skipping {diag_name} (not rendered)')
        continue
    
    img_data = rendered[diag_name]
    
    # For Use Case Diagram (many small images), replace ALL with single image
    if diag_name == 'use_case':
        # Replace all relationship blobs with the same image
        for rel_id in rel_ids:
            if rel_id in doc.part.rels:
                rel = doc.part.rels[rel_id]
                rel.target_part._blob = img_data
        print(f'  Replaced {len(rel_ids)} image blobs for Use Case Diagram')
    
    # For single-image diagrams, just replace the blob
    else:
        rel_id = rel_ids[0]
        if rel_id in doc.part.rels:
            rel = doc.part.rels[rel_id]
            rel.target_part._blob = img_data
            print(f'  Replaced {rel_id} for {diag_name}')

# Save
doc.save(OUTPUT)
print(f'\nDone! Saved to {OUTPUT}')
