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

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isChecked = event.target.checked;
    setSelectedIds(prev => isChecked ? [...prev, value] : prev.filter(id => id !== value));
  };

  const exportData = () => {
      const exportObject = selectedIds.reduce((acc: History, id: string) => {
        if (data[id]) {
          acc[id] = data[id];
        }
        return acc;
      }, {});
      const blob = new Blob ([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'exported_data.json';
      link.click();
      URL.revokeObjectURL(url);
    };

  return (
    <div>
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
      <button onClick={exportData}>Export Selected Data</button>
    </div>
  );
};

export default ExportDataComponent;
