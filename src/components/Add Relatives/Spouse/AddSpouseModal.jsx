// AddSpouseModal.jsx
import React from "react";
import useModalStore from '../../../store/useModalStore';
import AddSpouseController from "../../../controllers/treeController/AddSpouseController";
import '../../../styles/AddRelativeModal.css';
import { X } from 'lucide-react';
import Card from '../../../layout/containers/Card';

export default function AddSpouseModal({ targetNodeId, partnerName, onSuccess }) {
  const { closeModal } = useModalStore();

  const handleSuccess = (result) => {
    if (onSuccess) onSuccess(result);
    closeModal('addSpouseModal');
  };

  return (
    <div className="modal-overlay" onClick={() => closeModal('addSpouseModal')}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <Card
          fitContent
          positionType='absolute'
          borderRadius='15px'
          backgroundColor="var(--color-danger)"
          margin='15px 15px 0px 0px'
          position='top-right'
          style={{ zIndex: 10 }}
          onClick={() => closeModal('addSpouseModal')}
        >
          <X size={24} color="white" />
        </Card>

        <div className="modal-header">
          <h2 className="modal-title">
            {partnerName
              ? `Add New Spouse for ${partnerName}`
              : "Add New Spouse"}
          </h2>
        </div>

        <div className="modal-body">
          {targetNodeId && (
            <AddSpouseController
              treeId="tree001"
              existingSpouseId={targetNodeId}
              onSuccess={handleSuccess}
              onCancel={() => closeModal('addSpouseModal')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
