import React, { useState } from 'react';
import { OpenAIChatMessage, OpenAISystemMessage, OpenAIConfig } from '@/utils/OpenAI';
import History from './ExportData';

interface ImportDataComponentProps {
  onDataImported: (data: History) => void;
}

const ImportDataComponent: React.FC<ImportDataComponentProps> = ({ onDataImported }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("No result");
          }
          const newData = JSON.parse(e.target.result as string) as History;
          onDataImported(newData);
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a JSON file.");
    }
  };

  return (
    <div>
      <h3>Import Data from JSON File</h3>
      <input type="file" onChange={handleFileChange} accept="application/json" />
    </div>
  );
};

export default ImportDataComponent;

