import re
from pathlib import Path

file = Path(__file__).parent / 'text.html'
html_content = file.read_text(encoding='utf-8')
clean_text = re.sub('<.*?>', '', html_content)
file.write_text(clean_text, encoding='utf-8')
