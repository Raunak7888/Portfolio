#!/usr/bin/env bash

# Output file
OUTPUT_FILE="codebase.txt"

# Clear/create the output file
> "$OUTPUT_FILE"

echo "Generating codebase compilation in $OUTPUT_FILE..."

# Base directory and structural exclusions
FIND_ARGS=(
    .
    -type f
    -not -path '*/.*'
    -not -path './node_modules/*'
    -not -path './.next/*'
)

# Strict extension inclusions: Only match .ts, .tsx, or .json
EXTENSION_ARGS=(
    \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \)
)

# Find all files matching criteria
find "${FIND_ARGS[@]}" "${EXTENSION_ARGS[@]}" | while read -r file; do
    echo "Processing: $file"
    {
        echo "========================================================================"
        echo "FILEPATH: $file"
        echo "========================================================================"
        cat "$file"
        printf "\n\n"
    } >> "$OUTPUT_FILE"
done

echo "Done! Saved to: $OUTPUT_FILE"