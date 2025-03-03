import * as React from 'react';
import { Button, Typography } from '@mui/material';

interface ModelUploadProps {
  onModelUpload: (modelPath: string) => void;
}

export default function ModelUpload({ onModelUpload }: ModelUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          const blob = new Blob([e.target.result], { type: file.type });
          const url = URL.createObjectURL(blob);
          onModelUpload(url);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <Typography variant="h6">Загрузите модель</Typography>
      <input type="file" accept=".glb,.gltf" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file}>
        Загрузить
      </Button>
    </div>
  );
};