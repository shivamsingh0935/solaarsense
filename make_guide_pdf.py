# SolarSense - Controller Data Automation Guide PDF generator
# Chalao: python make_guide_pdf.py  ->  SolarSense_Controller_Data_Guide.pdf banega

from fpdf import FPDF

pdf = FPDF(format="A4")
pdf.set_auto_page_break(auto=True, margin=15)


def section(title):
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 14)
    pdf.multi_cell(0, 8, title)
    pdf.ln(1)


def sub(title):
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.multi_cell(0, 7, title)
    pdf.ln(0.5)


def body(text):
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "", 10.5)
    pdf.multi_cell(0, 5.5, text)
    pdf.ln(1.5)


def bullet(text):
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "", 10.5)
    pdf.multi_cell(0, 5.5, "  -  " + text)


def code(text):
    pdf.set_font("Courier", "", 9.5)
    for line in text.split("\n"):
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 4.8, line)
    pdf.set_font("Helvetica", "", 10.5)
    pdf.ln(1.5)


# ================= COVER =================
pdf.add_page()
pdf.ln(40)
pdf.set_font("Helvetica", "B", 26)
pdf.cell(0, 12, "SOLARSENSE", align="C")
pdf.ln(16)
pdf.set_font("Helvetica", "B", 16)
pdf.cell(0, 9, "Controller Data Automation", align="C")
pdf.ln(10)
pdf.cell(0, 9, "Setup Guide", align="C")
pdf.ln(24)
pdf.set_font("Helvetica", "", 11)
pdf.cell(0, 7, "Date: 02 November 2026", align="C")
pdf.ln(14)
pdf.set_font("Helvetica", "", 10.5)
pdf.multi_cell(0, 6,
    "Is guide mein wahi sab documented hai jo SolarSense project mein "
    "controller-data bhejne ke liye kiya gaya hai - taaki kisi bhi dusre "
    "laptop par same setup khud kar sako.", align="C")

# ================= 1. OVERVIEW =================
pdf.add_page()
section("1. Ye kaam kya hai")
body("Solar street light controller ka telemetry data ek URL par GET request ke roop mein "
     "bheja jata hai. Data hazaaron records mein aata hai, isliye manually URL fill karna "
     "possible nahi - isliye ek Python script banayi jo ye kaam automatic karti hai.")
sub("Jo 12 fields bheji jati hain:")
bullet("ID    = device ki unique ID (17 digits)")
bullet("BV    = Battery Voltage (V)")
bullet("BI    = Battery Current (A)")
bullet("SV    = Solar Panel Voltage (V)")
bullet("SI    = Solar Current (A)")
bullet("LV    = Load Voltage (V)")
bullet("LI    = Load Current (A)")
bullet("STATE = device status ('OK' / 'FAULT')")
bullet("DOD   = Depth of Discharge - battery kitni % discharge (%)")
bullet("CONF  = configuration / firmware version")
bullet("EVNT  = koi event hai ya nahi ('YES' / 'NO')")
bullet("MOB   = registered mobile number (13 digits)")
sub("URL ka format (firmware jaisa hi):")
code("http://HOST/api/controller-data?ID=%2799999999999990001%27&BV=12.190"
     "&BI=0.706&SV=18.533&SI=1.520&LV=12.494&LI=0.991&STATE=%27OK%27"
     "&DOD=%27043%27&CONF=%27QCT_F1579%27&EVNT=%27NO%27&MOB=%270000000000000%27")
body("2 rules:\n"
     "  - String values single-quotes mein hain ('OK') - URL mein %27 ban jati hain\n"
     "  - Numeric values plain hain (12.190)")
sub("Data ka flow:")
code("Data source (Excel/DB, hazaaron records)\n"
     "      |\n"
     "      v\n"
     "Python sender script (send_controller_data.py)\n"
     "      |\n"
     "      v\n"
     "HTTP GET request\n"
     "      |\n"
     "      v\n"
     "Receiver server (ab SolarSense backend: localhost:5000/api/controller-data)")

# ================= 2. FILES =================
section("2. Kaunsi files banayi / badli (SolaarSense folder)")
bullet("send_controller_data.py        - sender script (Python, sirf stdlib)")
bullet("local_test_server.py           - dummy receiver server (test ke liye, port 8000)")
bullet("test_karo.bat                  - ek-command test (backend + sender automatic)")
bullet("backend/routes/controller-data.js - SolarSense backend ka naya endpoint (receiver)")
bullet("backend/server.js              - endpoint mount kiya (1 line add hui)")
bullet("controller_data_log.csv        - har request ka log (script khud banati hai)")
sub("Sender script ke modes:")
code("python send_controller_data.py --dry-run --count 3    # sirf URL print, kuch nahi bhejta\n"
     "python send_controller_data.py --count 5              # 5 records bhejo\n"
     "python send_controller_data.py --local --count 5      # local dummy (port 8000) ko bhejo\n"
     "python send_controller_data.py --url http://X --count 5   # koi bhi URL ko bhejo")
body("Script ke andar ye automatic hai:\n"
     "  - Retry (2 baar, fail par)\n"
     "  - Timeout (15 second)\n"
     "  - Browser jaisa headers (Cloudflare bot-block se bachne ke liye)\n"
     "  - CSV log (timestamp, device_id, http_status, success, response)")

# ================= 3. WHAT HAPPENED =================
section("3. Is laptop par kya-kya ho chuka (history)")
bullet("Python 3.13 python.org se install kiya (Add python.exe to PATH ke saath)")
bullet("Dry-run se verify kiya: URL format bilkul firmware jaisa hai")
bullet("Asli server (solarstreetlightyojana.com) par test kiya:")
bullet("    - Cloudflare ne Python script ko bot samajh kar 403 / error 1010 diya")
bullet("    - Browser headers add kiye - tab 502 mila (origin server down tha)")
bullet("    - Poori site down thi (root page bhi 502) - server-side problem")
bullet("Decision: receiver ab SolarSense ka apna backend hai, asli server nahi")
bullet("Backend ka /api/controller-data endpoint banaya aur verify kiya:")
code("[controller-data] 2026-11-02T07:33:35.916Z {\"id\":\"99999999999990001\","
     "\"bv\":12.19,\"state\":\"OK\",\"dod\":10,...}")
bullet("Backend ka .env DB bhi connect ho raha hai (realtime: LISTEN ss_data_changed)")

# ================= 4. NEW LAPTOP SETUP =================
section("4. NAYE laptop par setup - step by step")
sub("Step 1 - Python install karo")
bullet("Browser mein jao: python.org/downloads")
bullet("Yellow button se Python 3.13.x download karo")
bullet("Installer chalao - SABSE IMPORTANT: 'Add python.exe to PATH' checkbox TICK karo")
bullet("'Install Now' click karo")
bullet("Verify (naya cmd kholo):")
code("python --version")
sub("Step 2 - Node.js install karo (backend ke liye)")
bullet("Browser mein jao: nodejs.org -> LTS version download karo")
bullet("Installer chalao (Next-Next-Finish)")
bullet("Verify:")
code("node --version")
sub("Step 3 - Project copy karo")
bullet("Poora SolaarSense folder naye laptop par copy karo (pen drive / cloud / git)")
bullet("Zaroori files: send_controller_data.py, local_test_server.py, test_karo.bat")
bullet("Aur backend folder (server.js, routes/, package.json, .env agar hai)")
bullet("Note: backend/node_modules copy karne ki zaroorat NAHI hai")
sub("Step 4 - Backend dependencies install karo (sirf agar backend chalana hai)")
code("cd C:\\<USER>\\Desktop\\SolaarSense\\backend\n"
     "npm install")
bullet("Ye node_modules folder bana dega")
bullet(".env file chahiye agar DB connect karna ho (DB save feature aane par)")
sub("Step 5 - Test chalao")
code("cd C:\\<USER>\\Desktop\\SolaarSense\n"
     "test_karo.bat")
body("Expected result:\n"
     "  - Sender window: 5 lines 'status=200 OK'\n"
     "  - Backend window: 5 lines '[controller-data] ...'")
sub("Step 6 - URL badalna ho to")
bullet("File edit: send_controller_data.py -> top mein BASE_URL line")
bullet("Ya command se:")
code("python send_controller_data.py --url http://NEW-URL --count 5")

# ================= 5. CHEAT SHEET =================
section("5. Commands cheat-sheet")
code("# Dry-run (sirf URL dikhao, kuch nahi bhejta)\n"
     "python send_controller_data.py --dry-run --count 3\n"
     "\n"
     "# Dummy server test (dono commands alag-alag windows mein)\n"
     "python local_test_server.py                          # Terminal 1\n"
     "python send_controller_data.py --local --count 5     # Terminal 2\n"
     "\n"
     "# SolarSense backend ko bhejo (backend folder mein pehle ye chalao)\n"
     "node server.js                                       # Terminal 1\n"
     "python send_controller_data.py --count 5             # Terminal 2\n"
     "\n"
     "# Ek-command test (backend + sender automatic)\n"
     "test_karo.bat\n"
     "\n"
     "# Koi bhi custom URL\n"
     "python send_controller_data.py --url http://example.com/x --count 100")

# ================= 6. ERRORS =================
section("6. Common errors aur unka matlab")
bullet("'Python was not found'        -> Python install nahi hai, ya PATH tick nahi kiya tha")
bullet("WinError 10061                -> backend running nahi hai (pehle backend chalao)")
bullet("403 / error code: 1010        -> Cloudflare bot-block (browser headers zaroori)")
bullet("502 / error code: 502         -> server ka origin down hai (wait karo, hamari galti nahi)")
bullet("status=0                      -> network/timeout (script khud retry karti hai)")
bullet("status=400 ID missing         -> request mein ID nahi thi")

# ================= 7. NEXT STEPS =================
section("7. Next steps (aage kya karna hai)")
bullet("Received data ko PostgreSQL table mein save karna")
bullet("Asli source data (Excel/CSV ya DB) se hazaaron records bhejna")
bullet("Asli server (solarstreetlightyojana.com) up hone par wahan bhejna (--url se)")
bullet("Script ko schedule karna (har N minute par) - Windows Task Scheduler ya PM2")
bullet("Asli device IDs use karna (abhi test IDs 99999... hain)")

pdf.output("SolarSense_Controller_Data_Guide.pdf")
print("Guide ban gayi: SolarSense_Controller_Data_Guide.pdf")
