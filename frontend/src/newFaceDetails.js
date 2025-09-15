import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useNavigate } from 'react-router-dom';

export default function NewFaceDetails(){
    const navigate = useNavigate(); 
    const webcamRef = useRef(null);
    const [fname, setFname] = useState(""); 
    const [lname, setLname] = useState(""); 
    const [birthday, setBirthday] = useState("")
    const [canCapture, setCanCapture] = useState(false); 
    const [facesDetected, setFacesDetected] = useState(0);
    const [capturedImages, setCapturedImages] = useState([]); 
    const [capturing, setCapturing] = useState(false); 
    const [captured, setCaptured] = useState(false); 
    const countRef = useRef(0);

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
    }

    const sendCapturedImages = async () => {
        try{
            const response = await fetch("http://localhost:5000/upload-multiple", {
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ images: capturedImages })
        })
            const data = await response.json(); 
            alert(data.message); 
            } 
        catch(err){
            console.error("Error: ", err); 
        }
    }

    return(
        <div className="form-parent">
            <div className="form-child-1">
                <form>
                <h1>Enter your details.</h1>
                    <div className="input">
                        <p>First Name</p>
                        <input
                            type="text"
                            id="fname"
                            name="fname"
                            onChange={(e) => setFname(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input">
                        <p>Last Name</p>
                        <input
                            type="text"
                            id="lname"
                            name="lname"
                            onChange={(e) => setLname(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input">
                        <p>Birthdate</p>
                        <input 
                            type="date"
                            id="birthdate"
                            name="birthdate"
                            onChange={(e) => setBirthday(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        onClick={() => {setCanCapture(true)}}
                    >Submit Information</button>
                </form>
            </div>

                <div className="form-child-2">
                    {(!captured && canCapture) ? (
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
                            {(capturedImages.length > 0 && canCapture) && (
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
                            >Submit New Face</button>
                        </div>
                    )}

                </div>
        </div>
    )
}