import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function Recognize() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faces, setFaces] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // Fetch faces and precompute descriptors
  useEffect(() => {
    const fetchFaces = async () => {
      try {
        const res = await fetch("http://localhost:5000/get-faces");
        const data = await res.json();
        setFaces(data);

        const descriptors = await Promise.all(
          data.map(async (face) => {
            const img = new Image();
            img.src = face.image;
            await img.decode();

            const detection = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              return new faceapi.LabeledFaceDescriptors(
                `${face.first_name} ${face.last_name}`,
                [detection.descriptor]
              );
            } else {
              return null;
            }
          })
        );

        setLabeledDescriptors(descriptors.filter(ld => ld !== null));
      } catch (err) {
        console.error("Failed to fetch faces:", err);
      }
    };

    if (modelsLoaded) fetchFaces();
  }, [modelsLoaded]);

  // Run recognition
  useEffect(() => {
    if (!modelsLoaded || labeledDescriptors.length === 0) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    faceapi.matchDimensions(canvas, { width: video.width, height: video.height });

    const intervalId = setInterval(async () => {
      if (video.readyState === 4) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, {
          width: video.width,
          height: video.height,
        });

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        if (resizedDetections.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
          resizedDetections.forEach(det => {
            const match = faceMatcher.findBestMatch(det.descriptor);
            const box = det.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: match.toString() });
            drawBox.draw(canvas);
          });
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [modelsLoaded, labeledDescriptors]);

  return (
    <div style={{ position: "relative", width: 800, height: 500 }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "user" }}
        width={800}
        height={500}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
        width={800}
        height={500}
      />
    </div>
  );
}
