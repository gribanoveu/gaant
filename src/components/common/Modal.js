import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">{children}</div>

      {footer && <div className="flex gap-3 mt-6">{footer}</div>}
    </div>
  </div>
);

export default Modal;
