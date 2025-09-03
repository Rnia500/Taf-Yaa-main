import React from "react";
import useModalStore from '../../../store/useModalStore';
import AddChildController from "../../../controllers/treeController/AddChildController";
import '../../../styles/AddRelativeModal.css';
import Card from "../../../layout/containers/Card";
import { X } from "lucide-react";

export default function AddChildModal({ onSuccess }) {
  const { modals, modalData, closeModal } = useModalStore();
  const isOpen = modals.addChildModal || false;
  const { targetNodeId } = modalData.addChildModal || {};

  const handleClose = () => {
    closeModal('addChildModal');
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
          <h2 className="modal-title">Add Child</h2>
        </div>
        <div className="modal-body">
          {targetNodeId && (
            <AddChildController
              treeId="tree001"
              parentId={targetNodeId}
              onSuccess={(child) => {
                if (onSuccess) onSuccess(child);
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
