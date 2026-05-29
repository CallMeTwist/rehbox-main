#!/bin/bash
# Re-encode all exercise videos from HEVC to H.264 (in place).
# Browsers (Firefox, older Chrome on Windows) don't support HEVC.

set -u
VIDEO_ROOT="apps/api/rehboxhealth/storage/app/public/exercises/videos"

total=0
converted=0
skipped=0
failed=0

while IFS= read -r f; do
  total=$((total + 1))
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$f" 2>/dev/null)

  if [ "$codec" = "h264" ]; then
    echo "[$total] SKIP (already h264): $f"
    skipped=$((skipped + 1))
    continue
  fi

  tmp="${f%.mp4}.h264.tmp.mp4"
  echo "[$total] CONVERT ($codec → h264): $f"

  if ffmpeg -nostdin -y -loglevel error -i "$f" \
      -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
      -c:a aac -b:a 128k \
      -movflags +faststart \
      "$tmp"; then
    mv -f "$tmp" "$f"
    converted=$((converted + 1))
  else
    echo "  FAILED: $f"
    rm -f "$tmp"
    failed=$((failed + 1))
  fi
done < <(find "$VIDEO_ROOT" -type f -name "*.mp4")

echo ""
echo "===== Summary ====="
echo "Total:     $total"
echo "Converted: $converted"
echo "Skipped:   $skipped"
echo "Failed:    $failed"
