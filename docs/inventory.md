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

Both the Home app and the startup app are in the package list. They are not the same ID. The 55-inch S90D note that Home was `com.samsung.tv.csfs` matches this set. Startup on this set is the TV viewer, not that Home app. Do not change either value from this inventory.
