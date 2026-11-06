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
| `.local/tizen-studio/tools/sdb` | `sdb` 4.2.25 |
| `.local/tizen-studio-data` | Installer data directory |
| `.local/home/.package-manager` | Bundled JDK and installer logs |
| `.local/cache/web-cli_Tizen_Studio_6.0_ubuntu-64.bin` | The installer that was downloaded |

No TV-extension packages and no Samsung certificate were installed. Those
are for signing an application later.

Check that `sdb` can load its libraries:

```sh
ldd .local/tizen-studio/tools/sdb | awk '/not found/ {print}'
```

No output means the libraries are present. On this Ubuntu 24.04 machine the
check was empty.

## What is deliberately not installed

- A virtualenv for `samsung-tv-root`, and `make common-payload`.
- `pip` packages of any kind. `tv-access` is the Python program already in
  the `samsung-tv-tools` checkout. It uses the Python standard library plus
  the system `openssl` command.
- Pillow, pytest, Ruff, or PyInstaller.
- A copy of `sdb` on `PATH`. Later commands that need it export `SDB` for
  that shell:

```sh
export SDB="$(pwd)/.local/tizen-studio/tools/sdb"
```

Do not run `sdb connect` while `tv-access` is in use. The television accepts
one SDB client at a time, and `tv-access` speaks that protocol itself.
