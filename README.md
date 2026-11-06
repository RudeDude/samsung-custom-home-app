# Samsung custom home

Plan for one television the owner controls: a Samsung 65-inch S90D
(warehouse SKU **S90DD**), model code **QN65S90DDFXZA**.

About This TV shows this software line:

```text
T-PTMDAKUC-0090-2130.0, F03C2070, BT - S
```

`T-PTMDAKUC-0090-2130.0` is the US 2024 firmware family used in public S90D
reports. The same generation is also published as build
`T-PTMDAKUC-0090-REL-202605141701`. `F03C2070, BT - S` is the rest of that
About line. It is not a decoded field. The serial number, MAC addresses, and
the TV's LAN address are not recorded in this repository.

Nothing here has been run against the television yet. A matching report from
a 55-inch retail S90D is evidence that the archive-root route is worth
trying. It is not a test of this set.

## What this repository is

This directory is the owner's notes, license, and later original code.
Three upstream checkouts are present on disk and ignored by git:

| Checkout | License | Role here |
|---|---|---|
| [samsung-tv-tools](https://github.com/invaliddayta/samsung-tv-tools) | MIT | First root probe. Ships its own access program. |
| [samsung-tv-root](https://github.com/chris-ritsen/samsung-tv-root) | Unlicense | Second probe, using only the archive-root command. |
| [quiet-tizen](https://github.com/jss8649/quiet-tizen) | MIT | Reference for inventory, snapshots, and rollback. Its helper refuses this model. |

Upstream files keep their own licenses. This MIT license covers files added
in this repository.

## Goals

- Confirm whether temporary root works on this exact model and firmware.
- Reduce advertising and content-recognition features using Samsung's own
  privacy settings first. Network filtering will be done on the replacement
  home router, not with an on-TV DNS service.
- Add a calmer home screen that can launch the apps the owner keeps.
- Show a rotating selection of still images from a USB drive or a share on
  the local network. Ambient Mode is an acceptable way to do that. A small
  signed Tizen app is the other acceptable way. No Google Photos client will
  be installed on the television.
- Publish only sanitized results. Compatibility notes may name the model and
  the firmware line above. They may not name the serial, a MAC address, or
  a LAN address.

Bluetooth game controllers are out of scope.

## What will not be run

- `quiet-tizen/tools/tv.py`. It accepts only `UN75U8000FFXZA` on
  `T-KSU2EFAKUC-0090-1300.9`.
- Quiet Home, its Bixby Promotion package replacement, and
  `profiles/un75u8000ffxza-1300.9.json`.
- `samsung-tv-tools` app cleanup (`tv-setup`) and the S90C cleanup profile.
  Cleanup in that project is limited to one S90C firmware.
- The on-TV DNS blocker under `samsung-tv-tools/tools/tv_dns/`.
- `samsung-tv-root` commands for the QN90B (`qn90b`) or QN90F (`qn90f`),
  including their payload builds.
- Firmware download, downgrade, USB firmware install, or any bootloader
  change.
- A Python runtime installed onto the television. The Python programs below
  run on the computer.

## Software on the computer

Already present: Python 3.12.3, OpenSSL, and GNU Make. Still required before
any television command: Samsung's `sdb` from Tizen Studio. The .NET 6 SDK is
required only for the second probe.

Python programs to install:

| Program | How it is installed | Talks to the TV |
|---|---|---|
| `samsung-tv-root` 0.0.12 | Editable install in `samsung-tv-root/.venv`. No third-party runtime packages. | Only after `sdb` is installed and Developer Mode is on. |
| `tv-access`, `tv-key`, `tv-shot` | Symlinks created by `samsung-tv-tools/tools/tv_access/install.py`. Not a pip package. | `install.py` itself does not contact the TV. `tv-access` does. |

Development packages such as pytest, Ruff, and PyInstaller are not part of
this setup. Pillow is not installed. Quiet Tizen is not installed into a
virtual environment.

Private command output goes in `.local/`, which is gitignored. The TV address
is passed as `TV_HOST` in the shell, or saved by `install.py` in
`~/.config/tv-access/config.json` (mode 0600, outside this repository). Do
not write that address into a tracked file.

Set the address in the shell before the commands that follow:

```sh
export TV_HOST=<the TV LAN address>
export SDB=<absolute path of sdb>
```

`$SDB` is whatever path Tizen Studio used. A typical Linux path is
`$HOME/tizen-studio/tools/sdb`.

## Commands

Run these from the repository root. One SDB session at
a time. Stop if a command reports a different model or a different firmware
than the About line above.

### 1. Host setup, no television access

```sh
# samsung-tv-root, archive route only
cd samsung-tv-root
python3 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/python -m samsung_tv_root doctor

# After the .NET 6 SDK is installed. Do not build the qn90b or qn90f payloads.
make common-payload
cd ..

# Local symlinks and optional host config. This does not contact the TV.
cd samsung-tv-tools
python3 tools/tv_access/install.py --tv "$TV_HOST"
cd ..
```

`doctor` checks the computer. `install.py` writes symlinks under
`~/.local/bin` for `tv-access`, `tv-key`, and `tv-shot`. Confirm that
directory is on `PATH`.

### 2. Developer Mode, on the television

On the TV, open Smart Hub, then Apps, and enter `12345` with the remote.
Turn Developer Mode on, set the host PC address to this computer's LAN
address, and restart the TV when it asks. Turn off a pending firmware update
before that restart. Leave automatic app updates off until the probe is
finished.

Samsung documents the dialog in
[Using the TV Device](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html).

### 3. First probe

```sh
"$SDB" kill-server
"$SDB" start-server
"$SDB" connect "$TV_HOST:26101"
"$SDB" devices

tv-access --probe
tv-access 'id -u'
tv-access --report
```

`--probe` is the read of whether this build is listed and whether root
works. `id -u` must print `0` before any later claim of root. `--report`
prints a shareable summary and a prefilled upstream issue link. It omits the
TV address and serial number. Save the report under `.local/` if it contains
anything beyond that summary. Do not paste raw session logs into a public
issue.

`tv-key` and `tv-shot` are installed with the other symlinks, but they are
not part of this first session. The public S90D row for this build lists
root only.

### 4. Second probe

```sh
cd samsung-tv-root
.venv/bin/python -m samsung_tv_root archive-root probe "$TV_HOST"
.venv/bin/python -m samsung_tv_root archive-root root "$TV_HOST" --command 'id'
```

If route detection picks the wrong interface, add
`--callback-host <this computer's LAN address>` before `archive-root`. Do
not record that address in the repository.

This probe is a cross-check of the same archive-launcher route. It is not a
license to run model-specific QN90B or QN90F commands. Let the command
finish its cleanup before restarting the TV or starting another root session.

### 5. Inventory, only after `id` prints 0

Read-only. Store output in `.local/inventory/`. These commands go through
`tv-access`, one at a time:

```sh
tv-access 'uname -srmo; readlink -f /usr/share/dotnet.tizen/netcoreapp; cat /etc/tizen-release'
tv-access 'sqlite3 -readonly /opt/dbspace/.pkgmgr_parser.db "SELECT app_id,app_disable FROM package_app_info ORDER BY app_id;"'
```

Also record the current Home and startup app IDs before any launcher work.
On the public 55-inch S90D notes, the Home app was `com.samsung.tv.csfs`.
That value has to be read on this TV. It is not assumed.

No package will be removed in this step. Samsung's Settings screens for
Viewing Information Services, advertising, and voice features are the privacy
changes that do not need root. The replacement router is where DNS filtering
belongs.

### 6. Later, not in the command list above

Custom home and the picture frame wait until inventory exists and a restore
path has been tried.

The home screen, if built, will be a signed Tizen web app installed with
Samsung's normal developer installer, following the public S90D hub notes in
[Couchroot](https://github.com/splitcipher/couchroot/blob/main/docs/lab/devices/s90d/README.md).
Home will be assigned only after the app is verified, and the original Home
app will be restored in a tested step before that assignment is kept.
Quiet Home will not be copied onto this firmware.

Pictures will come from a USB drive or a local network share. Ambient Mode
can show them. A page in the signed app can show them. The slideshow must
rotate and stay dim, because this panel is a QD-OLED. The television will
not receive a Google account or a Google Photos application.

## Publishing

Before a public commit, search the tracked diff for addresses, serial
numbers, MAC addresses, account names, certificates, screenshots, and
database snapshots. `.local/`, `.env`, and the three upstream checkouts are
ignored for that reason.

A confirmed probe can be sent upstream with `tv-access --report`, with the
model code and the firmware line filled in from About This TV. New original
code in this repository is MIT-licensed, as in [LICENSE](LICENSE).
