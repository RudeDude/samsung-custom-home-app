# Quiet Launch

Quiet Launch is a signed Tizen web app in `apps/quiet-launch`. It is a calm
page for a few inputs and the apps already on the television, plus a picture
view. It does not replace `com.samsung.tv.quicklaunch`, and it does not change
Home (`com.samsung.tv.csfs`) or startup (`org.tizen.tv-viewer`).

The page is light, uses the television's own fonts, and moves focus with the
remote. Photos fill the screen and drift slightly so a still picture is not
left sitting on the panel. Back on the launcher asks Samsung Home to open.
The physical Home button is not registered by this app.

## What you press

After a successful install, the app can be opened from Smart Hub, then Apps,
under the name **Quiet Launch**.

- Arrows move between the cards.
- OK opens the focused card.
- Back or Exit on the launcher returns to Samsung Home.
- Back or Exit while pictures are showing returns to Quiet Launch.
- Left and Right while pictures are showing step one picture.
- Pictures also advance on their own every 20 seconds.

If the television shows a first-run or install confirmation, press OK on the
remote. Developer Mode stays as it is. You do not enter `12345` again unless
the computer's address on the television has changed.

HDMI cards ask the television to switch input. If that call is refused, use
the source button on the remote. USB storage on the television is not read
by this app.

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

## Build and sign

From the repository root. `tizen` is the project-local CLI under
`.local/tizen-studio/tools/ide/bin/tizen`. Certificates stay in `.local/certs`,
which git ignores. The profile file is
`.local/tizen-studio-data/profile/profiles.xml`, also gitignored. On this
computer `tizen cli-config` sets `profiles.path` to that file.

This television installs Quiet Launch only when the signature is a Samsung
author certificate plus a Samsung distributor certificate that lists this
set. Create that certificate before packaging. The libraries and Certificate
Manager are in [host-setup.md](host-setup.md). The wizard is in
[certificates.md](certificates.md).

The CLI profile named `quiet-launch` signs with the SDK public distributor
certificate. Certificate Manager shows that same profile on **App Signing**:
author `.local/certs/author.p12`, distributor `tizen-distributor-signer-new.p12`.
That is the signature this television refused. The Samsung profile is a
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

`sdb install` connected and pushed the widget, then returned success without
a package id. The app directory was not created. Installing the same file
with `pkgcmd -i -t wgt` stopped immediately:

```text
key[error] val[-4] error message: :Load archive info fail
processing result : Operation not allowed [-4] failed
```

No package id was assigned, and `installation-history.log` has no Quiet
Launch row. Home and startup were not changed. The pushed copy was removed
from the television.

The refused widget used `.local/certs/author.p12` and the SDK file
`tizen-distributor-signer-new.p12` (Tizen Studio Public Signer, valid through
2032). The older `tizen-distributor-signer.p12` in the same folder expired
in 2022. The distributor password shipped with Tizen Studio for the new file
is `tizenpkcs12passfordsigner`. The author password for that rejected
signature is only in `.local/certs/author.password`. The bundled developer CA
expires on 2027-01-01, so an author certificate from this SDK expires the
same day.

The signature this television accepts is a Samsung distributor certificate
whose device list includes this set. The Certificate Manager window and the
wizard are in [certificates.md](certificates.md). Addresses and the DUID stay
in `.local/`, which git ignores.

Until that certificate exists, Quiet Launch does not appear under Apps.
Nothing needs to be pressed on the remote for the refusal above. Developer
Mode can stay on.

After a Samsung signature is installed, open the app from Smart Hub, then
Apps, under **Quiet Launch**. A first-run confirmation, if the television
shows one, is OK on the remote. To open it from the computer without making
it Home:

```bash
TV_HOST=192.0.2.10 XDG_CACHE_HOME=.local/cache \
  ./samsung-tv-tools/tools/tv_access/tv-access \
  'app_launcher -u 5001 -s qlaunch00.QuietHome'
```

Run that only after `sdb kill-server`. The television accepts one SDB client.

`application.launch` is a partner privilege. A Public Samsung certificate may
install the page and still refuse to open YouTube, Netflix, and the other
cards. Photos and the page itself do not need that privilege. Samsung Home
remains the Home app either way.
