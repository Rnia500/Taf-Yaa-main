import React, { useState } from 'react';
import "./Upload.css";

function Upload() {
    const[Image, setImage] = useState(null);

    const handleImageChange = (e) => {
        setImage(URL.createObjectURL(e.target.files[0]));
    };

    return (
        <div className="container">
            <label className="image-upload-container" htmlFor="imageUpload">
                <input type="file" className='image-upload-input' accept="image/*" onChange={handleImageChange} />
                <div className='image-preview' style={{ backgroundImage: Image ? `url(${Image})` : 'none' }} >
                    {!Image && ( <span className='upload-text'>Upload Photo</span>)}
                </div>
            </label>
        </div>
    );
}

export default Upload;