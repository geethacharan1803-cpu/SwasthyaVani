# SwasthyaVani Android Application

This directory contains the native Android wrapper project for SwasthyaVani, built using Capacitor. It packages the identical client-side progressive web application (`frontend/dist`) into an Android package without requiring any cloud server or runtime network connection.

---

## Current Status

* **Wrapper Technology**: Capacitor Android (targets Android API 35 / Android 15, minimum SDK 24 / Android 7.0 Nougat).
* **Build Verification**: **Built successfully locally with Gradle 8.14.3 and JDK 21**. (Status: *built but not tested on a physical device or emulator*, as no active hardware device or emulator was attached during compilation).
* **Package Output**: `android/app/build/outputs/apk/debug/app-debug.apk` (~4.2 MB).
* **Source Parity**: Web assets packaged in the APK are generated directly from `frontend/` using `npm run build:android` and are identical to the web release.

---

## Prerequisites and Local Toolchain

To compile the Android APK locally, ensure the following tools are installed:
1. **Node.js**: v20+ or v22+ (tested with v24.14.0).
2. **Java Development Kit (JDK)**: JDK 21 LTS (Oracle JDK or Eclipse Temurin).
3. **Android SDK**:
   * Command-line Tools / SDK Platforms: `android-35` (Android 15)
   * Build Tools: `35.0.0`
4. **Environment Variables**:
   * `JAVA_HOME`: Path to JDK directory (e.g., `C:\Program Files\Java\jdk-21.0.12` or `/usr/lib/jvm/java-21-openjdk`).
   * `ANDROID_HOME`: Path to Android SDK (e.g., `%LOCALAPPDATA%\Android\Sdk` or `~/Android/Sdk`).

---

## Step-by-Step Build Instructions

### 1. Build and Synchronize Web Assets
From the project root:
```bash
cd frontend
npm ci
npm run build:android
```
This builds the production bundle into `frontend/dist` and automatically synchronizes all HTML, JavaScript, CSS, and static pre-indexed JSON files into `android/app/src/main/assets/public/`.

### 2. Configure SDK Location (Local Only)
Create `android/local.properties` (never committed to git):
```properties
# Windows example:
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk

# Linux / macOS example:
# sdk.dir=/home/YOUR_USERNAME/Android/Sdk
```

### 3. Build Debug APK with Gradle
From the `android/` directory:
```bash
# On Windows PowerShell:
cd ../android
.\gradlew.bat assembleDebug

# On Linux / macOS:
cd ../android
chmod +x gradlew
./gradlew assembleDebug
```

The compiled APK will be created at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Opening in Android Studio

1. Launch **Android Studio**.
2. Select **Open** and choose the `android/` directory (`swasthyavani/android`).
3. Allow Gradle to sync dependencies.
4. Select a connected device or an Android Virtual Device (AVD with API 33+) from the target device dropdown.
5. Click **Run** (`Shift + F10`) or select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## Permissions and Offline Execution

The Android wrapper requests only essential frontline permissions:
* `android.permission.INTERNET`: Used only for real-time speech recognition (Web Speech API) and simulated synchronization when online.
* `android.permission.RECORD_AUDIO`: Used for voice querying by field workers.
* `android.permission.MODIFY_AUDIO_SETTINGS`: Used for clear speech synthesis audio playback.

The application functions completely offline without an internet connection for all protocol search, escalation triage, and visit planning features.
