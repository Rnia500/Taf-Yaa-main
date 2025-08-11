import React from 'react';
import '../styles/SelectDropdown.css';

function SelectDropdown({ label, options = [], value, onChange }) {
  return (
    <div className="select-wrapper">
      {label && <label className="select-label">{label}</label>}
      <select className="select-field" value={value} onChange={onChange}>
        <option value=""> Select an option </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectDropdown;
