import React from 'react';
import '../styles/DateInput.css';

function DateInput({ label, value, onChange }) {
  return (
    <div className="date-wrapper">
      {label && <label className="date-label">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="date-field"
      />
    </div>
  );
}

export default DateInput;
