import React from 'react';
import '../styles/FileUpload.css';

function FileUpload({ onChange }) {
  return (
    <div className="file-upload">
      <label htmlFor="file-input">Choose a file</label>
      <input type="file" id="file-input" onChange={onChange} />
    </div>
  );
}

export default FileUpload;
