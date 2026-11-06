# Samsung custom home

Notes and steps for one television the owner controls: a Samsung 65-inch S90D,
warehouse SKU **S90DD**, model code **QN65S90DDFXZA**.

About This TV shows:

```text
T-PTMDAKUC-0090-2130.0, F03C2070, BT - S
```

The television reports firmware build `T-PTMDAKUC-0090-REL-202605141701`.
That is the same generation as the About line above. Serial numbers, MAC
addresses, and LAN addresses are not recorded in this repository.

This repository is MIT-licensed. See [LICENSE](LICENSE). The three upstream
checkouts keep their own licenses and are not committed here.

## What works so far

Developer Mode is on, and temporary root through `samsung-tv-tools` works.
`id -u` printed `0`. A read-only inventory then recorded Home as
`com.samsung.tv.csfs` and startup as `org.tizen.tv-viewer`. Those were not
changed. See [docs/inventory.md](docs/inventory.md).

| Field | Value |
|---|---|
| Tizen | 9.0.0 (Tizen9/TV) |
| Kernel | 5.4.249 |
| Architecture | armv7l |
| Helpers present | `/usr/bin/dotnet`, `/usr/sbin/sdbd-tarlauncher` |
| `samsung-tv-tools` list | This build is already listed for an S90D, root only |

Keys, screenshots, app cleanup, on-TV DNS blocking, and the
`samsung-tv-root archive-root` cross-check have not been run. Do not run
`tv-setup` on this build. It is unsupported there.

Quiet Launch is a separate web app in `apps/quiet-launch`. It does not
replace Samsung QuickLaunch and it does not change Home. See
[docs/quiet-launch.md](docs/quiet-launch.md).

The signing tools are installed on this computer. The Ubuntu libraries
`libkf5itemmodels5`, `libkf5kiowidgets5`, and `libkchart2` are present.
Certificate Manager 3.1.3 and the Samsung Certificate Extension
(`cert-add-on` 2.0.75) are under `.local/tizen-studio`. The Samsung
certificate is not created yet. Quiet Launch installs on this television
only after that certificate exists and its distributor list includes this
set. A package signed with the SDK public distributor certificate was
refused (`pkgcmd` error -4, no package id). The creation steps are in
[Create the Samsung certificate](#create-the-samsung-certificate) and in
[docs/certificates.md](docs/certificates.md). Addresses, the device id, and
passwords stay in `.local/`, which git ignores.

## Reproduce this work

Run the steps in order. Commands are written from the repository root.
`192.0.2.10` in the docs is a documentation address. Replace it with the
television's LAN address in your shell only.

1. [Clone the upstream checkouts](docs/checkouts.md).
2. [Install `sdb` inside this project](docs/host-setup.md). No system package
   and no change to your shell startup files.
3. [Turn on Developer Mode](docs/developer-mode.md). Focus **App Settings**,
   then enter `12345`.
4. [Run the first probe](docs/probe.md). This uses `tv-access` and does not
   use `sdb connect`.
5. [Read the inventory](docs/inventory.md). Read-only. No packages are removed
   and Home is not changed.
6. [Install the signing libraries and Certificate Manager](docs/host-setup.md).
   The commands are also in the next section. On this computer that install
   is already finished.
7. [Create the Samsung certificate](#create-the-samsung-certificate). This
   step is required before Quiet Launch can be installed. The same steps are
   in [docs/certificates.md](docs/certificates.md).
8. Build and install Quiet Launch only after that certificate exists. The
   picture server, when you want live pictures, is in
   [docs/quiet-launch.md](docs/quiet-launch.md). It is not left running.

Stop if the model or firmware build does not match the table above.

## Host packages for signing

Certificate Manager is a window. The full Eclipse Tizen Studio IDE is not
installed. These packages live in the project tree, under `.local/`, which
git ignores. Do not install Tizen Studio with apt, and do not put `sdb` on
`PATH`.

The package manager refuses to add Certificate Manager until three Ubuntu
libraries are present. Its check is named heaptrack. A dry run on this
Ubuntu 24.04 machine listed 69 new packages, mostly Qt 5 and KDE Frameworks
libraries. Leave the firewall enabled. Install the libraries in a normal
terminal, where you can type the sudo password:

```bash
sudo apt install libkf5itemmodels5 libkf5kiowidgets5 libkchart2
```

Then, from the repository root, install Certificate Manager and the Samsung
Certificate Extension into this project:

```bash
HOME="$(pwd)/.local/home" \
  .local/tizen-studio/package-manager/package-manager-cli.bin \
  install --accept-license --no-java-check Certificate-Manager,cert-add-on
```

`Certificate-Manager` 3.1.3 is the window. `cert-add-on` 2.0.75 is the
Samsung Certificate Extension. Do not pass a sudo password on that command
line. The launcher is:

```text
.local/tizen-studio/tools/certificate-manager/certificate-manager
```

Open it from the desktop session on this computer. An SSH-only shell will
not show the window. It uses the project JDK at
`.local/tizen-studio/jdk/bin/java`. The same run can recreate
`~/.package-manager`. Move that log back into the project as
[docs/host-setup.md](docs/host-setup.md) describes.

Installing these packages does not create a certificate.

## Create the Samsung certificate

This step is still required on this computer. You need a Samsung account you
can sign into in a browser. An account that is only signed in on the
television is a different login. Create the account during the wizard if you
do not have one.

The author certificate is permanent for this app. Every later update of
Quiet Launch has to be signed with the same author certificate. If a later
package is signed with a different author certificate, the television treats
it as a different application.

The device id to paste is the single line in `.local/certs/duid`. The
television address and the computer address are in `.local/private.md`. Do
not copy either file into a commit, an issue, or a screenshot.

1. Open Certificate Manager from the path above.
2. If a dialog titled **Migration for Certificate Profile** appears, click
   **Cancel**.
3. Click the **+** button.
4. Choose **Samsung**. Choose **TV**. Click **Next**.
5. Name the profile `quiet-launch`. Click **Next**.
6. Choose **Create a new author certificate**. Click **Next**.
7. Fill in the name and password the wizard asks for. Write the password as
   one line in `.local/certs/samsung-author.password` and run `chmod 600` on
   that file. Do not put the password in a tracked file or in chat.
8. The wizard opens a browser. Sign in to the Samsung account. That login
   stays with you.
9. When it asks for a backup folder, use `.local/certs/`. Click **Next**.
10. Choose **Create a new distributor certificate**. Click **Next**.
11. Set the privilege to **Public**. In the device list, paste the single
    line from `.local/certs/duid`. This 2024 set does not show that value
    under Support the way older sets do.
12. If the wizard asks for a distributor password, save it the same way in
    `.local/certs/samsung-distributor.password` with mode `0600`.
13. Click through and choose **Finish**.

Developer Mode can stay as it is. You do not enter `12345` again unless the
computer's address on the television has changed.

After **Finish**, confirm `author.p12` and `distributor.p12` in one of these
directories:

- `.local/home/SamsungCertificate/quiet-launch/`
- `~/SamsungCertificate/quiet-launch/`

The CLI profile already named `quiet-launch` still signs with the SDK public
distributor certificate. That is the signature this television refused.
After the Samsung files exist, point that profile at the Samsung `author.p12`
and `distributor.p12`. The command is in
[docs/certificates.md](docs/certificates.md). Keep the passwords in the files
above. Public privilege may install the page and still refuse cards that
open other apps. Photos and the page do not need that privilege.

Until this certificate exists, Quiet Launch does not appear under Apps.
Nothing needs to be pressed on the remote.

## What this project will not do

- Install Quiet Home or run `quiet-tizen/tools/tv.py`. That helper accepts
  only a 2025 U8000F on `T-KSU2EFAKUC-0090-1300.9`.
- Run `tv-setup` or copy an S90C cleanup profile onto this set.
- Install the on-TV DNS blocker. Filtering belongs on the home router.
- Run the QN90B or QN90F commands in `samsung-tv-root`, or build those payloads.
- Flash, downgrade, or replace firmware.
- Install Python on the television. The Python programs run on the computer.
- Put a Google Photos client or a Google account on the television. Pictures
  come from files on this computer, packaged into Quiet Launch or served on
  the LAN. The television's own USB storage is not read by this app.

Bluetooth game controllers are out of scope.

## Private log

The command log and raw command output stay in `.local/`, which git ignores.
`.local/command-log.md` is the review copy, including the real television
address. Do not commit it, and do not paste it into a public issue.

Tracked docs are the reproduction steps. The private log is the record of
what was actually typed on this machine.
