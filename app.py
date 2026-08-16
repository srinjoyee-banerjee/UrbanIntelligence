from flask import Flask, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
DATA_DIR = os.path.join(BASE_DIR, "data")


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/dashboard")
@app.route("/dashboard/")
@app.route("/dashboard.html")
def dashboard():
    return send_from_directory(FRONTEND_DIR, "dashboard.html")


# ============================================================
# RESULTS
# ============================================================

@app.route("/results")
@app.route("/results/")
@app.route("/result")
@app.route("/result/")
@app.route("/result.html")
def results():
    return send_from_directory(FRONTEND_DIR, "result.html")


# ============================================================
# FRONTEND CSS / JS
# ============================================================

@app.route("/<path:filename>")
def frontend_files(filename):
    file_path = os.path.join(FRONTEND_DIR, filename)

    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, filename)

    return "Not Found", 404


# ============================================================
# DATA FILES
# ============================================================

@app.route("/data/<path:filename>")
def data_files(filename):
    return send_from_directory(DATA_DIR, filename)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
