import React from 'react';
import '../../styles/Modal.css';
import Button from '../../components/Button';
import Card from './Card';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, className, style }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={style}>
      <div className={`modal-box ${className || ''}`}>
        <Card 
          positionType='absolute' 
          position='top-right' 
          margin='10px 10px 0px 0px' 
          size={35} 
          backgroundColor='var(--color-danger)' 
          onClick={onClose}
        >
          <X size={15} color="var(--color-black)" />
        </Card>
        
          {children}
        
      </div>
    </div>
  );
};

export default Modal;
