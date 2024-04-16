import React, { useState } from 'react';
import { OpenAIChatMessage, OpenAISystemMessage, OpenAIConfig } from '@/utils/OpenAI';

interface History {
  [key: string]: {
    name: string;
    systemMessage: OpenAISystemMessage;
    messages: OpenAIChatMessage[];
    config: OpenAIConfig;
    lastMessage: number;
  };
}

interface ExportDataComponentProps {
  data: History;
}

const ExportDataComponent: React.FC<ExportDataComponentProps> = ({ data }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isChecked = event.target.checked;
    setSelectedIds(prev => isChecked ? [...prev, value] : prev.filter(id => id !== value));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const exportData = () => {
    const exportObject = selectedIds.reduce((acc: History, id: string) => {
      if (data[id]) {
        acc[id] = data[id];
      }
      return acc;
    }, {});
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exported_data.json';
    link.click();
    URL.revokeObjectURL(url);
    closeModal();
  };

  return (
    <div 
      className="flex items-center gap-3 rounded p-3 transition-colors hover:bg-gray-500/10"
    >
      <button onClick={openModal}>Select Data to Export</button>
      <Modal isOpen={isModalOpen} onClose={closeModal} onConfirm={exportData}>
        <h3>Select Data to Export</h3>
        <div>
          {Object.keys(data).map((id) => (
            <div key={id}>
              <input
                type="checkbox"
                value={id}
                onChange={handleSelectChange}
                checked={selectedIds.includes(id)}
              /> {id}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: 20, backgroundColor: 'white', borderRadius: 10, color: 'black' }}> {/* 添加 color: 'black' 以确保所有文本都是黑色 */}
        {children}
        <div>
          <button 
            onClick={onConfirm} 
            style={{ backgroundColor: 'black', color: 'white', marginRight: 10, padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
          >
            Export
          </button>
          <button 
            onClick={onClose} 
            style={{ backgroundColor: 'black', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
  
  
};

export default ExportDataComponent;
