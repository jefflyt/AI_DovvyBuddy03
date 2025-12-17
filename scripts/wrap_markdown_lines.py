#!/usr/bin/env python3
"""Reflow markdown files under docs/plans to max width 80 while avoiding modifying code fences, tables, and inline code blocks.

Rules:
- Skip code fences (```...```) entirely.
- Skip table rows (lines containing | with at least 2 pipes and not starting with "|---").
- Wrap headings ("# ...") preserving the hashes.
- Wrap list items preserving list marker and leading checkbox, indenting wrapped lines for alignment.
- Wrap normal paragraphs (consecutive non-empty, non-special lines).
- Preserve blank lines and other constructs.

This is deterministic and content-preserving (only whitespace and soft line breaks change).
"""

import os
import re
import textwrap

ROOT = os.path.join(os.path.dirname(__file__), '..')
PLANS_DIR = os.path.join(ROOT, 'docs', 'plans')
MAX_WIDTH = 80

list_item_re = re.compile(r'^(?P<indent>\s*)(?P<marker>([-*+]|\d+\.)\s+)(?P<body>.*)$')
heading_re = re.compile(r'^(?P<hashes>#+)(?:\s+)(?P<body>.*)$')
code_fence_re = re.compile(r'^\s*```')
table_row_re = re.compile(r'\|')


def wrap_paragraph(text, width=MAX_WIDTH):
    # use textwrap.fill to wrap a paragraph
    return textwrap.fill(text, width=width)


def wrap_heading(line):
    m = heading_re.match(line)
    if not m:
        return line
    hashes = m.group('hashes')
    body = m.group('body').strip()
    if len(hashes) + 1 + len(body) <= MAX_WIDTH:
        return line
    wrapped = textwrap.wrap(body, width=MAX_WIDTH - (len(hashes) + 1))
    if not wrapped:
        return line
    out = [f"{hashes} {wrapped[0]}"]
    for ln in wrapped[1:]:
        out.append(ln)
    return '\n'.join(out)


def wrap_list_item(line):
    m = list_item_re.match(line)
    if not m:
        return line
    indent = m.group('indent')
    marker = m.group('marker')
    body = m.group('body').strip()
    prefix = indent + marker
    sub_width = MAX_WIDTH - len(prefix)
    wrapped = textwrap.wrap(body, width=sub_width)
    if not wrapped:
        return line
    out = [prefix + wrapped[0]]
    for ln in wrapped[1:]:
        out.append(' ' * len(prefix) + ln)
    return '\n'.join(out)


def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    out_lines = []
    in_code = False
    para_buf = []

    def flush_para():
        nonlocal para_buf
        if not para_buf:
            return
        # join with spaces and wrap
        text = ' '.join(l.strip() for l in para_buf)
        wrapped = textwrap.wrap(text, width=MAX_WIDTH)
        for ln in wrapped:
            out_lines.append(ln + '\n')
        para_buf = []

    for i, raw in enumerate(lines):
        line = raw.rstrip('\n')
        if code_fence_re.match(line):
            # fence: flush paragraph first, then copy fence line and toggle
            flush_para()
            out_lines.append(line + '\n')
            in_code = not in_code
            continue
        if in_code:
            out_lines.append(line + '\n')
            continue
        # skip tables
        if '|' in line and not line.strip().startswith('-') and not line.strip().startswith('*') and re.search(r'\|', line):
            flush_para()
            out_lines.append(line + '\n')
            continue
        if not line.strip():
            flush_para()
            out_lines.append('\n')
            continue
        # headings
        if heading_re.match(line):
            flush_para()
            wrapped = wrap_heading(line)
            out_lines.extend([ln + '\n' for ln in wrapped.split('\n')])
            continue
        # list items
        if list_item_re.match(line):
            flush_para()
            wrapped = wrap_list_item(line)
            out_lines.extend([ln + '\n' for ln in wrapped.split('\n')])
            continue
        # otherwise paragraph line: buffer
        para_buf.append(line)

    flush_para()

    new_text = ''.join(out_lines)
    # Only write if different
    with open(path, 'r', encoding='utf-8') as f:
        orig = f.read()
    if orig != new_text:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_text)
        return True
    return False


if __name__ == '__main__':
    changed = []
    for fname in os.listdir(PLANS_DIR):
        if not fname.endswith('.md'):
            continue
        path = os.path.join(PLANS_DIR, fname)
        print('Processing', path)
        try:
            updated = process_file(path)
            if updated:
                changed.append(path)
        except Exception as e:
            print('Failed to process', path, e)
    print('Files changed:', len(changed))
    for c in changed:
        print(' -', c)
