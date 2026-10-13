# app/ingestion/loader.py
from pypdf import PdfReader

def load_pdf_pages(pdf_path: str):
    """
    Generator: yields (page_number, page_text) one page at a time,
    instead of loading and returning the whole document at once.
    """
    reader = PdfReader(pdf_path)
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():   # skip blank pages
            yield i + 1, text