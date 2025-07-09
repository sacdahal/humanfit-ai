import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';

function TryonModel({ meshUrl }) {
  const { scene } = useGLTF(meshUrl);
  return <primitive object={scene} />;
}

export default function TryonViewer({ meshUrl, fallbackImage, style }) {
  return (
    <div style={{ width: '100%', height: '500px', background: '#222', ...style }}>
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        <Suspense fallback={fallbackImage ? <img src={fallbackImage} alt="Try-on preview" /> : null}>
          <TryonModel meshUrl={meshUrl} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
