# Host setup

Install Samsung's `sdb` inside this repository. Do not install it with apt,
and do not add it to the system path. The first probe does not need `sdb`.
It is installed now so later checks use the same project-local tree.

The computer used here is Ubuntu 24.04.5 on x86_64. These were already
installed and were not added by this project:

| Tool | Version seen here |
|---|---|
| Python | 3.12.3 |
| OpenSSL | 3.0.13 |
| GNU Make | the system `make` |

`sdb` is not in the Ubuntu archives. The .NET 6 SDK is not installed. It is
required only if the later `samsung-tv-root` payload is built from source.
`samsung-tv-root` has not been installed into a virtual environment.
`samsung-tv-tools/tools/tv_access/install.py` has not been run, so no symlink
was created under `~/.local/bin` and no television address was written to
`~/.config`.

## Install the command-line tools

The download is the Tizen Studio 6.0 command-line installer, about 264 MB.
The unpacked tree is about 415 MB. The bundled Java runtime used by the
installer is about 750 MB. All of it stays under `.local/`, which git ignores.

Run this from the repository root. The `HOME` override keeps the installer
from editing your real `~/.bashrc`. The installer looks for
`$HOME/.package-manager` and `$HOME/.bashrc`.

```sh
mkdir -p .local/cache .local/home
wget -O .local/cache/web-cli_Tizen_Studio_6.0_ubuntu-64.bin \
  https://download.tizen.org/sdk/Installer/tizen-studio_6.0/web-cli_Tizen_Studio_6.0_ubuntu-64.bin
chmod +x .local/cache/web-cli_Tizen_Studio_6.0_ubuntu-64.bin
HOME="$(pwd)/.local/home" \
  ./.local/cache/web-cli_Tizen_Studio_6.0_ubuntu-64.bin \
  --accept-license --no-java-check "$(pwd)/.local/tizen-studio"
.local/tizen-studio/tools/sdb version
```

Success prints:

```text
Smart Development Bridge version 4.2.25
```

The installer can still exit 0 after printing:

```text
.local/home/.bashrc: No such file or directory
```

That message is the failed attempt to edit the empty stand-in home. The
install has still finished. Do not create a `.bashrc` there and run it again
unless `sdb version` failed.

The inner installer also creates a real `~/.package-manager` of a few hundred
kilobytes, because that process does not honor the `HOME` override. Move it
into the project and remove the home copy:

```sh
mkdir -p .local/home/.package-manager
mv ~/.package-manager/. .local/home/.package-manager/
rmdir ~/.package-manager
```

`mv` will ask before overwriting a file that is already present. That is
expected if an earlier install attempt left a copy. Keep the project copy.

After a clean install these paths exist, and none of them are tracked:

| Path | What it is |
|---|---|
| `.local/tizen-studio/tools/sdb` | `sdb` 4.2.36 now; the 6.0 installer first printed 4.2.25 |
| `.local/tizen-studio-data` | Installer data directory |
| `.local/home/.package-manager` | Bundled JDK and installer logs |
| `.local/cache/web-cli_Tizen_Studio_6.0_ubuntu-64.bin` | The installer that was downloaded |

The 6.0 installer does not add Certificate Manager. That install is the next
section. A package-manager update of the command-line packages already in
this tree left `sdb version` printing 4.2.36, `tizen version` printing
2.5.25, and Package Manager printing 0.5.67. The 6.0 installer had first
printed `sdb` 4.2.25.

Check that `sdb` can load its libraries:

```sh
ldd .local/tizen-studio/tools/sdb | awk '/not found/ {print}'
```

No output means the libraries are present. On this Ubuntu 24.04 machine the
check was empty.

## Certificate Manager and its libraries

Quiet Launch needs a Samsung certificate before this television will install
it. Creating that certificate is a separate step, in
[certificates.md](certificates.md). The packages below only install the
window. They do not create the certificate.

The package manager's heaptrack check wants three Ubuntu libraries. From this
session it cannot ask for a sudo password. Install them in a normal terminal.
A dry run on this Ubuntu 24.04 machine listed 69 new packages, mostly Qt 5
and KDE Frameworks libraries. Leave the firewall enabled. Do not install
Tizen Studio with apt.

```bash
sudo apt install libkf5itemmodels5 libkf5kiowidgets5 libkchart2
```

Then, from the repository root:

```bash
HOME="$(pwd)/.local/home" \
  .local/tizen-studio/package-manager/package-manager-cli.bin \
  install --accept-license --no-java-check Certificate-Manager,cert-add-on
```

`Certificate-Manager` is the window, version 3.1.3 on this computer.
`cert-add-on` is the Samsung Certificate Extension, version 2.0.75. Do not
pass a sudo password on that command line, and do not store one in this
repository.

The launcher is:

```text
.local/tizen-studio/tools/certificate-manager/certificate-manager
```

It is a shell script that starts the `eclipse` binary in the same directory,
using `.local/tizen-studio/jdk/bin/java` (OpenJDK 1.8.0_242 here). Open it
from the desktop session. An SSH-only shell will not show the window.

On this computer both packages are installed. Package Manager lists them with
status installed. The first attempt, before the three libraries were
installed, updated the CLI packages and then stopped. The second attempt
printed `Installation has been completed` for each package.

Each package-manager run can recreate a real `~/.package-manager` even when
`HOME` points at `.local/home`. Copy
`~/.package-manager/install-log/package-manager/` into
`.local/home/.package-manager/install-log/package-manager/`, then remove the
home directory. `~/.bashrc` was not modified. Its mtime stayed 2026-07-29.

## What is deliberately not installed

- A virtualenv for `samsung-tv-root`, and `make common-payload`.
- `pip` packages of any kind. `tv-access` is the Python program already in
  the `samsung-tv-tools` checkout. It uses the Python standard library plus
  the system `openssl` command.
- Pillow, pytest, Ruff, or PyInstaller.
- The full Eclipse Tizen Studio IDE. Certificate Manager is the separate
  window installed above.
- A copy of `sdb` on `PATH`. Later commands that need it export `SDB` for
  that shell:

```sh
export SDB="$(pwd)/.local/tizen-studio/tools/sdb"
```

Do not run `sdb connect` while `tv-access` is in use. The television accepts
one SDB client at a time, and `tv-access` speaks that protocol itself.
