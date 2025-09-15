import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useNavigate } from 'react-router-dom';

export default function NewFaceImages() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [facesDetected, setFacesDetected] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const countRef = useRef(0);

  const params = new URLSearchParams(window.location.search);
  const person_id = params.get("person_id");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!capturing) return;

    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const detections = await faceapi.detectAllFaces(
          webcamRef.current.video,
          new faceapi.TinyFaceDetectorOptions()
        );
        setFacesDetected(detections.length);

        if (detections.length === 1 && capturing) {
          const imageSrc = webcamRef.current.getScreenshot();
          setCapturedImages((prev) => [...prev, imageSrc]);
          countRef.current++;
          if (countRef.current >= 50) {
            clearInterval(interval);
            setCapturing(false);
            setCaptured(true);
          }
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [capturing]);

  const startCapture = () => {
    setCaptured(false);
    setCapturedImages([]);
    setCapturing(true);
    countRef.current = 0;
  };

  const sendCapturedImages = async () => {
    if (!person_id) return;

    try {
      const res = await fetch("http://localhost:5000/upload-captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_id, images: capturedImages }),
      });
      await res.json();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {!captured ? (
        <>
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" width={800} height={500} />
          <button onClick={startCapture}>{capturing ? "Capturing..." : "Start Capture"}</button>
          {facesDetected !== 1 && <p>Ensure only one face is visible.</p>}
        </>
      ) : (
        <>
          {capturedImages.map((img, i) => <img key={i} src={img} alt={`capture ${i}`} width={128} />)}
          <button onClick={sendCapturedImages}>Submit</button>
        </>
      )}
    </div>
  );
}
