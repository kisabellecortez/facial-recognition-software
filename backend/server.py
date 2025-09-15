# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from db import create_faces_table, insert_face

app = Flask(__name__)
CORS(app)

# Ensure the faces table exists
create_faces_table()

@app.route('/')
def home():
    return "Server running"

@app.route('/upload-multiple', methods=['POST'])
def upload_multiple():
    data = request.get_json()
    image_list = data['images']

    for image_data in image_list:
        header, encoded = image_data.split(",", 1)
        binary_data = base64.b64decode(encoded)
        insert_face(binary_data)

    return jsonify({"message": "Image uploaded successfully"})

if __name__ == "__main__":
    app.run(debug=True)
