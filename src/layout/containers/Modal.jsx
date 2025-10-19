import React from 'react';
import ReactDOM from 'react-dom';
import '../../styles/modal.css';
import Button from '../../components/Button';
import Card from './Card';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, maxHeight = '80vh', maxWidth = '50', style, showCLoseIcon = true }) => {
  if (!isOpen) return null;

  const combinedStyle = {
    maxHeight,
    maxWidth,
    overflowY: 'auto',
    ...style
  }

  return ReactDOM.createPortal(
    <div className="default-modal-overlay">
      <div className="default-modal-box" style={combinedStyle}>
        {showCLoseIcon && <Card positionType='absolute' position='top-right' margin='10px 10px 0px 0px' size={35} backgroundColor='var(--color-danger)' onClick={onClose}><X size={15} color="var(--color-black)"  /></Card>}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
