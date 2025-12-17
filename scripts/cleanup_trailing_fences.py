#!/usr/bin/env python3
import sys
from pathlib import Path

p = Path(sys.argv[1])
text = p.read_text()
lines = text.splitlines()
# Remove trailing lines that are only triple backticks and trailing blank lines
while lines and lines[-1].strip() == '':
    lines.pop()
if lines and lines[-1].strip() == '```':
    lines.pop()
# Ensure single trailing newline
p.write_text('\n'.join(lines) + '\n')
print(f"Cleaned: {p}")
