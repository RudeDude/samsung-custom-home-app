# Developer Mode

Do this on the television before the first probe. The computer does not open
a port and the firewall stays enabled.

1. Open Smart Hub, then Apps.
2. Move the highlight to **App Settings**.
3. Enter `12345`. If the remote has no number keys, use the number pad in the
   SmartThings app's remote while App Settings stays highlighted.
4. Turn Developer Mode on.
5. Set the host PC address to the computer's LAN address. On the machine used
   for the first probe, that address was on the same subnet as the television.
   The address is an allowlist stored by the television. It is not written in
   this repository.
6. Restart the television when it asks. Cancel a firmware update if one is
   waiting to install. Leave automatic app updates off until the probe in
   [probe.md](probe.md) has finished.

Entering `12345` from the main Apps list, without App Settings highlighted,
does not open this dialog.

Samsung describes the same dialog in
[Using the TV Device](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html).

## Firewall

The computer used here runs ufw. Incoming connections are dropped. Outgoing
connections are allowed. The probe connects from the computer to the
television's port `26101`, so no firewall change is required and the firewall
should not be disabled.

A later `samsung-tv-root archive-root` cross-check is different: the television
connects back to a temporary port on the computer. That step is not part of
the current procedure. If it is blocked, allow that one return connection
from the television. Do not disable the firewall to get there.
