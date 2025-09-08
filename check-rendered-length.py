#!/usr/bin/env python3

import os
import glob
import re

def strip_ansi_codes(text):
    """Remove ANSI escape codes from text to get the actual rendered length."""
    # Remove ANSI escape sequences (ESC [ ... m)
    ansi_escape = re.compile(r'\x1b\[[0-9;]*m')
    return ansi_escape.sub('', text)

def get_title_from_file(file_path):
    """Extract the title from the file content (line 2, which contains 'font: Title')"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        if len(lines) >= 2:
            # Line 2 contains "font: Title"
            font_line = lines[1].strip()
            if font_line.startswith('font: '):
                return font_line[6:]  # Remove "font: " prefix
        return None
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def check_rendered_lengths():
    """Check which ASCII art titles have rendered lengths over 80 characters."""
    
    napalm_dir = "/home/jet/Documents/napalm/public/napalm"
    
    if not os.path.exists(napalm_dir):
        print(f"Error: Directory {napalm_dir} does not exist")
        return
    
    print(f"Checking rendered lengths of ASCII art in {napalm_dir}...")
    print("=" * 80)
    
    # Get all .tdf.txt files
    pattern = os.path.join(napalm_dir, "*.tdf.txt")
    files = glob.glob(pattern)
    
    long_titles = []
    max_length = 0
    
    for file_path in files:
        filename = os.path.basename(file_path)
        title = get_title_from_file(file_path)
        
        if not title:
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Skip first 4 lines (metadata) and get the ASCII art content
            content_lines = lines[4:] if len(lines) > 4 else []
            
            if not content_lines:
                continue
            
            # Find the longest line in the ASCII art (after removing ANSI codes)
            max_line_length = 0
            for line in content_lines:
                # Remove ANSI codes and get the actual rendered length
                clean_line = strip_ansi_codes(line.rstrip('\n\r'))
                line_length = len(clean_line)
                max_line_length = max(max_line_length, line_length)
            
            if max_line_length > 80:
                long_titles.append({
                    'filename': filename,
                    'title': title,
                    'max_length': max_line_length
                })
            
            max_length = max(max_length, max_line_length)
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    
    # Sort by length (longest first)
    long_titles.sort(key=lambda x: x['max_length'], reverse=True)
    
    print(f"Found {len(long_titles)} titles with rendered length > 80 characters:")
    print()
    
    for item in long_titles:
        print(f"Title: {item['title']}")
        print(f"File: {item['filename']}")
        print(f"Max rendered length: {item['max_length']} characters")
        print("-" * 40)
    
    print(f"\nOverall max rendered length found: {max_length} characters")
    print(f"Total files checked: {len(files)}")
    print(f"Files with length > 80: {len(long_titles)}")

if __name__ == "__main__":
    check_rendered_lengths()
