import React from 'react';
import '../styles/Input.css';

export const TextInput = ({ label, value, onChange, placeholder, backgroundColor = "var(--color-transparent)", color = "var(--color-primary-text)", required }) => (
  <div className="input-group">
    {label && <label>{label}</label>}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="input"
      style={{ backgroundColor, color }}
    />
  </div>
);

export const SearchInput = ({ value, onChange, placeholder, onSearch, backgroundColor = "var(--color-transparent)", color = "var(--color-primary-text)" }) => (
  <div className="input-group search-input-group">
    <input
      type="search"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
      className="input search"
      onKeyDown={e => {
        if (e.key === 'Enter' && onSearch) {
          onSearch(value);
        }
      }}
      style={{ backgroundColor, color }}
    />
    {value ? (
      <span
        className="search-icon clear"
        onClick={() => onChange('')}
        role="button"
        tabIndex={0}
      >
        &#10006;
      </span>
    ) : (
      <span className="search-icon">&#128269;</span>
    )}
  </div>
);

export const TextArea = ({ label, value, onChange, placeholder, backgroundColor = "var(--color-transparent)", color = "var(--color-primary-text)" }) => (
  <div className="input-group">
    {label && <label>{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="textarea"
      style={{ backgroundColor, color }}
    />
  </div>
);
