import * as React from 'react';
import { Box, Stack, Container } from '@mui/material';

import ModelViewer from '@components/ModelViewer';
import ModelUpload from '@components/ModelUpload';

export default function Model() {
  const [modelPath, setModelPath] = React.useState<string | null>(null);

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
}