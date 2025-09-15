import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function NewFaceDetails(){
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        first_name: '', 
        last_name: '', 
        dob: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async(e) => {
        e.preventDefault(); 

        const res = await fetch('http://localhost:5000/add-person', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(formData)
        })

        if(res.ok){
            const person = await res.json(); 
            navigate(`/new-face/capture?person_id=${person.id}`);
        }
        else{
            console.error("Failed to add person.");
        }
    }

    return(
        <div className="details-form">
            <form onSubmit={handleSubmit}>
                <h1>Enter your details.</h1>
                <div className="input">
                    <p>First Name</p>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input">
                    <p>Last Name</p>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input">
                    <p>Birthdate</p>
                    <input 
                        type="date"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit">Submit Information</button>
            </form>
        </div>
    )
}