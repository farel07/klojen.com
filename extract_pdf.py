import fitz

pdf_path = r'c:\apps\klojen.com\5601-Article Text-13164-1-10-20250116.pdf'
doc = fitz.open(pdf_path)

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    print(f'\n{"="*60}')
    print(f'PAGE {page_num + 1}')
    print(f'{"="*60}')
    print(text[:3000])
    if len(text) > 3000:
        print(f'\n... (truncated, total {len(text)} chars)')
