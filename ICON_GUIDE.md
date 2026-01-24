# 应用图标设计指南

## 📱 图标设计

已为"服务面板"应用创建了一个现代化的图标设计，采用：

- **主色调**: Indigo (#6366f1 → #4f46e5) 渐变
- **设计元素**: 仪表盘/面板网格布局
- **风格**: 扁平化、现代、简洁

图标展示了一个包含多个卡片/模块的面板界面，符合应用的开发工具定位。

## 🛠️ 生成图标步骤

### 方法 1: 使用自动脚本（推荐）

1. **安装 ImageMagick**（如果未安装）:
   ```bash
   brew install imagemagick
   ```

2. **运行生成脚本**:
   ```bash
   ./scripts/generate-icon.sh
   ```

3. **查看生成的图标**:
   ```bash
   open public/icon.icns
   ```

### 方法 2: 在线转换

如果不想安装 ImageMagick，可以使用在线工具：

1. 打开 `public/icon.svg` 文件
2. 访问 https://cloudconvert.com/svg-to-icns 或 https://anyconv.com/svg-to-icns-converter/
3. 上传 SVG 文件并转换为 .icns
4. 下载并保存到 `public/icon.icns`

### 方法 3: 使用 macOS 预览应用

1. 用 Safari 或 Chrome 打开 `public/icon.svg`
2. 截图或导出为 PNG (1024x1024)
3. 使用在线工具转换 PNG 到 .icns

## 📦 更新构建配置

图标已配置在 `electron/main.js` 中：
```javascript
icon: path.join(__dirname, '../public/icon.png')
```

对于 macOS 应用打包，electron-builder 会自动使用 `public/icon.icns`。

## 🔄 重新构建应用

生成图标后，重新构建应用：

```bash
npm run electron:build
```

新的图标将应用到打包后的 macOS 应用中。

## 🎨 自定义图标

如果想修改图标设计，编辑 `public/icon.svg` 文件：

- 修改颜色: 更改 `<linearGradient>` 中的 `stop-color`
- 调整布局: 修改 `<rect>` 和 `<circle>` 元素的位置和大小
- 改变圆角: 调整 `rx` 属性值

修改后重新运行生成脚本即可。

## 📐 图标尺寸要求

macOS .icns 文件包含以下尺寸：
- 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
- 每个尺寸都有 @1x 和 @2x 版本（除了 1024x1024）

脚本会自动生成所有需要的尺寸。
