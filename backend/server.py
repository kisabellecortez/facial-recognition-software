# server.py
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import base64
from db import create_faces_table, insert_face
import psycopg2

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_db_connection():
    return psycopg2.connect(
        dbname="facial-recognition-db",
        user="postgres",
        password="20Kristina04",
        host="localhost",
        port="5432"
    )

# Ensure the faces table exists
create_faces_table()

@app.route('/')
def home():
    return "Server running"

@app.route('/add-person', methods=['POST'])
def add_person():
    data = request.get_json()
    first_name = data['first_name']
    last_name = data['last_name']
    dob = data['dob']

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO persons (first_name, last_name, dob) VALUES (%s, %s, %s) RETURNING id", 
        (first_name, last_name, dob)
    )
    person_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"id": person_id, "message": "Person added successfully."})

@app.route('/upload-captures', methods=['POST'])
def upload_multiple():
    data = request.get_json()
    person_id = data.get('person_id')
    image_list = data['images']

    conn = get_db_connection()
    cur = conn.cursor()

    for image_data in image_list:
        header, encoded = image_data.split(",", 1)
        binary_data = base64.b64decode(encoded)
        
        cur.execute(
            "INSERT INTO faces (person_id, image) VALUES (%s, %s)", 
            (person_id, psycopg2.Binary(binary_data))
        )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Images uploaded successfully"})

if __name__ == "__main__":
    app.run(debug=True)
