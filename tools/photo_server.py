#!/usr/bin/env python3
"""Serve a local picture directory to Quiet Launch.

Binds to one address. Does not listen on every interface. Picture files stay
on this computer. The television has to be allowed to connect to the port.
"""
import argparse
import html
import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from socket import AF_INET, SOCK_DGRAM, socket
from urllib.parse import unquote, urlparse

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def lan_address(peer):
    probe = socket(AF_INET, SOCK_DGRAM)
    try:
        probe.connect((peer, 9))
        return probe.getsockname()[0]
    finally:
        probe.close()


def picture_files(directory):
    files = []
    for path in sorted(directory.iterdir(), key=lambda item: item.name.lower()):
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES:
            files.append(path)
    return files


class PhotoHandler(BaseHTTPRequestHandler):
    directory = Path(".")
    server_version = "QuietPhotos/0.1"

    def log_message(self, fmt, *args):
        return

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        if path in ("/", "/index.html"):
            items = []
            for item in picture_files(self.directory):
                name = html.escape(item.name, quote=True)
                items.append(f'<li><a href="/media/{name}">{name}</a></li>')
            listing = "\n".join(items) or "<li>No pictures in the folder yet.</li>"
            body = (
                "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
                "<title>Quiet photos</title></head><body>"
                "<h1>Quiet photos</h1>"
                "<p>The television reads <a href=\"/manifest.json\">/manifest.json</a>.</p>"
                f"<ul>\n{listing}\n</ul></body></html>"
            ).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/manifest.json":
            body = json.dumps({"images": [
                {"name": item.name, "url": "/media/" + item.name}
                for item in picture_files(self.directory)
            ]}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith("/media/"):
            name = PurePosixPath(path[len("/media/"):]).name
            target = (self.directory / name).resolve()
            root = self.directory.resolve()
            if target.parent != root or not target.is_file() or target.suffix.lower() not in IMAGE_SUFFIXES:
                self.send_error(404)
                return
            data = target.read_bytes()
            mime = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        self.send_error(404)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dir", type=Path, default=Path(".local/photos"))
    parser.add_argument("--bind", help="Address to listen on. Defaults to the route toward TV_HOST.")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    directory = args.dir.expanduser().resolve()
    directory.mkdir(parents=True, exist_ok=True)
    if args.bind:
        host = args.bind
    elif os.environ.get("TV_HOST"):
        host = lan_address(os.environ["TV_HOST"])
    else:
        raise SystemExit("Pass --bind, or set TV_HOST so the server can choose one LAN address.")
    PhotoHandler.directory = directory
    httpd = ThreadingHTTPServer((host, args.port), PhotoHandler)
    print(f"Quiet photos at http://{host}:{args.port}/manifest.json")
    print(f"Directory {directory}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
