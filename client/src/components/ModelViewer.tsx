import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

interface ModelProps {
  modelPath: string | null;
}

const Model = ({ modelPath }: ModelProps) => {
  const { scene } = useGLTF(modelPath || '') as any;
  return <primitive object={scene} />;
};

export default function ModelViewer({ modelPath }: ModelProps) {
  if (!modelPath) return null;

  return (
    <Canvas style={{ height: '100vh', width: '100vw', background: '#222' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Model modelPath={modelPath} />
      <OrbitControls />
    </Canvas>
  );
};