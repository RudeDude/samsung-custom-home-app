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
replace Samsung QuickLaunch and it does not change Home. A package signed
with the public Tizen distributor certificate was refused by this television
(`pkgcmd` error -4, no package id). Installing it needs a Samsung certificate
that lists this set. See [docs/quiet-launch.md](docs/quiet-launch.md) and
[docs/certificates.md](docs/certificates.md). Addresses and the device id
for this set stay in `.local/private.md`.

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

Stop if the model or firmware build does not match the table above.

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
