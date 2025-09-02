// src/components/Modals/GlobalModals.jsx
import React from "react";
import { modalRegistry } from "../components/registry/ModalRegistry";
import useModalStore from "../store/useModalStore";

export default function GlobalModals() {
  const { modals, modalData, closeModal } = useModalStore();

  return (
    <>
      {Object.entries(modalRegistry).map(([key, ModalComponent]) => {
        const isOpen = modals[key];
        const data = modalData[key] || {};

        if (!isOpen) return null;

        return (
          <ModalComponent
            key={key}
            isOpen={isOpen}
            {...data}
            onClose={() => closeModal(key)}
          />
        );
      })}
    </>
  );
}
