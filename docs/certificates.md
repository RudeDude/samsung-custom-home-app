# Samsung certificate for Quiet Launch

Quiet Launch was packaged and the television refused it. `pkgcmd` stopped
before it assigned a package id:

```text
key[error] val[-4] error message: :Load archive info fail
processing result : Operation not allowed [-4] failed
```

Home stayed `com.samsung.tv.csfs`. Startup stayed `org.tizen.tv-viewer`.
The public Tizen distributor certificate is not enough for this set. The
signature that works is a Samsung author certificate plus a Samsung
distributor certificate whose device list includes this television.

Addresses, the DUID, and the firewall command for this set live in
`.local/private.md`. That file is gitignored. The DUID itself is the single
line in `.local/certs/duid`. Do not copy either file into a commit, an issue,
or a screenshot.

`192.0.2.10` below is a documentation address. On this computer, use the
television address from `.local/private.md`.

## What is installed here

Tizen Studio, the Eclipse IDE, is a graphical application. It is not
installed on this computer. The project has the command-line slice under
`.local/tizen-studio`: `sdb`, the `tizen` packaging command, and the package
manager.

Certificate Manager and the Samsung Certificate Extension are separate
packages. Both are installed in this tree now. Package Manager lists
`Certificate-Manager` 3.1.3 and `cert-add-on` 2.0.75 (Samsung Certificate
Extension) with status installed. The window is:

```text
.local/tizen-studio/tools/certificate-manager/certificate-manager
```

The first attempt updated the command-line packages already in
`.local/tizen-studio`, then stopped before either certificate package was
unpacked. After that update:

| Command | What it printed |
|---|---|
| `.local/tizen-studio/tools/sdb version` | `Smart Development Bridge version 4.2.36` |
| `.local/tizen-studio/tools/ide/bin/tizen version` | `Tizen CLI 2.5.25` |
| `.local/tizen-studio/package-manager/package-manager-cli.bin` with no arguments | `Package Manager (0.5.67)` |

The 6.0 command-line installer had originally left `sdb` at 4.2.25. See
[host-setup.md](host-setup.md).

The installer stopped in its heaptrack prerequisite check. That check wants
three Ubuntu libraries, and from this session it could not ask for a sudo
password (`pkexec` had no terminal). Those libraries are installed on this
computer now. On a new machine, install them in a normal terminal, where you
can type the password. A dry run on this Ubuntu 24.04 machine listed 69 new
packages, mostly Qt 5 and KDE Frameworks libraries. Leave the firewall
enabled. Do not install Tizen Studio with apt.

```bash
sudo apt install libkf5itemmodels5 libkf5kiowidgets5 libkchart2
```

Then, from the repository root, install the two Tizen packages into this
project tree:

```bash
HOME="$(pwd)/.local/home" \
  .local/tizen-studio/package-manager/package-manager-cli.bin \
  install --accept-license --no-java-check Certificate-Manager,cert-add-on
```

`Certificate-Manager` is the window. `cert-add-on` is the Samsung Certificate
Extension. Do not pass a sudo password on that command line, and do not
store one in this repository.

The same run can recreate a real `~/.package-manager`. Move its log back
under `.local/home/.package-manager/install-log/` the way
[host-setup.md](host-setup.md) describes, then remove the home copy.

On this computer that second run finished. The launcher script is present,
and it starts the Eclipse binary beside it with the project JDK at
`.local/tizen-studio/jdk/bin/java` (OpenJDK 1.8.0_242). Open the launcher
from the desktop session on this computer. An SSH-only shell will not show
the window. Opening it creates a `workspace/` directory in the repository
root. That directory is Eclipse metadata for this window, and git ignores
it. The Samsung account sign-in in the next section is still yours to do.

The `HOME` override matches the original tool install. Certificate Manager
may still write the Samsung account files under the real home directory
`~/SamsungCertificate/`. The folder name is the profile name from the wizard,
`quiet-launch-samsung`.

## The profile already on screen

Certificate Manager opens on the **App Signing** tab with one profile,
`quiet-launch`. That row is the Tizen signature from the earlier packaging
attempt. It is the signature this television refused. Leave it. Do not edit
it, do not remove it, and do not install with it again.

You are looking at that old profile when both of these are true:

- The author path ends in `.local/certs/author.p12`.
- The distributor path ends in `tizen-distributor-signer-new.p12`.

The passwords on that row are already set. The GUI hides them.

| What the row shows | Where the password is |
|---|---|
| Author, `.local/certs/author.p12` | the one line in `.local/certs/author.password` |
| Distributor, `tizen-distributor-signer-new.p12` | the Tizen Studio public signer password recorded in [quiet-launch.md](quiet-launch.md) under the refused widget |

`.local/certs/samsung-author.password` and
`.local/certs/samsung-distributor.password` are not missing. They are
created only when the Samsung wizard below asks you to choose those
passwords. Until then the only password file in `.local/certs/` is
`author.password`, and `SamsungCertificate/` does not exist yet.

Developer Mode can stay on. Do not enter `12345` again unless the computer's
address on the television has changed. That address is the computer address
in `.local/private.md`. Nothing on the remote is required for this window.
The device id is already the single line in `.local/certs/duid`. Paste that
line when the wizard asks. Do not connect `sdb` from this step.

## Create the Samsung profile

You need a Samsung account you can sign into in a browser. An account that
is only signed in on the television is a different login. Create the account
during the wizard if you do not have one.

The author certificate is permanent for this app. Every later update of
Quiet Launch has to be signed with the same author certificate. If a later
package is signed with a different author certificate, the television treats
it as a different application.

Keep the existing `quiet-launch` row. Add a second profile. With Certificate
Manager still open:

1. If a dialog titled **Migration for Certificate Profile** appears, click
   **Cancel**.
2. On **App Signing**, click the **+** button. Do not click the existing
   `quiet-launch` row.
3. Choose **Samsung**. Choose **TV**. Click **Next**.
4. Name the profile `quiet-launch-samsung`. The name `quiet-launch` is
   already the refused Tizen profile. Click **Next**.
5. Choose **Create a new author certificate**. Click **Next**. Do not choose
   the existing `.local/certs/author.p12`.
6. Fill in the name and password the wizard asks for. Write that new
   password as one line in `.local/certs/samsung-author.password` and run
   `chmod 600` on that file. Do not put the password in a tracked file or in
   chat. Do not copy `author.password` over it.
7. The wizard opens a browser. Sign in to the Samsung account. That login
   stays with you.
8. When it asks for a backup folder, use `.local/certs/`. Click **Next**.
9. Choose **Create a new distributor certificate**. Click **Next**.
10. Set the privilege to **Public**. In the device list, paste the single
    line from `.local/certs/duid`. Leave extra blank rows empty. This 2024
    set does not show that value under Support the way older sets do.
11. If the wizard asks for a distributor password, save it the same way in
    `.local/certs/samsung-distributor.password` with mode `0600`.
12. Click through and choose **Finish**.

After **Finish**, **App Signing** lists two profiles. The new row's
distributor path is under a `SamsungCertificate/quiet-launch-samsung/`
directory, not `tizen-distributor-signer-new.p12`. The wizard writes that
directory in your real home folder, `~/SamsungCertificate/quiet-launch-samsung/`.
Move it into the project and remove the empty home directory:

```bash
mkdir -p .local/home/SamsungCertificate
mv ~/SamsungCertificate/quiet-launch-samsung .local/home/SamsungCertificate/
rmdir ~/SamsungCertificate
chmod 700 .local/home/SamsungCertificate .local/home/SamsungCertificate/quiet-launch-samsung
chmod 600 .local/home/SamsungCertificate/quiet-launch-samsung/*
```

`.local/` is gitignored, so the certificates stay out of commits. On this
computer that move is done. The files are in
`.local/home/SamsungCertificate/quiet-launch-samsung/`. The signing profile
`quiet-launch-samsung` is already active, and its key paths point at that
directory. The author certificate was issued by Samsung VD Author CA. The
distributor certificate was issued by the Samsung public developer CA.

Public privilege is the level Samsung gives without a separate partner
application. Opening other apps from Quiet Launch uses
`http://tizen.org/privilege/application.launch`, which is partner level. A
Public certificate may install the page and still refuse those cards. Photos
and the page do not need that privilege. If the cards are refused, package
again without that privilege.

## After the files exist

Leave the CLI profile named `quiet-launch` in place. It still points at
`.local/certs/author.p12` and `tizen-distributor-signer-new.p12`. Packaging
with `-s quiet-launch` signs the widget the television already refused.

The Samsung author file is a different `author.p12`, under
`.local/home/SamsungCertificate/quiet-launch-samsung/`. The profile file is
`.local/tizen-studio-data/profile/profiles.xml`. On this computer
`tizen cli-config` sets `profiles.path` to that file. It is gitignored.
Certificate Manager already added `quiet-launch-samsung` and made it active.
After the move, that profile's key paths were updated to the project
directory. Do not run the add command again on this computer.

On a machine where **Finish** did not add the profile, register it from the
repository root. Set `AUTHOR` and `DIST` to the directory that actually
contains the new files.

```bash
AUTHOR=.local/home/SamsungCertificate/quiet-launch-samsung/author.p12
DIST=.local/home/SamsungCertificate/quiet-launch-samsung/distributor.p12
.local/tizen-studio/tools/ide/bin/tizen security-profiles add \
  -n quiet-launch-samsung -A \
  -a "$AUTHOR" \
  -p "$(cat .local/certs/samsung-author.password)" \
  -d "$DIST" \
  -dp "$(cat .local/certs/samsung-distributor.password)"
```

Passwords stay in those two files. If the wizard did not ask for a
distributor password, do not invent one and do not reuse the public signer
password. If packaging later reports `Invaild password`, write the same
passwords as plain text in `profiles.xml` and package again. Do not commit
that file.

Package with `-s quiet-launch-samsung`, as in
[quiet-launch.md](quiet-launch.md). `-s quiet-launch` still signs with the
refused public distributor certificate.

Build the widget as in [quiet-launch.md](quiet-launch.md). Sign and install
only while `tv-access` is not connected. The television accepts one SDB
client. Use a package file name without spaces. `quiet-launch.wgt` is the
name to keep.

```bash
.local/tizen-studio/tools/sdb connect 192.0.2.10:26101
.local/tizen-studio/tools/sdb install .local/build/quiet-launch.wgt
.local/tizen-studio/tools/sdb kill-server
```

If Device Manager is open, right-click the television and choose **Permit to
install applications**. If the television shows a one-time allow or install
confirmation, press **OK** on the remote. Until the Samsung signature is
installed, Quiet Launch is not in the Apps list and there is nothing new to
press.

Open the installed app from **Smart Hub → Apps → Quiet Launch**. To open it
from the computer without making it Home:

```bash
TV_HOST=192.0.2.10 XDG_CACHE_HOME=.local/cache \
  ./samsung-tv-tools/tools/tv_access/tv-access \
  'app_launcher -u 5001 -s qlaunch00.QuietHome'
```

Run that only after `sdb kill-server`.

## Pictures

The picture server is not left running. Start it when you want live pictures.
The command and the firewall rule for this set are in `.local/private.md`.
The public form, with a documentation address, is in
[quiet-launch.md](quiet-launch.md). Packaged pictures from `.local/photos`
do not need the server.
