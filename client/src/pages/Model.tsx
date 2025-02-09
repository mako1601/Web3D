import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ModelViewer from '../components/ModelViewer';
import ModelUpload from '../components/ModelUpload';

export default function Model() {
  const [modelPath, setModelPath] = useState<string | null>(null);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <ModelUpload onModelUpload={setModelPath} />
          <ModelViewer modelPath={modelPath} />
        </Stack>
      </Box>
    </Container>
  );
};