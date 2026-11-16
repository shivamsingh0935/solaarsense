"""
SolarSense — local dummy test server.

Asli server (solarstreetlightyojana.com) ke bina, tumhare PC par hi chalta hai.
Sender script isi par requests bhejti hai aur tum dekh sakte ho ki
har request mein kya-kya values aayi.

Chalao:  python local_test_server.py
Bando:   Ctrl+C
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

PORT = 8000


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        print("=" * 60)
        print("Request aayi -> %s" % parsed.path)
        for key, val in params.items():
            print("   %-8s = %s" % (key, val[0]))
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"OK")

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    print("Dummy server chal raha hai: http://localhost:%d" % PORT)
    print("Band karne ke liye Ctrl+C dabao")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
