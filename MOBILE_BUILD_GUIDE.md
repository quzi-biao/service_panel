# 📱 移动端应用打包指南

本指南将帮助你将服务面板打包成 iOS 和 Android 移动应用。

## 📋 前置要求

### 通用要求
- Node.js 16+ 
- npm 或 yarn

### iOS 打包要求
- macOS 系统
- Xcode 14+
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer 账号（用于发布）

### Android 打包要求
- Android Studio
- Java JDK 11+
- Android SDK

## 🚀 快速开始

### 1. 安装 Capacitor 依赖

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### 2. 初始化 Capacitor（首次）

```bash
npm run cap:init
```

### 3. 添加平台

#### 添加 iOS 平台
```bash
npm run cap:add:ios
```

#### 添加 Android 平台
```bash
npm run cap:add:android
```

### 4. 构建并同步

```bash
npm run mobile:build
```

这个命令会：
1. 构建 Next.js 静态导出版本
2. 将构建产物同步到 iOS 和 Android 项目

## 📱 iOS 打包

### 开发调试

1. 打开 Xcode 项目：
```bash
npm run cap:open:ios
```

2. 在 Xcode 中：
   - 选择开发团队（Signing & Capabilities）
   - 选择模拟器或真机
   - 点击运行按钮 ▶️

### 发布到 App Store

1. 在 Xcode 中配置：
   - Product > Archive
   - 选择归档版本
   - Distribute App
   - 选择 App Store Connect
   - 上传到 App Store

2. 在 App Store Connect 中：
   - 填写应用信息
   - 上传截图
   - 提交审核

## 🤖 Android 打包

### 开发调试

1. 打开 Android Studio 项目：
```bash
npm run cap:open:android
```

2. 在 Android Studio 中：
   - 等待 Gradle 同步完成
   - 选择模拟器或真机
   - 点击运行按钮 ▶️

### 生成 APK（测试版）

1. 在 Android Studio 中：
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - 等待构建完成
   - APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### 生成签名 APK（发布版）

1. 创建签名密钥：
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. 在 `android/app/build.gradle` 中配置签名：
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

3. 构建发布版 APK：
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - 选择 Release 变体

### 发布到 Google Play

1. 生成 AAB（Android App Bundle）：
   - Build > Build Bundle(s) / APK(s) > Build Bundle(s)
   - AAB 位置：`android/app/build/outputs/bundle/release/app-release.aab`

2. 上传到 Google Play Console：
   - 创建应用
   - 填写应用信息
   - 上传 AAB 文件
   - 提交审核

## 🔄 更新应用

每次修改代码后，需要重新构建并同步：

```bash
npm run mobile:build
```

然后在 Xcode 或 Android Studio 中重新运行应用。

## 🛠️ 常用命令

| 命令 | 说明 |
|------|------|
| `npm run build:mobile` | 构建移动端静态文件 |
| `npm run cap:sync` | 同步到原生项目 |
| `npm run mobile:build` | 构建并同步（推荐） |
| `npm run cap:open:ios` | 打开 iOS 项目 |
| `npm run cap:open:android` | 打开 Android 项目 |

## 📝 注意事项

### API 地址配置

由于移动端应用运行在设备上，需要确保 API 地址可访问：

1. 开发环境：使用局域网 IP 或 ngrok
2. 生产环境：使用公网域名

### 权限配置

如果应用需要特殊权限（相机、位置等），需要在原生项目中配置：

- **iOS**: 编辑 `ios/App/App/Info.plist`
- **Android**: 编辑 `android/app/src/main/AndroidManifest.xml`

### 图标和启动画面

1. 准备图标（1024x1024 PNG）
2. 使用工具生成各尺寸：
   - iOS: [App Icon Generator](https://appicon.co/)
   - Android: Android Studio > Image Asset

3. 替换原生项目中的图标文件

## 🐛 常见问题

### Q: 构建失败，提示 "output: export" 错误
A: 确保运行 `npm run build:mobile` 而不是 `npm run build`

### Q: iOS 真机调试失败
A: 检查开发者证书和 Provisioning Profile 配置

### Q: Android 构建很慢
A: 首次构建会下载依赖，后续会快很多

### Q: 应用无法连接 API
A: 检查 API 地址是否可从移动设备访问

## 📚 更多资源

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [iOS 发布指南](https://developer.apple.com/app-store/submissions/)
- [Android 发布指南](https://developer.android.com/studio/publish)

## 🎉 完成

按照以上步骤，你就可以将服务面板打包成 iOS 和 Android 应用了！
