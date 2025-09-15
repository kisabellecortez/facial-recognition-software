import psycopg2

def get_db_connection():
    return psycopg2.connect(
        dbname="facial-recognition-db",
        user="postgres",
        password="20Kristina04",
        host="localhost",
        port="5432"
    )

def create_faces_table():
    conn = get_db_connection()
    cur = conn.cursor()
    # Persons table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS persons (
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            dob DATE NOT NULL
        )
    """)
    # Faces table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS faces (
            id SERIAL PRIMARY KEY,
            person_id INTEGER REFERENCES persons(id),
            image BYTEA NOT NULL
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def insert_face(person_id, image_bytes):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO faces (person_id, image) VALUES (%s, %s)",
        (person_id, psycopg2.Binary(image_bytes))
    )
    conn.commit()
    cur.close()
    conn.close()
