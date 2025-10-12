// src/components/Modals/AddParentModal.jsx
import React from "react";
import useModalStore from '../../../store/useModalStore';
import AddParentController from "../../../controllers/form/AddParentController";
import '../../../styles/AddRelativeModal.css';
import Card from "../../../layout/containers/Card";
import { X } from "lucide-react";


export default function AddParentModal({ onSuccess, treeId }) {
  const { modals, modalData, closeModal } = useModalStore();
  const isOpen = modals.addParentModal || false;
  const { targetNodeId } = modalData.addParentModal || {};

  const handleClose = () => {
    closeModal('addParentModal');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <Card
          fitContent
          positionType='absolute'
          borderRadius='15px'
          backgroundColor="var(--color-danger)"
          margin='15px 15px 0px 0px'
          position='top-right'
          style={{ zIndex: 10 }}
          onClick={handleClose}
        >
          <X size={24} color="white" />
        </Card>
        

        <div className="modal-header">
          <h2 className="modal-title">Add Parent</h2>
        </div>
        
        <div className="modal-body">
          {targetNodeId && (
            <AddParentController
              treeId={treeId}
              childId={targetNodeId}
              onSuccess={(result) => {
                if (onSuccess) onSuccess(result);
                handleClose();
              }}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}