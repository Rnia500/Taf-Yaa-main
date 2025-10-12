import React from "react";
import useModalStore from '../../store/useModalStore';
import TreeCreationController from "../../controllers/form/TreeCreationController";
import '../../styles/AddRelativeModal.css';
import { X } from 'lucide-react';
import Card from '../../layout/containers/Card';


export default function AddTreeModal({ createdBy, onSuccess, isEdit = false, treeToEdit = null, onCancel }) {
  console.log('AddTreeModal rendered with:', { createdBy, onSuccess, isEdit, treeToEdit, onCancel });
  const { closeModal } = useModalStore();
  const title = isEdit ? 'Edit Family Tree' : 'Create New Family Tree';

  const handleSuccess = (result) => {
    if (onSuccess) onSuccess(result);
    if (onCancel) onCancel(); else closeModal('treeModal');
  };

  const handleClose = () => {
    if (onCancel) onCancel(); else closeModal('treeModal');
  };



  if (onCancel) {
    return (
      <Card
        fitContent
        borderRadius='15px'
        backgroundColor="var(--color-background)"
        margin='20px 0px'
        padding='20px'
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {title}
          </h2>
        </div>
        <div className="modal-body">
          <TreeCreationController
            createdBy={createdBy}
            onSuccess={handleSuccess}
            onCancel={handleClose}
            isEdit={isEdit}
            treeToEdit={treeToEdit}
            
          />
        </div>
      </Card>
    );
  }

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
            {title}
          </h2>
        </div>

        <div className="modal-body">
          <TreeCreationController
            createdBy={createdBy}
            onSuccess={handleSuccess}
            onCancel={handleClose}
            isEdit={isEdit}
            treeToEdit={treeToEdit}
          />
        </div>
      </div>
    </div>
  );
}
