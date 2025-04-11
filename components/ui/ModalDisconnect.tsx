

import React from "react";
import ReactDOM from "react-dom";

type ModalProps = {
  children: React.ReactNode;
};

const ModalDisconnect: React.FC<ModalProps> = ({ children }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {children}
    </div>,
    document.body
  );
};

export default ModalDisconnect;
