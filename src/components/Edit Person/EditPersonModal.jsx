import React from 'react';
import useModalStore from '../../store/useModalStore';
import EditPersonController from '../../controllers/form/EditPersonController';
import '../../styles/AddRelativeModal.css';
import { X } from 'lucide-react';
import Card from '../../layout/containers/Card';

const EditPersonModal = ({ personId, onClose }) => {
  const { modals, closeModal } = useModalStore();
  const isOpen = modals.editPerson || false;

  const handleSuccess = (result) => {
    if (onClose) onClose(result);
    closeModal('editPerson');
  };

  const handleClose = () => {
    closeModal('editPerson');
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
          <h2 className="modal-title">Edit Person</h2>
        </div>

        <div className="modal-body">
          {personId && (
            <EditPersonController
              personId={personId}
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPersonModal;
