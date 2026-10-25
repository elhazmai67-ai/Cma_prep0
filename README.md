# CMA Prep — Purple Planner Upgrade v2.0.1

Apni raat ko kal ka plan tayyar karo: goal, morning note, apne subjects/chapters aur exact time ke study blocks. Ye pehle diye gaye CMA-Prep-Android-v1 project ka upgrade hai.

## v2.0.1 button fix

Plan tomorrow mein Add study block aur subject/chapter rename ka submit issue fix kiya hai. A hidden input called `id` could shadow the form ID in a browser, so its handler never ran. The handlers now read the actual HTML ID attribute. Required-title and overlap errors are shown clearly; a failed device-storage write keeps the form open and rolls back the unsaved change.

The existing app ID, signing certificate, storage key and saved data schema are unchanged. Update the app over your current installation; do not uninstall or clear its data. The demo reloads the fixed scripts with versioned asset URLs.

## Is update mein kya hai

- **Home → Plan tomorrow:** kal ka goal aur morning note likho; notes automatically save hote hain.
- **Add task:** study, lecture, revision ya practice choose karo. Date, subject, chapter/lecture, start time, duration aur optional note khud set karo.
- Blocks edit/delete kar sakte ho. Overlapping timings par error aata hai; existing block overwrite nahi hota. Completed block edit karne se pehle use reopen karo.
- **Mark plan ready:** agle din wahi plan Home par dikhega. Today/Tomorrow buttons aur date picker se purane/future plans khol sakte ho.
- **Suggest lecture sessions** sirf button dabane par free time mein unfinished lecture blocks add karta hai. Tumhare existing blocks apni jagah rehte hain. Daily availability aur suggested block length khud set kar sakte ho.
- **Subjects → Add subject / Edit subject / Chapters:** apne subjects aur chapters add, rename aur delete karo. Rename se saved progress/notes rehte hain. Delete confirmation batata hai kya remove hoga.
- Purple theme in light/dark mode; reference ke style mein white CMA, check aur underline wala purple logo.
- Existing per-lecture duration, custom Pomodoro, daily study time, weekly progress, revisions, calendar export, sample MCQ practice, timed tests aur JSON backup/restore retained hain.

## Purane data ke saath update kaise karna hai

1. **Current app → Settings → Backup & restore → Save/share backup** se JSON backup phone ya Drive mein save karo.
2. ZIP extract karo. Apni existing GitHub repository mein project files ko unke same paths par upload/replace karo. Neeche folder list di hai.
3. `signing/cma-dev.p12.base64` ko isi project ke version ke saath rakho. Ye v1 wala hi certificate hai. App ID, `androidScheme`, hostname aur storage key change mat karo.
4. Changes `main` par commit karo. **Actions → Build CMA Prep Android APK** mein latest commit ka run kholo; zarurat par **Run workflow → main** dabao.
5. Green tick ke baad **Artifacts → CMA-Prep-Android-v2.0.1-APK** download karo. Artifact ZIP extract karke `app-debug.apk` kholo.
6. **Existing app ke upar Update** install karo. Purana app uninstall ya uska data clear mat karo.
7. Pehle apne subjects, completed lectures aur notes check karo. Phir Home → **Plan tomorrow** kholo.

Agar phone `App not installed`, signature mismatch, downgrade, ya Update ke badle alag installation dikhaye: **uninstall mat karna**. Error ka screenshot aur installed version details ke saath compatibility check karwao. Ye package v1 ke `com.arbaz.cmaprep.studio` app ke liye hai. Pehla bahut purana starter `com.arbaz.cmaprep` ek alag app tha; use is package ka direct update nahi maana ja sakta.

## GitHub folder list

ZIP ke andar ke project files repository ke root mein hone chahiye. ZIP ko akela upload karke APK nahi banta.

| Repository mein jagah | Upload/replace |
|---|---|
| Main/root | `package.json`, `capacitor.config.json`, `README.md`, `.gitignore` |
| `www/` | Is folder ki saari HTML, CSS aur JS files — naye `planner.js`, `manage.js`, `upgrade-guard.js`, `purple.css` bhi |
| `www/assets/` | Naya `cma-logo.png` |
| `scripts/` | Saari 4 `.mjs` files |
| `signing/` | `cma-dev.p12.base64` |
| `.github/workflows/` | Naya `build-apk.yml` |

Phone par **same paths** par files upload karo. `.github` hidden ho to File Manager mein Show hidden files on karo. Workflow nahi dikhe to GitHub main page → Add file → Create new file → `.github/workflows/build-apk.yml`, aur ZIP ki us file ka poora code paste karo. Workflow sabse last mein update karna aasaan rahega.

Logo ka exact path **`www/assets/cma-logo.png`** hai. Folder spelling `assets` hai. Purani green logo file ko isi naam se nayi purple file replace karegi.

## Data preservation ka implementation

- v1 aur v2 app ID: `com.arbaz.cmaprep.studio`.
- Same bundled web origin: `https://localhost` (same Capacitor `androidScheme`, unchanged default hostname).
- Same native state key: `cma-prep-android-v1`. Website key `cma-prep-studio-demo-v1` bhi same hai.
- Same v1 development signing certificate, SHA-256: `be12b2348b99dcbd0c986c654f6a535c65d0dac01b5a9b4ed8f4e21865a33998`.
- New versionCode: `201000 + GitHub run number`; versionName: `2.0.1.<run number>`.
- Existing subjects, chapters, notes, dates, tests, archived groups, task IDs, planner blocks and focus records are reused. New day notes/readiness fields are additive. Navigation no longer rebuilds or reschedules saved blocks.
- Before the first v2 write, the existing JSON state is copied once to `<existing-key>-before-upgrade-2`. Settings → **Before this upgrade → Export** saves that copy. The copy is local to this device; export your own external backup as well.
- If the safety copy cannot be written or saved data cannot be parsed, original data is protected from overwrites and an export/recovery screen is shown.
- v1 JSON backups remain importable; v2 backups also contain the new goals, notes and readiness state. A separate pre-restore copy is retained when importing a backup.

This is a personal/testing APK with the same public development certificate used by v1. A Play Store release requires a private production signing setup. Do not change the signing key while updating this existing test installation.

## Verification

- 91 upgrade/data assertions plus 19 form-submit regression checks passed against the public demo files and separately against the actual packaged Android `www` files. The form tests now reproduce browser-style named input properties, including the original failed Add button.
- Checks covered v1 → v2 data preservation, old task retention across later dates, exact pre-upgrade copy, repeat reloads, storage failures, malformed-data protection, custom blocks, overlap rejection, rename/delete behavior, other-level isolation, next-day Home display, v1/v2 backup restore, running focus records, timed mocks and native backup routing.
- App ID, web origin and certificate bytes were compared with the original v1 project.
- JavaScript syntax and all referenced local assets were checked. Android resource XML, signing insertion and increasing version numbers were verified on a generated-project fixture.
- **A real APK compilation and phone installation were not performed in this workspace.** The local Java runtime was unavailable. GitHub Actions performs the actual build. Visual browser QA was also unavailable because the preview service was unavailable. Native sharing and launcher appearance need a phone check.

## Build locally

Use Node 22, Java 21 and the Capacitor 7 Android SDK environment.

```sh
npm install --no-audit --no-fund
npm run check
npm run build
npx cap add android
npx cap sync android
npm run configure:android
cd android
./gradlew assembleDebug --no-daemon
```

On a later local build, skip `cap add android` when the generated Android folder already exists. Build outputs, decoded signing store and dependencies are generated during the build and excluded from this ZIP.

## Limits retained from v1

Study data is local to the device/browser; there is no cloud account or automatic cross-device sync. Calendar alerts need importing the exported `.ics` file; there are no background push reminders. The 40 original practice questions are sample content, not a complete official exam bank. Course chapter outlines are editable samples. A study block completion does not count as focus-timer time; those remain separate measures.

## References

- https://developer.android.com/google/play/app-updates
- https://developer.android.com/studio/publish/app-signing
- https://capacitorjs.com/docs/v7/config
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts

Logo: generated from the user's screenshot reference using the built-in image tool. Brief: minimalist rounded purple square, white serif CMA, thin underline and a small check mark; no screenshot chrome or green annotation. Included at `www/assets/cma-logo.png`.
