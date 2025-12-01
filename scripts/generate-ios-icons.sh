#!/bin/bash

# Generate iOS App Icons using sips (built-in macOS tool)
# Creates a simple colored icon as placeholder

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ICON_DIR="$SCRIPT_DIR/../ios/NativeBridgeApp/Images.xcassets/AppIcon.appiconset"

echo "🎨 Generating iOS App Icons..."

# Create a base 1024x1024 icon using sips and ImageMagick alternative
# Since we may not have ImageMagick, we'll use Python with PIL
python3 - <<'PYTHON_SCRIPT'
from PIL import Image, ImageDraw, ImageFont
import os

# Create output directory
icon_dir = os.path.expanduser("$ICON_DIR")
os.makedirs(icon_dir, exist_ok=True)

# Create a simple gradient icon with "NB" text
def create_icon(size, filename):
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#4A90E2')
    draw = ImageDraw.Draw(img)

    # Draw gradient effect (simple version)
    for y in range(size):
        r = int(74 + (106 - 74) * y / size)
        g = int(144 + (90 - 144) * y / size)
        b = int(226 + (205 - 226) * y / size)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    # Add "NB" text
    try:
        # Try to use a system font
        font_size = int(size * 0.4)
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            font = ImageFont.load_default()

        text = "NB"
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Center text
        x = (size - text_width) / 2
        y = (size - text_height) / 2 - bbox[1]

        # Draw white text with shadow
        draw.text((x+2, y+2), text, fill='#000000', font=font)
        draw.text((x, y), text, fill='#FFFFFF', font=font)
    except Exception as e:
        print(f"Warning: Could not add text: {e}")

    # Save image
    output_path = os.path.join(icon_dir, filename)
    img.save(output_path, 'PNG')
    print(f"✅ Created {filename} ({size}x{size})")

# Create all required icon sizes
icon_sizes = [
    (40, "Icon-20@2x.png"),      # 20pt @2x
    (60, "Icon-20@3x.png"),      # 20pt @3x
    (58, "Icon-29@2x.png"),      # 29pt @2x
    (87, "Icon-29@3x.png"),      # 29pt @3x
    (80, "Icon-40@2x.png"),      # 40pt @2x
    (120, "Icon-40@3x.png"),     # 40pt @3x
    (120, "Icon-60@2x.png"),     # 60pt @2x
    (180, "Icon-60@3x.png"),     # 60pt @3x
    (1024, "Icon-1024.png"),     # App Store
]

for size, filename in icon_sizes:
    create_icon(size, filename)

print("\n✅ All icons generated successfully!")
PYTHON_SCRIPT

# Update Contents.json with icon filenames
cat > "$ICON_DIR/Contents.json" <<'JSON'
{
  "images" : [
    {
      "filename" : "Icon-20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "Icon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "Icon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "Icon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "Icon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "Icon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "Icon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "Icon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "Icon-1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
JSON

echo "✅ Updated Contents.json with icon references"
echo ""
echo "📱 Icons generated at: $ICON_DIR"
echo "🔨 Run 'pod install' and rebuild the iOS app to include the icons"
