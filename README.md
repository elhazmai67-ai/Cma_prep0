# CMA Prep — Android v1

Offline study app with the green CMA logo, subject add/delete, daily study planning, course setup, sample practice questions, revisions, backup/restore and Pomodoro.

## GitHub se APK banane ke steps

1. Is ZIP ko **extract** karo. GitHub ZIP ko khud app mein convert nahi karta: andar ke project files upload karne hain.
2. GitHub par apna `cma-prep-android` repository kholo, ya naya repository banao. `package.json` aur `capacitor.config.json` repository ke **root** mein hone chahiye; poora `CMA-Prep-Android-v1` outer folder upload mat karo.
3. Is folder ke andar ke files/folders ko **same paths** ke saath upload/replace karo: `www/`, `scripts/`, `signing/`, `.github/workflows/build-apk.yml`, `package.json`, `capacitor.config.json`, `.gitignore` aur `README.md`. Existing starter ke `www/index.html`, `package.json`, config aur workflow ko naye versions se replace karo.
4. `.github` folder hidden ho sakta hai. File manager mein **Show hidden files** on karo. Agar workflow upload na ho, GitHub → **Add file → Create new file** mein naam `.github/workflows/build-apk.yml` likho aur ZIP ki usi file ka poora content paste karo. Bina workflow ke Actions se APK nahi banega.
5. Changes **main** branch par commit karo. GitHub → **Actions → Build CMA Prep Android APK** kholo. Automatic run na aaye to **Run workflow** dabao. Disabled ho to Actions enable karo.
6. Green tick aane par completed run kholo. Neeche **Artifacts → CMA-Prep-Android-APK** download karo. Artifact download ke liye GitHub mein signed in rehna hoga.
7. Downloaded artifact ZIP extract karo. Uske andar **app-debug.apk** milega. Us par tap karke Android ke install steps follow karo; zarurat par file manager/browser ke liye “Install unknown apps” allow karo.
8. App kholo, **Inter/Final → Group → Attempt → Planning date** select karo. Sample chapter outlines edit kar sakte ho aur apne lectures/durations add kar sakte ho. Sab progress zero se shuru hota hai.

Phone browser agar folders flatten kar de, har file ke GitHub path ko sahi rakhna zaroori hai. Desktop browser ka folder upload iske liye aasaan hai. Sirf ZIP upload karne se workflow nahi chalega.

## Subject delete kahan milega?

- **Home → Your subjects → Manage → Delete**, ya
- **Lectures → subject select → Delete subject**, ya
- **Settings → Subjects → Manage**.

Confirmation mein subject ka naam aur data count dikhega. Confirm karne par uske lectures, notes, revisions, logged marks, planned blocks aur focus history delete hote hain. Doosre subjects ka data rehta hai. Mixed practice attempts se sirf us subject ke questions hatenge. Delete se pehle backup export kar sakte ho.

## Included features

- Daily timetable with study days, available minutes, lecture blocks and missed-day rescheduling.
- ICMAI Syllabus 2022 paper/group setup for Inter and Final, including Final electives. Chapter outlines are short, editable samples.
- 40 original sample MCQs across selected papers, timed short mocks, explanations and retrying mistakes. This is not a complete or official exam bank.
- Revision dates, notes, weak-topic suggestions and in-app reminders. Phone calendar alerts require importing an exported `.ics` file; background push notifications are not included.
- JSON backup and restore for both levels. On Android, **Save / share backup** opens the phone’s share sheet: choose a Files/Drive destination or another app, then complete saving there. To restore, choose the saved JSON file in Settings. Data from the web demo can be imported through this same backup flow.
- Individual lecture lengths in hours/minutes; configurable focus/short-break/long-break times.
- Focus tracking shows only daily study time and weekly progress. Breaks are excluded.
- Green CMA launcher/app logo, light/dark appearance and Android Back-button handling.

The app bundles its own screens and works offline after installation. Opening ICMAI source links uses the browser. There is no cloud sync or account. Export backups before clearing app data or uninstalling.

## Installation and future updates

This first version uses package ID `com.arbaz.cmaprep.studio`, so it can be installed alongside the old starter (`com.arbaz.cmaprep`). Existing data is not automatically copied from the old app. Your web demo data can be transferred with JSON export/import.

The project includes a **public development certificate**, solely to keep personal test APKs signed consistently across GitHub runs. Keep `signing/cma-dev.p12.base64` the same for future test updates. Build numbers increase with GitHub Actions run numbers. This is a debug/personal-testing APK; a Play Store release needs its own private production signing key and release preparation. The included certificate must not be used for a production release.

Artifact retention is 30 days. Download the APK while the artifact is available, or run the workflow again.

## Local developer commands

Requirements: Node 22, JDK 21, Android SDK compatible with Capacitor 7 (API 35). The GitHub workflow sets up Node and Java and uses the runner’s Android SDK.

```sh
npm install --no-audit --no-fund
npm run check
npm run build
npx cap add android
npx cap sync android
npm run configure:android
cd android
./gradlew assembleDebug
```

For subsequent local builds, omit `cap add android` if the generated `android/` folder already exists. The generated `native.js`, Android project and node_modules are intentionally excluded from this source ZIP. GitHub creates them during the build.

## Verification and limits

JavaScript syntax, app structure, subject-deletion cleanup, empty first-run state and web-app behavior were checked locally. Android configuration is applied to a generated-project fixture as a check. The existing core demo regression checks pass.

**A full APK compilation and on-device installation were not run in this workspace.** The Android SDK/JDK 21 build environment and npm access were unavailable here; the supplied GitHub workflow performs the real build. Native file sharing, launcher rendering and device notifications still require a phone test. Browser visual rendering was also unavailable.

## Primary documentation

- [Capacitor 7 Android](https://capacitorjs.com/docs/v7/android)
- [Capacitor 7 configuration](https://capacitorjs.com/docs/v7/config)
- [Native filesystem](https://capacitorjs.com/docs/v7/apis/filesystem) and [file sharing](https://capacitorjs.com/docs/v7/apis/share)
- [Downloading GitHub Actions artifacts](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)

Logo edit: built-in image generation edited the supplied purple CMA icon. Prompt: “Change only purple areas to forest green matching #173f35 / #1d6a50; preserve white CMA lettering, orange check, bevel, lighting and layout.” The final asset is `www/assets/cma-logo.png` and is used for the Android launcher as well as in-app branding.
