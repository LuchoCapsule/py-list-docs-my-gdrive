import io
import os
import json
from flask import Flask, redirect, url_for, session, request as requestFlask, jsonify
from flask_session import Session
from flask_cors import CORS
from flask_cors import cross_origin
from google.oauth2 import id_token, credentials  # Import credentials
import google.oauth2.credentials  # Import google.oauth2.credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2 import credentials
from google.auth.transport.requests import Request 
from googleapiclient.http import MediaIoBaseDownload
import base64
# Import the my_ImageClass from my-image.py
from my_image import my_ImageClass
import random
#from dotenv import load_dotenv

# Load environment variables from .env file
# load_dotenv()

# # Function to load system environment variables and assign them globally. 
# MAKE SURE these variables are created in the system with the right values.
def load_env_variables():
    global FLASK_SECRET_KEY, SESSION_TYPE, CLIENT_ID, CLIENT_SECRET, PROJECT_ID, REDIRECT_URI, REDIRECT_FRONTEND_URI
    FLASK_SECRET_KEY = os.environ.get('FLASK_SECRET_KEY')
    SESSION_TYPE = os.environ.get('SESSION_TYPE')
    CLIENT_ID = os.environ.get('CLIENT_ID')
    CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
    PROJECT_ID = os.environ.get('PROJECT_ID')
    REDIRECT_URI = os.environ.get('REDIRECT_URI')
    REDIRECT_FRONTEND_URI = os.environ.get('REDIRECT_FRONTEND_URI')
    print(f"FLASK_SECRET_KEY lagl*: {FLASK_SECRET_KEY}")

# Call the function to load the environment variables. Sometimes is necessary to reboot the machine to load the new environment variables here
load_env_variables()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
#CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})  # Enable CORS for all routes from http://localhost:4200
app.secret_key = os.getenv('FLASK_SECRET_KEY')
app.config['SESSION_TYPE'] = os.getenv('SESSION_TYPE')
Session(app)

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
 
# Retrieve the CLIENT_ID environment variable
LUCHO_VAR = os.environ.get('LUCHO_VAR') 
print(f"LUCHO_VAR environment variable: {LUCHO_VAR}")
 
# Create the client secretos dictionary
client_secretos = {
    "web": {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "project_id": PROJECT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "redirect_uris": ["http://localhost:5000/callback"],
        "javascript_origins": ["http://localhost:5000"]
    }
}
print(f"client_secrets lagl*: {client_secretos}")

flow = Flow.from_client_config(
    client_secretos,
    scopes=["https://www.googleapis.com/auth/userinfo.email", "openid", "https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive"],
    redirect_uri="http://localhost:5000/callback"
)

def login_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return redirect(url_for("login"))
        else:
            return function()
    return wrapper

@app.route("/")
def home():     
    return jsonify({"message": "Hello, World!"})

@app.route("/auth/google", methods=["GET"])
# @cross_origin(origins="http://localhost:4200")
@cross_origin()
def login():
    print("login LAGL*")
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    print("authorization_url LAGL*", authorization_url) 
    #return redirect("http://localhost:4200/list-googledrive-photos?images=123")
    return redirect(authorization_url)

# """
# Callback route for handling OAuth2 authorization response.
# This route is triggered when the OAuth2 provider redirects the user back to the application
# after the user has authorized the application. It handles the exchange of the authorization
# code for an access token and ID token, verifies the ID token, and stores the user's information
# in the session.
# Returns:
#     Response: A JSON response containing the access token if successful, or an error message
#     if the ID token is None or the state does not match.
# Raises:
#     Exception: If there is an issue with fetching the token or verifying the ID token.
# Side Effects:
#     - Updates the session with the user's credentials, Google ID, and name.
#     - Reads the client secretos file to extract the client ID.
# """
@app.route("/callback") 
def callback():
    print("callback LAGL*")
    flow.fetch_token(authorization_response= requestFlask.url)

    if not session["state"] == requestFlask.args["state"]:
        return redirect(url_for("login")) 

    credentials = flow.credentials
    
    session["credentials"] = credentials_to_dict(credentials)
    # Debugging statement to check credentials.id_token
    print(f"credentials.id_token: {credentials.id_token}")

    if credentials.id_token is None:
        return "Error: id_token is None", 500    
    
    print(f"client_secrets: {client_secretos}")
    client_secrets = client_secretos
    client_id = client_secrets['web']['client_id']
    userinfo = id_token.verify_oauth2_token(
        id_token=credentials.id_token,
        request=Request(),  
        audience=client_id,  # Use the client ID as the audience
        clock_skew_in_seconds=300  # Add clock skew tolerance of 5 minutes
    )

    session["google_id"] = userinfo.get("sub")
    session["name"] = userinfo.get("name")

    # Return the token to the frontend
    # return jsonify({"lagl* token": credentials.token})
    
    # Return the token to the frontend as a query parameter
    token = credentials.token
    return redirect(f"http://localhost:4200/welcome?myTokenParameter={token}")

@app.route("/fetch-images", methods=["POST"])
# @cross_origin(origins="http://localhost:4200")
@cross_origin()
def fetch_images():
    token = requestFlask.json.get("token")
    print(f"Getting Python server Token: {token}")    
    if not token:
        return "Error: Token is missing", 400

    credentials = google.oauth2.credentials.Credentials(token)
    drive_service = build("drive", "v3", credentials=credentials)

    results = drive_service.files().list(
        q="mimeType='image/jpeg'",
        fields="files(id, name, webViewLink)"
    ).execute()

    items = results.get("files", [])
    images = []

    for item in items:
        file_id = item["id"]
        request = drive_service.files().get_media(fileId=file_id)
        file_data = io.BytesIO()
        downloader = MediaIoBaseDownload(file_data, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        file_data.seek(0)
        encoded_file_data = base64.b64encode(file_data.read()).decode('utf-8')
        random_group = random.randint(1, 4)
        myImg = create_image(item["name"], item["id"], item["name"],encoded_file_data,item["webViewLink"], True, random_group)

        # images.append({
        #     "name": item["name"],
        #     "gdImgId": item["id"],
        #     "webViewLink": item["webViewLink"],
        #     "binary": encoded_file_data  # Base64 encode the binary data
        # })
        images.append(myImg.to_dict())

    return jsonify(images)

@app.route("/images")
# @cross_origin(origins="http://localhost:4200")
@cross_origin()
def images():
    credentials = google.oauth2.credentials.Credentials(
        **session["credentials"]
    )
    drive_service = build("drive", "v3", credentials=credentials)

    results = drive_service.files().list(
        q="mimeType='image/jpeg'",
        fields="files(id, name, webViewLink)"
    ).execute()

    items = results.get("files", [])
    images = []

    for item in items:
        file_id = item["id"]
        request = drive_service.files().get_media(fileId=file_id)
        file_data = io.BytesIO()
        downloader = MediaIoBaseDownload(file_data, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        file_data.seek(0)
        encoded_file_data = base64.b64encode(file_data.read()).decode('utf-8')
        images.append({
            "name": item["name"],
            "webViewLink": item["webViewLink"],
            "binary": encoded_file_data  # Base64 encode the binary data
        })

    return jsonify(images)
    #return redirect(f"http://localhost:4200/list-googledrive-photos?images={json.dumps(images)}")

#return redirect(f"http://localhost:4200/list-googledrive-photos?images={json.dumps(images)}")

@app.route("/delete-images", methods=["DELETE"])
# @cross_origin(origins="http://localhost:4200")
@cross_origin()
def delete_images():
    token = requestFlask.json.get("token")
    image_ids = requestFlask.json.get("image_ids")
    
    if not token:
        return "Error: Token is missing", 400
    if not image_ids:
        return "Error: Image IDs are missing", 400
    if not isinstance(image_ids, list):
        return "Error: Image IDs must be a list", 400
    
    print(f"Deleting images: {image_ids}")

    credentials = google.oauth2.credentials.Credentials(token)
    drive_service = build("drive", "v3", credentials=credentials)

    errors = []
    for image_id in image_ids:
        try:
            print(f"Deleting image ID: {image_id}")
            drive_service.files().delete(fileId=image_id).execute()
        except Exception as e:
            error_message = str(e)
            if "File not found" in error_message:
                errors.append(f"Image ID {image_id} not found.")
            else:
                errors.append(f"Failed to delete image ID {image_id}: {error_message}")

    if errors:
        return jsonify({"errors": errors}), 500

    return jsonify({"message": "Images deleted successfully"}), 200

def credentials_to_dict(credentials):
    return {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes
    }

def create_image(name: str, id: int, alt: str, binario: str, webViewLink:str, selected: bool = False, group: int = 1) -> my_ImageClass:
    return my_ImageClass(name, id, alt, binario, webViewLink, selected, group)

if __name__ == "__main__":
    app.run(port=5000, debug=True)