# First probe

Run this only after [Developer Mode](developer-mode.md) is on and the
television has finished restarting. Run it from the repository root.

`tv-access` connects to port `26101` by itself. Do not start `sdb`, and do
not run `sdb connect`, before or during these commands. A local `sdb` server
holds the television's only SDB client and the probe then fails.

Set the address in the shell. Do not write it into a tracked file.

```sh
export TV_HOST=192.0.2.10
export XDG_CACHE_HOME="$(pwd)/.local/cache"
mkdir -p .local/probe
```

`XDG_CACHE_HOME` keeps the `tv-access` lock file under `.local/cache` instead
of `~/.cache`.

Confirm the port answers, then run the three checks one at a time:

```sh
timeout 8 bash -c 'echo >/dev/tcp/$TV_HOST/26101'

./samsung-tv-tools/tools/tv_access/tv-access --probe \
  | tee .local/probe/probe.txt

./samsung-tv-tools/tools/tv_access/tv-access 'id -u' \
  | tee .local/probe/id.txt

./samsung-tv-tools/tools/tv_access/tv-access --report \
  | tee .local/probe/report.txt
```

`--probe` prints the address you set. That file is gitignored. `--report`
does not print the address or a serial number. `id -u` must print `0` before
any later command is treated as root.

## Result on this television

| Check | Result |
|---|---|
| `id -u` | `0` |
| Tizen | 9.0.0 (Tizen9/TV) |
| Kernel | 5.4.249 |
| Architecture | armv7l |
| Firmware build | `T-PTMDAKUC-0090-REL-202605141701` |
| `/usr/bin/dotnet` | present |
| `/usr/sbin/sdbd-tarlauncher` | present |
| Compatibility list | listed: S90D (community), root only |

`tv-key`, `tv-shot`, and `tv-setup` were not run. The public row for this
build does not claim keys or screenshots, and `tv-setup` refuses builds it
does not list for cleanup.

The tool also prints a prefilled GitHub issue link. This build is already
listed, so a new issue would only add the exact model code
`QN65S90DDFXZA`. No issue was opened.
