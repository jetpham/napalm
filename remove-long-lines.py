import os
import glob

def remove_empty_content_files():
    """Remove ASCII art files where every line after line 3 (metadata) is empty."""
    
    napalm_dir = "/home/jet/Documents/napalm/public/napalm"
    
    if not os.path.exists(napalm_dir):
        print(f"Error: Directory {napalm_dir} does not exist")
        return
    
    print(f"Scanning files in {napalm_dir} for files with empty content after metadata...")
    
    # Get all .tdf.txt files
    pattern = os.path.join(napalm_dir, "*.tdf.txt")
    files = glob.glob(pattern)
    
    removed_count = 0
    
    for file_path in files:
        filename = os.path.basename(file_path)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Skip first 4 lines (metadata) and check the rest
            content_lines = lines[4:] if len(lines) > 4 else []
            
            # Check if all content lines are empty (after stripping whitespace)
            all_empty = all(not line.strip() for line in content_lines)
            
            if all_empty:
                print(f"Removing {filename} (all content lines are empty)")
                os.remove(file_path)
                removed_count += 1
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    
    print(f"Removed {removed_count} files with empty content")
    
    # Count remaining files
    remaining_files = glob.glob(pattern)
    print(f"Remaining files: {len(remaining_files)}")

if __name__ == "__main__":
    remove_empty_content_files()
