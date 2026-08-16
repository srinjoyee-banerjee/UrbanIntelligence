
import os
from flask import Flask, send_from_directory, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
DATA_DIR = os.path.join(BASE_DIR, "data")

app = Flask(__name__)


# ============================================================
# FRONTEND
# ============================================================

@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/dashboard")
def dashboard():
    return send_from_directory(FRONTEND_DIR, "dashboard.html")


@app.route("/result")
def result():
    return send_from_directory(FRONTEND_DIR, "result.html")


# ============================================================
# STATIC FILES
# ============================================================

@app.route("/style.css")
def style():
    return send_from_directory(FRONTEND_DIR, "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(FRONTEND_DIR, "script.js")


# ============================================================
# CSV DATA
# ============================================================

@app.route("/data/<path:filename>")
def serve_data(filename):
    return send_from_directory(DATA_DIR, filename)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "project": "URBAN//INTELLIGENCE"
    })


# ============================================================
# LOCAL RUN
# ============================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port
    )
