import face_recognition
import cv2
import numpy as np

def bytea_to_image(bytea_data):
    nparr = np.frombuffer(bytea_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def get_face_encodings(images):
    encodings = []
    for img in images:
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        locs = face_recognition.face_locations(rgb)
        encs = face_recognition.face_encodings(rgb, locs)
        if encs:
            encodings.append(encs[0])
    return encodings

def match_face(known_encodings, new_encoding):
    results = face_recognition.compare_faces(known_encodings, new_encoding)
    return results
