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
packages. They are not installed yet. One attempt updated the command-line
packages already in `.local/tizen-studio`, then stopped before either
certificate package was unpacked. After that update:

| Command | What it printed |
|---|---|
| `.local/tizen-studio/tools/sdb version` | `Smart Development Bridge version 4.2.36` |
| `.local/tizen-studio/tools/ide/bin/tizen version` | `Tizen CLI 2.5.25` |
| `.local/tizen-studio/package-manager/package-manager-cli.bin` with no arguments | `Package Manager (0.5.67)` |

The 6.0 command-line installer had originally left `sdb` at 4.2.25. See
[host-setup.md](host-setup.md).

The installer stopped in its heaptrack prerequisite check. That check wants
three Ubuntu libraries, and from this session it could not ask for a sudo
password (`pkexec` had no terminal). Install the libraries in a normal
terminal, where you can type the password. A dry run on this Ubuntu 24.04
machine listed 69 new packages, mostly Qt 5 and KDE Frameworks libraries.
Leave the firewall enabled. Do not install Tizen Studio with apt.

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
Extension, version 2.0.75 in the extension list. Do not pass a sudo password
on that command line, and do not store one in this repository.

The same run can recreate a real `~/.package-manager`. Move it back under
`.local/home/.package-manager/` the way [host-setup.md](host-setup.md)
describes, then remove the home copy.

After a successful install, this file exists:

```text
.local/tizen-studio/tools/certificate-manager/certificate-manager
```

If that path is missing, the install did not finish. It is a window. Open it
from the desktop session on this computer. An SSH-only shell will not show
it.

The `HOME` override matches the original tool install. Certificate Manager
may still write the Samsung account files under the real home directory
`~/SamsungCertificate/`. Check both of these after the wizard finishes:

- `.local/home/SamsungCertificate/quiet-launch/`
- `~/SamsungCertificate/quiet-launch/`

## Create the profile

You need a Samsung account you can sign into in a browser. An account that
is only signed in on the television is a different login. Create the account
during the wizard if you do not have one.

The author certificate is permanent for this app. Every later update of
Quiet Launch has to be signed with the same author certificate. If a later
package is signed with a different author certificate, the television treats
it as a different application.

1. Open Certificate Manager from the path above.
2. If a dialog titled **Migration for Certificate Profile** appears, click
   **Cancel**.
3. Click the **+** button.
4. Choose **Samsung**. Choose **TV**. Click **Next**.
5. Name the profile `quiet-launch`. Click **Next**.
6. Choose **Create a new author certificate**. Click **Next**.
7. Fill in the name and password the wizard asks for. Write the password as
   one line in `.local/certs/samsung-author.password` and run
   `chmod 600` on that file. Do not put the password in a tracked file or in
   chat.
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
computer's address on the television has changed. That address is the
computer address in `.local/private.md`.

Public privilege is the level Samsung gives without a separate partner
application. Opening other apps from Quiet Launch uses
`http://tizen.org/privilege/application.launch`, which is partner level. A
Public certificate may install the page and still refuse those cards. Photos
and the page do not need that privilege. If the cards are refused, package
again without that privilege.

## After the files exist

Tell the packaging step where `author.p12` and `distributor.p12` were saved.
Leave the passwords in the files above.

Sign and install only while `tv-access` is not connected. The television
accepts one SDB client. Use a package file name without spaces.
`quiet-launch.wgt` is the name to keep.

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
