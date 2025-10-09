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

        console.log(`GlobalModals: key=${key}, isOpen=${isOpen}, data=`, data);

        if (!isOpen) return null;

        console.log(`Rendering modal: ${key}`);

        return (
          <ModalComponent
            key={key}
            isOpen={isOpen}
            {...data}
            onClose={() => closeModal(key)}
            onConfirm={data.onConfirm}
            onCancel={data.onCancel}
          />
        );
      })}
    </>
  );
}
