import React from "react";
import Modal from "./Modal";

type ViewIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ViewIncomeModal = ({ isOpen, onClose }: ViewIncomeModalProps) => {
  return (
    <Modal
      title={`Add Income`}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    > 
    </Modal>
  );
};

export default ViewIncomeModal;
