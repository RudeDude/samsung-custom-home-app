# Quiet Launch

Quiet Launch is a signed Tizen web app in `apps/quiet-launch`. It is a calm
page for a few inputs and the apps already on the television, plus a picture
view. It does not replace `com.samsung.tv.quicklaunch`, and it does not change
Home (`com.samsung.tv.csfs`) or startup (`org.tizen.tv-viewer`).

The page is light, uses the television's own fonts, and moves focus with the
remote. The launcher background is a soft color gradient. Photos fill the
screen. Back on the launcher asks Samsung Home to open. The physical Home
button is not registered by this app.

## What you press

After a successful install, the app can be opened from Smart Hub, then Apps,
under the name **Quiet Launch**.

- Arrows move between the cards.
- OK opens the focused card.
- Back or Exit on the launcher returns to Samsung Home.
- Back or Exit while pictures are showing returns to Quiet Launch.
- Left and Right while pictures are showing step one picture.
- Up and Down while pictures are showing change how long each picture stays.
  Up makes the wait longer. Down makes it shorter.
- OK while pictures are showing switches that wait between seconds and minutes.
- While pictures are on screen, the page turns the television screensaver
  off and repeats that request once a minute. Closing the pictures, or
  leaving the app, turns the screensaver on again.
- The file name, the wait, and the key hint hide together after 10 seconds.
  Left, right, up, down, or OK shows that text again for 10 seconds.
  The HDMI line hides the same way.
- The first run waits 20 seconds. After that, the last choice is remembered
  on the television. Seconds move in steps of 5, from 5 to 300. Minutes move
  in steps of 1, from 1 to 60.

If the television shows a first-run or install confirmation, press OK on the
remote. Developer Mode stays as it is. You do not enter `12345` again unless
the computer's address on the television has changed.

HDMI 1 and HDMI 2 ask the television for that connected input and show it
full screen. Back returns to Quiet Launch. The page uses
`tizen.tvwindow`, which needs the public `tv.window` privilege. If a port
is not on the set, the status line says so. USB storage on the television
is not read by this app.

## Opening it from the remote

This widget cannot take the Home button. Home stays `com.samsung.tv.csfs`.
Startup stays `org.tizen.tv-viewer`. Do not point either value at Quiet Launch.

On a 2024 solar remote, the button that also opens the number pad can cycle
through Settings, the color-button pad, and SmartThings. Holding it is not a
slot this project can retarget. The SmartThings packages on this set are
system services, including the account and hub client. Replacing one of them
is not a quick-launch switch.

The quick path is the Home screen row:

1. Press Home.
2. Open Apps and highlight **Quiet Launch**.
3. Press and hold Select.
4. Choose **Add to Home**, move it where you want it, and press Select again.

After that, Home and one press of Select opens Quiet Launch. The same
press-and-hold menu can remove it from that row later. On the phone, the
SmartThings mobile remote has an edit grid under Sources and Apps. If Quiet
Launch is listed there, it can be added to that grid. That does not change
the television's Home button.

## Pictures

Two ways to show your own pictures. Neither one uses a Google account.

Packaged pictures are copied from `.local/photos` when the package is built.
That directory is gitignored. The television does not need a network path to
the computer for those files. Add or replace the image files, then build and
install again. Accepted suffixes are `.jpg`, `.jpeg`, `.png`, `.webp`, and
`.gif`.

A live list is served by `tools/photo_server.py` from the same directory.
The build records the server origin in the packaged copy of
`js/server.local.js`. The source file in `apps/quiet-launch` stays empty.
The server listens on one address, the route toward the television, port
8765. A browser open on that address shows the picture names.
`GET /` and `GET /index.html` are that page. `GET /manifest.json` is the
list Quiet Launch reads, and `GET /media/<file>` is one picture. Any other
path answers 404.

The host firewall drops new inbound connections. The television cannot reach
the live server until you allow that one path. Do not disable the firewall.
The public form of the rule uses a documentation address:

```bash
sudo ufw allow from 192.0.2.10 to any port 8765 proto tcp
```

The command for this set, with its real address, is in `.local/private.md`.
If you skip that rule, Photos still uses the pictures that were packaged.

The server is not left running. Start it from the repository root when you
want it:

```bash
TV_HOST=192.0.2.10 python3 tools/photo_server.py
```

On this computer, set `TV_HOST` from the television address in
`.local/private.md`.

The picture server sends each file unchanged. It does not resize or
re-encode. A 3840×2160 JPEG is still a 3840×2160 JPEG when the television
reads it, and an Ultra HDR JPEG keeps the gain map inside the file. Quiet
Launch shows that file in an `img` element, with no canvas redraw and no
extra scale animation, so the page does not flatten the file before the
television's browser decodes it.

Samsung's general specification says the web application resolution on a UHD
set is 1920×1080. The same table lists video at 3840×2160 on a 4K set. The
application surface is the 1920×1080 plane, and the panel scaler enlarges
it. Samsung's picture format list accepts a JPEG far larger than 4K, and it
does not list Ultra HDR. This page cannot move a still photograph onto the
4K video plane. AVPlay is the documented 4K path, and it plays video, not a
JPEG. The viewport is set to 1920 so the page fills that application surface
instead of being letterboxed.

## Package id warning

The package id in `apps/quiet-launch/config.xml` must be exactly 10
characters from `0-9`, `a-z`, and `A-Z`. The application id must be that
package id, a dot, and the project name: `qlaunch001.QuietHome`.

`qlaunch00` is 9 characters. On this television that widget does not install.
`tizen install` reports:

```text
app_id[qlaunch00.QuietHome] install failed[118, -4], reason: Operation not allowed : :Load archive info fail
```

`pkgcmd` reports the same text with an empty package id. The zip is valid.
A reboot does not change it. Signing with the Samsung certificate does not
change it. Setting the profile to `tv-samsung` does not change it. Copying
`device-profile.xml` to `/home/developer` does not change it. The same
project with the 10-character id `qlaunch001` installs.

Do not shorten the package id. Do not install a widget whose file name
contains a space. `tizen package` writes `Quiet Launch.wgt`. Copy it to
`quiet-launch.wgt` before `tizen install`.

## Build and sign

From the repository root. `tizen` is the project-local CLI under
`.local/tizen-studio/tools/ide/bin/tizen`. Certificates stay in `.local/certs`,
which git ignores. The profile file is
`.local/tizen-studio-data/profile/profiles.xml`, also gitignored. On this
computer `tizen cli-config` sets `profiles.path` to that file.

Package with a Samsung author certificate plus a Samsung distributor
certificate that lists this set. Create that certificate before packaging.
The libraries and Certificate Manager are in
[host-setup.md](host-setup.md). The wizard is in
[certificates.md](certificates.md). The public Tizen distributor certificate
is the wrong signer. With a 10-character package id it fails the certificate
check (`[118, -12]`). With the 9-character id above, install never reaches
that check. See the install section below.

The CLI profile named `quiet-launch` points at `.local/certs/author.p12` and
the SDK public distributor certificate `tizen-distributor-signer-new.p12`.
That profile is what signed the widget this television refused. On this
computer `.local/certs/author.p12` is no longer that SDK author certificate.
It is a byte-for-byte copy of the Samsung author certificate, and
`.local/certs/author.password` does not open it. The Samsung profile is a
second profile, named `quiet-launch-samsung`, and it is the active profile.
Its keys are in `.local/home/SamsungCertificate/quiet-launch-samsung/`,
which git ignores. Create it with the steps in
[certificates.md](certificates.md). Package new builds with
`-s quiet-launch-samsung`.

`192.0.2.20` stands in for the computer's address on the LAN.

```bash
python3 tools/build_quiet_launch.py --photo-base "http://192.0.2.20:8765"
.local/tizen-studio/tools/ide/bin/tizen package -t wgt -s quiet-launch-samsung \
  -o .local/build -- .local/build/quiet-launch
```

If packaging reports `Invaild password`, the profile file stored the
passwords in a form this CLI could not read back. Write the same author and
distributor passwords as plain text in the gitignored `profiles.xml` and
package again. Do not commit that file.

The widget to install is `.local/build/quiet-launch.wgt`. That copy is
gitignored. Keep the file name free of spaces.

## Install result on this television

Quiet Launch is installed as `qlaunch001.QuietHome`. Open it from Smart Hub,
then Apps. Home stayed `com.samsung.tv.csfs`. Startup stayed
`org.tizen.tv-viewer`. Developer Mode can stay on.

Samsung still documents a Smart TV web app as a `.wgt` widget. A consumer
set installs that file through Developer Mode and `tizen install`. Samsung's
application-install FAQ says a `.wgt` cannot be installed from USB. The USB
path is a `.tmg` from the Seller Office USB Demo Packaging Tool. This project
does not use that path. The docs do not say a 2024 or 2026 consumer set
rejects widgets. Other S90D and Tizen 9 sets still sideload `.wgt` files.

### What failed here

`sdb install` only copies the file. It exited 0 for the first widget and did
not install it.

The first package was signed with the SDK public distributor certificate
(profile `quiet-launch`: `.local/certs/author.p12` and
`tizen-distributor-signer-new.p12`). `pkgcmd -i -t wgt` stopped before it
assigned a package id:

```text
key[error] val[-4] error message: :Load archive info fail
processing result : Operation not allowed [-4] failed
```

The distributor password shipped with Tizen Studio for that public file is
`tizenpkcs12passfordsigner`. The older `tizen-distributor-signer.p12` expired
in 2022. The author password that opened the SDK author certificate is the
older line in `.local/certs/author.password`. That line does not open the
file at `.local/certs/author.p12` now, because that path holds a copy of the
Samsung author certificate. The bundled developer CA expires on 2027-01-01.
Do not package a television install with `-s quiet-launch`.
Samsung's developer forum says a Samsung television needs the Samsung
distributor certificate, and that a profile which also carries the Tizen
distributor certificate can refuse the sideload.

On 2026-11-07 the same app was signed with the Samsung profile
`quiet-launch-samsung` and installed with `tizen install`. The author
certificate is from Samsung VD Author CA. The distributor certificate is the
Samsung public developer certificate and its device list includes this set.
The command printed the app id and then the same failure:

```text
app_id[qlaunch00.QuietHome] install failed[118, -4], reason: Operation not allowed : :Load archive info fail
```

`/opt/usr/apps/qlaunch00` was not created. The staged widget was removed.
`unzip -t` on the television accepted the file, so the zip opens. A full
remote reboot left Developer Mode on, and `tizen install` of the same widget
failed again with `[118, -4]`. A copy of `device-profile.xml` at
`/home/developer/device-profile.xml` (the Device Manager **Permit to install
applications** step) did not change the result.

The installer stopped while loading the archive, before it reported a
certificate result. The app id in the `tizen install` line is the id the
host sent. `pkgcmd` itself reported an empty package id.

On this firmware, `libpkgmgr-extension.so` is the library that contains the
text "archive info", and it only implements `TpkArchiveInfo` and
`TmkArchiveInfo`. There is no widget archive loader in that library.
`/usr/bin/wgt-backend` is installed and was not given the request. Running
`wascmd` by hand as root prints `wascmd cannot working in released image`.
`tizen install` still invokes `wascmd`, and that invocation is what printed
`[118, -4]`.

### What the widget already contains

Tizen's web package rules require a zip named `.wgt` with `config.xml` at
the root, an icon, a content page (default `index.html`),
`author-signature.xml`, and `signature1.xml`. Samsung's configuration guide
requires an application id, version `x.y.z`, an API `required_version`, a
title, a screen-size feature, privileges declared before use, an icon path,
and a content path. `required_version="2.3"` is the value Samsung documents
for sets sold since 2015. Importing a project as TV 5.0 does not change that
value. This package has those files. No extra file in the guides is
documented as the fix for this message.

### Differences from a Samsung TV project

These are real, and they are the reason later packages change one field at
a time. They are not what this error text is documented to mean. A config
rejection arrives as parsing error `[118, -19]`. A certificate rejection
arrives as `[118, -12]`. A partner privilege on a Public certificate arrives
later as `MISMATCHED_PRIVILEGE_LEVEL` or `118019`. None of those appeared.

- Tizen's configuration editor says the package id is 10 characters from
  `0-9`, `a-z`, and `A-Z`, generated by Tizen Studio. The application id is
  `{package}.{name}`. `qlaunch00` is 9 characters. Store apps on this set use
  10-character package ids.
- Samsung's WebAssembly sample sets `<tizen:profile name="tv-samsung"/>`.
  This package says `tv`. The Samsung TV Extension is not installed on this
  computer. That extension is a host SDK. It does not add a file inside the
  widget.
- `http://tizen.org/privilege/application.launch` is partner level.
  `internet` and `tv.inputdevice` are public, which matches this Public
  Samsung certificate. Photos do not need the partner privilege.
- A package id that does not match the author-certificate alias is reported
  as `Author certificate not match`. This install did not report that.
- Keep the `.wgt` file name free of spaces. `tizen package` writes
  `Quiet Launch.wgt`. Copy it to a name without spaces before install.

### Other codes, so the next failure is not read as this one

| Result | Where it stops | What people change |
|---|---|---|
| `[118, -4]` `Load archive info fail`, empty package id | Before unzip progress and before the certificate | Reboot once. Then the archive is not being recognized. |
| `[-4]` with a package id and an install percent | After the archive is identified | Lower the API version in the manifest. This is a different `-4`. |
| `[118, -12]` | Certificate check. Details include chain `-3`, device not registered `-30`, untrusted certificate `-32` | Samsung distributor certificate that lists this set, then permit install. |
| `[118, -19]` Parsing error | `config.xml` | Remove undeclared elements. `required_version` above the set's platform is one cause. |
| `[-23]` Unzip error | Opening the zip | Rebuild the `.wgt`. Out of disk space is the other `-23` text. |
| `118019` or `MISMATCHED_PRIVILEGE_LEVEL` | After the signature | Drop the partner privilege or use a Partner certificate. |
| `Author certificate not match` | Signature identity | Package id and the author certificate have to agree. |

The flutter-tizen install notes are the source for the two different `-4`
cases and for `-12` and `-23`. Their only listed remedy for `Load archive
info fail` is a reboot, which this set already had.

### What changed the result

On 2026-11-07 the same project was packaged five ways and each file was
installed on its own. The source `config.xml` now uses the package id that
installed. It is 10 characters: `qlaunch001`.

| Package | Profile | Signature | `application.launch` | Result |
|---|---|---|---|---|
| `qlaunch001` | `tv` | Samsung author and Samsung distributor | declared | Installed. This is the copy left on the set. |
| `qlaunch00` | `tv-samsung` | Samsung author and Samsung distributor | declared | Same `[118, -4]` `Load archive info fail` |
| `qlaunch002` | `tv-samsung` | Samsung author and Samsung distributor | declared | Installed, then removed |
| `qlaunch003` | `tv-samsung` | Samsung author and Samsung distributor | removed | Installed, then removed |
| `qlaunch004` | `tv` | Samsung author and the Tizen public distributor | declared | `[118, -12]` invalid certificate chain `<-3>` |

The 9-character package id is what produced `Load archive info fail`.
Changing the profile to `tv-samsung` did not make that id install. With a
10-character id, both `tv` and `tv-samsung` installed, and so did a package
that omitted the partner privilege. The Tizen public distributor certificate
got past archive loading and then failed the certificate check. `tizen
uninstall` from the host reported that the extra packages did not exist.
`pkgcmd -u -n <package id> --global` removed `qlaunch002` and `qlaunch003`.
`qlaunch001` was left installed. The owner then removed every Quiet Launch
icon from the remote. One later install of `.local/build/quiet-launch.wgt`
put `qlaunch001` back alone.

After a Samsung signature is installed, open the app from Smart Hub, then
Apps, under **Quiet Launch**. A first-run confirmation, if the television
shows one, is OK on the remote. To open it from the computer without making
it Home:

```bash
TV_HOST=192.0.2.10 XDG_CACHE_HOME=.local/cache \
  ./samsung-tv-tools/tools/tv_access/tv-access \
  'app_launcher -u 5001 -s qlaunch001.QuietHome'
```

Run that only after `sdb kill-server`. The television accepts one SDB client.

`application.launch` is a partner privilege. A Public Samsung certificate may
install the page and still refuse to open YouTube, Netflix, and the other
cards. Photos and the page itself do not need that privilege. Samsung Home
remains the Home app either way.
