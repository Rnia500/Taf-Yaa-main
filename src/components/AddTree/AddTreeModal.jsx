import React from "react";
import useModalStore from '../../store/useModalStore';
import TreeCreationController from "../../controllers/form/TreeCreationController";
import '../../styles/AddRelativeModal.css';
import { X } from 'lucide-react';
import Card from '../../layout/containers/Card';


export default function AddTreeModal({ createdBy, onSuccess }) {
  const { modals, closeModal } = useModalStore();
  const isOpen = modals.treeModal || false;

  const handleSuccess = (result) => {
    if (onSuccess) onSuccess(result);
    closeModal('treeModal');
  };

  const handleClose = () => {
    closeModal('treeModal');
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
          <h2 className="modal-title">
            Create New Family Tree
          </h2>
        </div>

        <div className="modal-body">
          <TreeCreationController
            createdBy={createdBy}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
