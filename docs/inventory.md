# Read-only inventory

Run this only after [the probe](probe.md) has printed `id -u` as `0` on this
same boot. Nothing in this step removes a package, changes Home, or changes
startup.

One `tv-access` command at a time. The same shell variables as the probe:

```sh
export TV_HOST=192.0.2.10
export XDG_CACHE_HOME="$(pwd)/.local/cache"
mkdir -p .local/inventory
```

Runtime and framework:

```sh
./samsung-tv-tools/tools/tv_access/tv-access \
  'uname -srmo; readlink -f /usr/share/dotnet.tizen/netcoreapp; cat /etc/tizen-release' \
  | tee .local/inventory/runtime.txt
```

Installed application IDs. This reads the package database. It does not
disable or remove anything:

```sh
./samsung-tv-tools/tools/tv_access/tv-access \
  'sqlite3 -readonly /opt/dbspace/.pkgmgr_parser.db "SELECT app_id,app_disable FROM package_app_info ORDER BY app_id;"' \
  | tee .local/inventory/packages.txt
```

Current Home and startup selections:

```sh
./samsung-tv-tools/tools/tv_access/tv-access \
  'printf "home_appid="; vconftool get db/appfw/home_appid; printf "startup_appid="; vconftool get db/appfw/startup_appid' \
  | tee .local/inventory/home.txt
```

A public note for a 55-inch S90D recorded `com.samsung.tv.csfs` as Home.
Read the value from this television. Do not copy that note in as if it had
been read here.

Raw output stays in `.local/inventory/`. Add only the model, firmware build,
runtime, Home app ID, startup app ID, and a package count to this file.
Do not add the television address.

## Result on this television

All three commands exited 0. Raw output is in `.local/inventory/`.

| Check | Value |
|---|---|
| `uname -srmo` | `Linux 5.4.249 armv7l GNU/Linux` |
| .NET runtime | `/usr/share/dotnet/shared/Microsoft.NETCore.App/6.0.9` |
| `/etc/tizen-release` | Tizen9/TV 9.0.0 (arm), codename `TNINE` |
| Build ID in that file | `T-PTMDAKUC-0090-REL-202605141701` |
| Home app | `com.samsung.tv.csfs` |
| Startup app | `org.tizen.tv-viewer` |
| Registered app rows | 547 |
| Rows with `app_disable` true | 0 |

Both the Home app and the startup app are in the package list. They are not the same ID. The 55-inch S90D note that Home was `com.samsung.tv.csfs` matches this set. Startup at the time of this inventory was the TV viewer, not that Home app. Do not change Home from this inventory. Startup was later set to Quiet Launch, which is recorded in [quiet-launch.md](quiet-launch.md).

## Native page host

A later read inspected `com.samsung.tv.quicklaunch` and every `bin/*.dll` under `/opt/usr/apps`. Raw output is in `.local/inventory/quicklaunch.txt`, `native-dlls.txt`, and `shell-keys.txt`. Nothing was changed.

`com.samsung.tv.bixby-promotion` is not installed. That is the package Quiet Tizen replaces with its home screen.

`com.samsung.tv.quicklaunch` is installed and matches the file owner Quiet Tizen checks:

| Check | Value |
|---|---|
| Account that owns the files | `tizenglobalapp`, uid 201, group `root` |
| Launch account named by the TV | `owner`, uid 5001 |
| `QuickLaunch.dll` | mode `755`, 309760 bytes, SMACK `User::Pkg::com.samsung.tv.quicklaunch::RO` |
| Native image | `bin/.native_image/QuickLaunch.ni.dll`, same SMACK label |
| Manifest | `type="dotnet-inhouse"`, `exec="QuickLaunch.dll"`, `api-version="8"`, built-in app |
| Package flags | enabled, not on boot, no autorestart |
| More key | two `XF86More` rows: one targets `com.samsung.tv.quicklaunch`, one targets `org.tizen.function-osd` |

The More key binding is why this package is not a spare shell. Replacing `QuickLaunch.dll` would take over that remote button. Quiet Tizen's settings-bridge recipe also requires exactly one `XF86More` row for this app. This TV has two, so that recipe would stop before writing.

The DLL survey found 204 DLLs in 79 packages. The non-resource DLLs are owned by `tizenglobalapp`. None of those packages is an unused promotion container. The small single-DLL packages are Ambient scenes (`*-tpl`), `com.samsung.tv.home.art`, `com.samsung.tv.ambientfte`, or other live features. `org.tizen.art-app` is the larger Art application. Those stay in place because Ambient and art are part of the picture-frame goal.

`org.tizen.menu` owns the Settings key (`XF86SysMenu`) and the accessibility shortcuts. `com.samsung.tv.csfs` owns the source, quick-settings, and apps keys. Neither is a host for a replacement page.
