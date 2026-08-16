# ============================================================
# URBAN//INTELLIGENCE
# FLASK PRODUCTION BACKEND
# ============================================================

from flask import Flask, send_from_directory
from flask_cors import CORS
import os


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

app = Flask(__name__)

CORS(app)


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


FRONTEND_DIR = os.path.join(
    BASE_DIR,
    "frontend"
)


DATA_DIR = os.path.join(
    BASE_DIR,
    "data"
)



# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():

    return send_from_directory(
        FRONTEND_DIR,
        "index.html"
    )



# ============================================================
# DASHBOARD PAGE
# ============================================================

@app.route("/dashboard")
@app.route("/dashboard/")
@app.route("/dashboard.html")
def dashboard():

    return send_from_directory(
        FRONTEND_DIR,
        "dashboard.html"
    )



# ============================================================
# RESULTS PAGE
# ============================================================

@app.route("/result")
@app.route("/result/")
@app.route("/result.html")
@app.route("/results")
@app.route("/results/")
def result():

    return send_from_directory(
        FRONTEND_DIR,
        "result.html"
    )



# ============================================================
# FRONTEND ASSETS
# CSS / JS / IMAGES
# ============================================================

@app.route("/frontend/<path:filename>")
def frontend_files(filename):

    return send_from_directory(
        FRONTEND_DIR,
        filename
    )



# ============================================================
# STATIC FRONTEND FILES
# Allows style.css and script.js directly
# ============================================================

@app.route("/<path:filename>")
def static_frontend(filename):

    file_path = os.path.join(
        FRONTEND_DIR,
        filename
    )


    if os.path.isfile(file_path):

        return send_from_directory(
            FRONTEND_DIR,
            filename
        )


    return "Not Found",404




# ============================================================
# CSV DATA API
# ============================================================

@app.route("/data/<path:filename>")
def data_files(filename):

    return send_from_directory(
        DATA_DIR,
        filename
    )




# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health")
def health():

    return {

        "status":"running",

        "project":
        "URBAN//INTELLIGENCE"

    }




# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":


    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )


    app.run(

        host="0.0.0.0",

        port=port,

        debug=False

    )
