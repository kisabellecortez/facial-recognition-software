# db.py
import psycopg2

def get_connection():
    """Return a new database connection"""
    return psycopg2.connect(
        dbname="facial-recognition-db",
        user="postgres",
        password="20Kristina04",
        host="localhost",
        port="5432"
    )

def create_faces_table():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS faces(
            id SERIAL PRIMARY KEY,
            image BYTEA
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def insert_face(image_bytes):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO faces (image) VALUES (%s)", (image_bytes,))
    conn.commit()
    cur.close()
    conn.close()
