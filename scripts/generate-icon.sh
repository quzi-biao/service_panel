#!/bin/bash

# 生成 macOS 应用图标脚本
# 需要安装 imagemagick 和 iconutil (macOS 自带)

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SVG_FILE="$PROJECT_DIR/public/icon.svg"
ICONSET_DIR="$PROJECT_DIR/public/icon.iconset"
OUTPUT_ICNS="$PROJECT_DIR/public/icon.icns"

echo "🎨 生成 macOS 应用图标..."

# 检查 SVG 文件是否存在
if [ ! -f "$SVG_FILE" ]; then
    echo "❌ 错误: 找不到 icon.svg 文件"
    exit 1
fi

# 检查是否安装了必要的工具
if ! command -v convert &> /dev/null; then
    echo "❌ 错误: 未安装 ImageMagick"
    echo "请运行: brew install imagemagick"
    exit 1
fi

# 创建 iconset 目录
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

echo "📐 生成不同尺寸的图标..."

# 生成所有需要的尺寸
sizes=(16 32 64 128 256 512 1024)

for size in "${sizes[@]}"; do
    echo "  生成 ${size}x${size}..."
    convert -background none -resize "${size}x${size}" "$SVG_FILE" "$ICONSET_DIR/icon_${size}x${size}.png"
    
    # 生成 @2x 版本 (除了 1024)
    if [ $size -ne 1024 ]; then
        double=$((size * 2))
        echo "  生成 ${size}x${size}@2x (${double}x${double})..."
        convert -background none -resize "${double}x${double}" "$SVG_FILE" "$ICONSET_DIR/icon_${size}x${size}@2x.png"
    fi
done

echo "🔨 转换为 .icns 格式..."
iconutil -c icns "$ICONSET_DIR" -o "$OUTPUT_ICNS"

echo "🧹 清理临时文件..."
rm -rf "$ICONSET_DIR"

echo "✅ 图标生成完成: $OUTPUT_ICNS"
echo ""
echo "📝 下一步:"
echo "   1. 查看生成的图标: open $OUTPUT_ICNS"
echo "   2. 重新构建应用: npm run electron:build"
