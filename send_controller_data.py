"""
SolarSense — solarstreetlightyojana.com controller-data sender.

Controller ka firmware jo GET request bhejta hai, wahi exact format replicate karta hai:
string values single-quotes mein (%27 ban jate hain), numeric values plain.

Usage:
  python send_controller_data.py --dry-run --count 3   # bina bheje sirf URL dikhao
  python send_controller_data.py --count 5             # 5 test records send
  python send_controller_data.py --count 100           # 100 send
  python send_controller_data.py --file real_data.csv             # CSV ka data bhejo
  python send_controller_data.py --file real_data.csv --dry-run   # pehle URL dekho
  python send_controller_data.py --url http://localhost:5000/api/controller-data --count 5
"""

import csv
import random
import sys
import time
import urllib.parse
from datetime import datetime

from curl_cffi import requests as cffi_requests

# ================= CONFIG (yahan apni values badlo) =================
BASE_URL = "http://solarstreetlightyojana.com/u/jf9wn0wk/controller-data"
TEST_ID_PREFIX = "9999999999999"   # 13 chars + 4-digit number = 17-digit device ID
MOBILE_NO = "0000000000000"        # 13 digits, firmware jaisa
CONF = "LLP_G1579"
DELAY_SECONDS = 1.0                # do requests ke beech ka gap
TIMEOUT_SECONDS = 15
MAX_RETRIES = 3
LOG_FILE = "controller_data_log.csv"
# ====================================================================


def build_url(rec):
    """Firmware wala exact format: strings quotes ke saath, numbers plain."""
    params = [
        ("ID", "'%s'" % rec["ID"]),
        ("BV", "%.3f" % rec["BV"]),
        ("BI", "%.3f" % rec["BI"]),
        ("SV", "%.3f" % rec["SV"]),
        ("SI", "%.3f" % rec["SI"]),
        ("LV", "%.3f" % rec["LV"]),
        ("LI", "%.3f" % rec["LI"]),
        ("STATE", "'%s'" % rec["STATE"]),
        ("DOD", "'%03d'" % rec["DOD"]),
        ("CONF", "'%s'" % rec["CONF"]),
        ("EVNT", "'%s'" % rec["EVNT"]),
        ("MOB", "'%s'" % rec["MOB"]),
    ]
    return BASE_URL + "?" + urllib.parse.urlencode(params)


def generate_records(count):
    """Realistic test data (12V solar street light controller)."""
    records = []
    for i in range(1, count + 1):
        state = "OK" if random.random() < 0.9 else "FAULT"
        records.append({
            "ID": TEST_ID_PREFIX + "%04d" % i,
            "BV": round(random.uniform(12.0, 13.6), 3),
            "BI": round(random.uniform(0.0, 3.0), 3),
            "SV": round(random.uniform(15.0, 19.0), 3),
            "SI": round(random.uniform(0.0, 5.0), 3),
            "LV": round(random.uniform(12.0, 12.6), 3),
            "LI": round(random.uniform(0.0, 1.5), 3),
            "STATE": state,
            "DOD": random.randint(0, 100),
            "CONF": CONF,
            "EVNT": "YES" if state == "FAULT" else "NO",
            "MOB": MOBILE_NO,
        })
    return records


# Cloudflare ko bot-signature na dikhe, isliye browser jaisa headers set
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "identity",
    "Connection": "keep-alive",
}


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def read_csv_records(path):
    """CSV se records padho. Columns: id,bv,bi,sv,si,lv,li,state,dod,conf,evnt,mob"""
    records = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rec = {
                "ID": (row.get("id") or "").strip(),
                "BV": num(row.get("bv")),
                "BI": num(row.get("bi")),
                "SV": num(row.get("sv")),
                "SI": num(row.get("si")),
                "LV": num(row.get("lv")),
                "LI": num(row.get("li")),
                "STATE": (row.get("state") or "OK").strip() or "OK",
                "DOD": int(num(row.get("dod"))),
                "CONF": (row.get("conf") or CONF).strip() or CONF,
                "EVNT": (row.get("evnt") or "NO").strip() or "NO",
                "MOB": (row.get("mob") or MOBILE_NO).strip() or MOBILE_NO,
            }
            if rec["ID"]:
                records.append(rec)
    return records


def send(url):
    """GET request bhejo; (http_status, response_text) lautaao, retry ke saath."""
    req = urllib.request.Request(url, method="GET", headers=BROWSER_HEADERS)
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
                return resp.status, resp.read(200).decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            return e.code, e.read(200).decode("utf-8", errors="replace")
        except Exception as e:
            if attempt == MAX_RETRIES:
                return 0, str(e)
            time.sleep(2 * attempt)
    return 0, "unknown error"


def write_log(entry):
    new_file = True
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            new_file = f.readline() == ""
    except FileNotFoundError:
        pass
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if new_file:
            writer.writerow(["timestamp", "device_id", "http_status", "success", "response"])
        writer.writerow(entry)


def main():
    global BASE_URL
    dry_run = "--dry-run" in sys.argv
    count = 3
    if "--count" in sys.argv:
        count = int(sys.argv[sys.argv.index("--count") + 1])
    file_path = sys.argv[sys.argv.index("--file") + 1] if "--file" in sys.argv else None
    if "--url" in sys.argv:
        BASE_URL = sys.argv[sys.argv.index("--url") + 1]

    if file_path:
        records = read_csv_records(file_path)
        print("CSV se %d records mile: %s" % (len(records), file_path))
        if not records:
            print("Koi record nahi mila - header check karo:")
            print("id,bv,bi,sv,si,lv,li,state,dod,conf,evnt,mob")
            return
    else:
        records = generate_records(count)

    total = len(records)
    print("Mode: %s | Records: %d" % (
        "DRY-RUN (kuch bheja nahi jayega)" if dry_run else "SEND", total))

    if dry_run:
        for rec in records[:5]:
            print(build_url(rec))
        if total > 5:
            print("... (%d aur)" % (total - 5))
        return

    ok = fail = 0
    for i, rec in enumerate(records, 1):
        url = build_url(rec)
        status, response = send(url)
        success = status == 200
        ok += success
        fail += not success
        write_log([
            datetime.now().isoformat(timespec="seconds"),
            rec["ID"], status,
            "OK" if success else "FAIL",
            response.strip()[:150],
        ])
        print("[%d/%d] ID=%s status=%d %s" % (
            i, total, rec["ID"], status,
            "OK" if success else "FAIL - " + response.strip()[:80]))
        time.sleep(DELAY_SECONDS)

    print("Done. OK=%d FAIL=%d | Log: %s" % (ok, fail, LOG_FILE))


if __name__ == "__main__":
    main()
