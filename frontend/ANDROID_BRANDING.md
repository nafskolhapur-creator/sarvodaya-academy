# Android Branding Update

Use Android Studio to regenerate the app launcher icon for `com.sarvodaya.nafs`.

## Source asset

- Keep a square logo master, ideally `1024x1024`
- Prefer transparent PNG for best adaptive icon results

## Native Android icon folders

Android launcher icons live under:

- `frontend/android/app/src/main/res/mipmap-mdpi`
- `frontend/android/app/src/main/res/mipmap-hdpi`
- `frontend/android/app/src/main/res/mipmap-xhdpi`
- `frontend/android/app/src/main/res/mipmap-xxhdpi`
- `frontend/android/app/src/main/res/mipmap-xxxhdpi`
- `frontend/android/app/src/main/res/mipmap-anydpi-v26`

## Recommended workflow

1. Open `E:\nafsapp\frontend\android` in Android Studio
2. Right click `app`
3. Select `New > Image Asset`
4. Choose the final institute logo
5. Generate launcher and round/adaptive icons
6. Rebuild the Android app

## Rebuild commands

```powershell
cd E:\nafsapp\frontend
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```
