from docx import Document
doc = Document('laporan_pkl.docx')

# Find all paragraphs containing [Gambar ... placeholder
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if '[Gambar' in t or 'Gambar 3.' in t and '—' in t:
        print(f'[{i}] {p.style.name!r}: {t[:120]}')
    # Also check for "Alur:" text which indicates diagram description
    if t.startswith('Alur:'):
        print(f'[{i}] {p.style.name!r}: {t[:120]}')
