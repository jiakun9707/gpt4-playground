import React, { useState } from 'react';
import { OpenAIChatMessage, OpenAISystemMessage, OpenAIConfig } from '@/utils/OpenAI';
import History from './ExportData';

interface ImportDataComponentProps {
  onDataImported: (data: History) => void;
}


const ImportDataComponent: React.FC<ImportDataComponentProps> = ({ onDataImported }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setFileName(file.name); // Set the file name
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("No result");
          }
          const newData = JSON.parse(e.target.result as string);
          
          // Merge with existing data in localStorage
          const existingDataRaw = localStorage.getItem('pg-history');
          const existingData = existingDataRaw ? JSON.parse(existingDataRaw) : {};
          
          // Only add non-duplicate keys
          const mergedData = {...existingData};
          Object.keys(newData).forEach(key => {
            if (!existingData.hasOwnProperty(key)) {
              mergedData[key] = newData[key];
            }
          });
          // Save the merged data back to localStorage
          localStorage.setItem('pg-history', JSON.stringify(mergedData));
          onDataImported(mergedData); // Optionally trigger a callback with the new data
          alert('Data imported successfully!');
          //flash page
          window.location.reload();
        } catch (error) {
          alert("Invalid JSON file");
          setFileName(null); // Reset file name if there is an error
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a JSON file.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-3 transition-colors hover:bg-gray-500/10 rounded">
      <h3>{fileName ? `Imported File: ${fileName}` : "Import Data"}</h3>
      <label className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <span>{fileName ? "Change File" : "Upload File"}</span>
        <input
          type="file"
          onChange={handleFileChange}
          accept="application/json"
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};


export default ImportDataComponent;

