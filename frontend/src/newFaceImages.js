import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useNavigate } from 'react-router-dom';

export default function NewFaceImages(){
    const navigate = useNavigate(); 
    const webcamRef = useRef(null);
    const [facesDetected, setFacesDetected] = useState(0);
    const [capturedImages, setCapturedImages] = useState([]); 
    const [capturing, setCapturing] = useState(false); 
    const [captured, setCaptured] = useState(false); 
    const countRef = useRef(0);

    const params = new URLSearchParams(window.location.search); 
    const person_id = params.get('person_id')

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = process.env.PUBLIC_URL + "/models";
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        };

        loadModels();
    }, []);

    useEffect(() => {
        if(!capturing){
        return; 
        }

        const interval = setInterval(async() => {
            if(webcamRef.current && webcamRef.current.video.readyState === 4){
                const detections = await faceapi.detectAllFaces(
                    webcamRef.current.video, 
                    new faceapi.TinyFaceDetectorOptions()
                )

                setFacesDetected(detections.length); 

                if(detections.length === 1 && capturing){
                    const imageSrc = webcamRef.current.getScreenshot(); 
                    setCapturedImages(prev => [...prev, imageSrc]); 
                    countRef.current++; 

                    if(countRef.current >= 50){
                        clearInterval(interval);
                        setCapturing(false); 
                        setCaptured(true); 
                    }
                }
            }
        }, 500)

        return () => {
            clearInterval(interval); 
        }
    }, [capturing])

    const startCapture = () => {
        setCaptured(false); 
        setCapturing(true); 
        setCapturedImages([]); 
        countRef.current = 0; 
    }

    const sendCapturedImages = async () => {
        if(!person_id){
            console.log("No person_id found."); 
            return; 
        }

        try{
            const response = await fetch("http://localhost:5000/upload-captures", {
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ images: capturedImages })
        })
            const data = await response.json(); 
            navigate('/') 
        } 
        catch(err){
            console.error("Error: ", err); 
        }
    }

    return(
        <div className="captures-form">
            {!captured ? (
                <div>
                    <h1>Slowly move your head in circles to capture all angles of your face.</h1>

                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{facingMode: "user"}}
                        style={{width: 800, height: 500}}
                    />

                    {facesDetected !== 1 && <p>Make sure only one face is in the camera.</p>}

                    <button 
                        type="button"
                        onClick={startCapture}
                        disabled={capturing}
                    >
                        {capturing ? "Capturing..." : "Start Capture (5s)"}
                    </button>
                </div>
            ) : (
                <div className="captured-images">
                    {(capturedImages.length > 0) && (
                        <div>
                        {capturedImages.map((img, index) => (
                            <img
                            key={index}
                            src={img}
                            alt={`Captured ${index}`} 
                            />
                        ))}
                        </div>
                    )}

                    <button 
                        onClick={() => {
                            setCaptured(false); 
                            setCapturedImages([]);
                            countRef.current = 0; 
                        }}
                    >Retake Photos</button>

                    <button
                        onClick={sendCapturedImages}
                    >Submit Captures</button>
                </div>
            )}
        </div>
    )
}