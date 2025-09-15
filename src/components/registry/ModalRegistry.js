// src/components/Modals/modalRegistry.js
import AddSpouseModal from "../Add Relatives/Spouse/AddSpouseModal";
import AddChildModal from "../Add Relatives/Child/AddChildModal";
import AddParentModal from "../Add Relatives/Parent/AddParentModal";
import AddTreeModal from "../AddTree/AddTreeModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import EditPersonModal from "../Edit Person/EditPersonModal";

export const modalRegistry = {
  addSpouseModal: AddSpouseModal,
  addChildModal: AddChildModal,
  addParentModal: AddParentModal,
  addTreeModal: AddTreeModal,
  confirmationModal: ConfirmationModal,
  editPerson: EditPersonModal,
};
