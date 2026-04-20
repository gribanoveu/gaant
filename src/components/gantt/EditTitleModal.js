import React from 'react';
import Modal from '../common/Modal';

const EditTitleModal = ({ title, onChange, onSave, onCancel }) => (
  <Modal
    title="Изменить название документа"
    onClose={onCancel}
    footer={
      <>
        <button
          onClick={onSave}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
          Отмена
        </button>
      </>
    }>
    <div>
      <input
        type="text"
        value={title}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Введите название документа"
        autoFocus
      />
    </div>
  </Modal>
);

export default EditTitleModal;
