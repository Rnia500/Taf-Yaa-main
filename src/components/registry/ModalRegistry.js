// src/components/Modals/modalRegistry.js
import AddSpouseModal from "../Add Relatives/Spouse/AddSpouseModal";
import AddChildModal from "../Add Relatives/Child/AddChildModal";
import AddParentModal from "../Add Relatives/Parent/AddParentModal";
import TreeModal from "../AddTree/TreeModal";
import ConfirmationModal from "../modals/ConfirmationModal";

export const modalRegistry = {
  addSpouseModal: AddSpouseModal,
  addChildModal: AddChildModal,
  addParentModal: AddParentModal,
  treeModal: TreeModal,
  confirmationModal: ConfirmationModal,
};
