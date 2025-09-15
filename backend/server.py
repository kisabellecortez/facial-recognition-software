from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import base64

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

# Create tables
def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS persons (
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            dob DATE NOT NULL
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS faces (
            id SERIAL PRIMARY KEY,
            person_id INTEGER REFERENCES persons(id),
            image BYTEA NOT NULL
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

create_tables()

# Add a new person
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

# Upload captured face images
@app.route('/upload-captures', methods=['POST'])
def upload_captures():
    data = request.get_json()
    person_id = data.get('person_id')
    images = data.get('images', [])

    if not person_id:
        return jsonify({"error": "person_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    for img_str in images:
        # Remove "data:image/jpeg;base64," if present
        if img_str.startswith("data:image/jpeg;base64,"):
            img_str = img_str.split(",")[1]
        binary_data = base64.b64decode(img_str)
        cur.execute(
            "INSERT INTO faces (person_id, image) VALUES (%s, %s)",
            (person_id, psycopg2.Binary(binary_data))
        )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": f"{len(images)} images uploaded for person {person_id}."})

# Get all faces (with person names)
@app.route('/get-faces', methods=['GET'])
def get_faces():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT f.person_id, p.first_name, p.last_name, f.image 
        FROM faces f
        JOIN persons p ON f.person_id = p.id
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    faces = [
        {
            "person_id": pid,
            "first_name": fname,
            "last_name": lname,
            "image": "data:image/jpeg;base64," + base64.b64encode(img).decode('utf-8')
        }
        for pid, fname, lname, img in rows
    ]
    return jsonify(faces)

if __name__ == "__main__":
    app.run(debug=True)
