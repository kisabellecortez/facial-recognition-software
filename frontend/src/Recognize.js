import './App.css';
import React, { useState } from 'react'

const Recognize = () => {
  const [image, setImage] = useState("");

  const changeImage = (e) => {
    const file = e.target.files[0];

    if(file){
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  }

    return (
        <div className="page">
        <h1>Upload your image.</h1>
        <div className="dropbox">
            <input
            type="file"
            id="image"
            accept="image/png"
            onChange={changeImage}
            />
            <img src="/image-file.svg" alt="file"></img>
            <p>Supports PNG</p>
        </div>
        <img src={image} alt="uploaded"></img>
        </div>
    );
}

export default Recognize; 