import os, time, glob, sqlite3, hashlib, logging, sys
import pandas as pd
import requests

VENDOR_URL = "http://solarstreetlightyojana.com/u/jf9wn0wk/controller-data"
INBOX = "inbox"
CHECK_EVERY = 60        # seconds: har 60 sec mein inbox dekho
DELAY = 0.2             # har request ke beech gap (vendor par load kam)
DRY_RUN = "--dry" in sys.argv   # --dry: sirf URL dikhao, bhejo mat

REQUIRED = ["id", "bv", "bi", "sv", "si", "lv", "li", "conf"]
NUMS = ["bv", "bi", "sv", "si", "lv", "li"]

os.makedirs(INBOX, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.FileHandler("sender.log", encoding="utf-8"),
              logging.StreamHandler()])

db = sqlite3.connect("sent.db")
db.execute("CREATE TABLE IF NOT EXISTS sent(h TEXT PRIMARY KEY, at TEXT DEFAULT CURRENT_TIMESTAMP)")
session = requests.Session()


def row_to_params(row):
    dev = row["id"].strip()
    if not (dev.isdigit() and 5 <= len(dev) <= 20):
        raise ValueError(f"invalid id: {dev}")
    v = {k: float(row[k]) for k in NUMS}
    return {
        "ID": f"'{dev}'",
        "BV": f"{v['bv']:.3f}", "BI": f"{v['bi']:.3f}",
        "SV": f"{v['sv']:.3f}", "SI": f"{v['si']:.3f}",
        "LV": f"{v['lv']:.3f}", "LI": f"{v['li']:.3f}",
        "STATE": f"'{row.get('state', '').strip() or 'OK'}'",
        "DOD": f"'{row.get('dod', '').strip() or '000'}'",
        "CONF": f"'{row['conf'].strip()}'",
        "EVNT": f"'{row.get('evnt', '').strip() or 'NO'}'",
        "MOB": f"'{row.get('mob', '').strip()}'",
    }


def process_file(path):
    df = pd.read_excel(path, dtype=str).fillna("")
    df.columns = [c.strip().lower() for c in df.columns]
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        logging.error("%s: columns missing %s", path, missing)
        return

    sent = skipped = failed = 0
    bad = []

    for i, row in df.iterrows():
        excel_row = i + 2          # header ke baad, Excel ki row number
        try:
            params = row_to_params(row)
        except Exception as e:
            bad.append({"excel_row": excel_row, "error": str(e)})
            continue

        h = hashlib.sha256(repr(sorted(params.items())).encode()).hexdigest()
        if db.execute("SELECT 1 FROM sent WHERE h=?", (h,)).fetchone():
            skipped += 1           # pehle bhej chuka hai
            continue

        if DRY_RUN:
            print(requests.Request("GET", VENDOR_URL, params=params).prepare().url)
            continue

        try:
            r = session.get(VENDOR_URL, params=params, timeout=10)
            if r.status_code == 200:
                db.execute("INSERT INTO sent(h) VALUES(?)", (h,))
                db.commit()
                sent += 1
            else:
                failed += 1
                logging.warning("row %d: HTTP %s %s", excel_row, r.status_code, r.text[:100])
        except requests.RequestException as e:
            failed += 1
            logging.warning("row %d: %s", excel_row, e)
        time.sleep(DELAY)

    if bad:
        out = f"bad_{os.path.basename(path)}.csv"
        pd.DataFrame(bad).to_csv(out, index=False)
    logging.info("%s -> sent=%d skipped=%d failed=%d bad=%d",
                 os.path.basename(path), sent, skipped, failed, len(bad))


def main():
    logging.info("Started. Dry run: %s", DRY_RUN)
    while True:
        for p in glob.glob(os.path.join(INBOX, "*.xlsx")):
            if os.path.basename(p).startswith("~$"):   # Excel ki temp file
                continue
            try:
                process_file(p)
            except PermissionError:
                logging.warning("%s Excel mein khuli hai, band karo", p)
            except Exception as e:
                logging.error("%s: %s", p, e)
        if DRY_RUN:
            break
        time.sleep(CHECK_EVERY)


if __name__ == "__main__":
    main()