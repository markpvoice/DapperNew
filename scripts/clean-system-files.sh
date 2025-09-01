#!/bin/bash
# Clean system files that corrupt Playwright tests

echo "🧹 Cleaning macOS system files..."

# Remove all ._* files (resource forks)
find . -name "._*" -type f -delete

# Remove .DS_Store files  
find . -name ".DS_Store" -type f -delete

echo "✅ System files cleaned"