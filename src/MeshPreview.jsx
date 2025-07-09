import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const MeshPreview = forwardRef(function MeshPreview({ meshUrl, textureUrl }, ref) {
  const mountRef = useRef();
  const requestRef = useRef();
  const meshRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const zoomRef = useRef(1.1); // initial scale

  // Fit-to-view logic
  const fitToView = () => {
    if (!meshRef.current || !cameraRef.current) return;
    // Compute bounding box
    const box = new THREE.Box3().setFromObject(meshRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    // Set camera distance so model fits nicely
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const viewDim = maxDim * 1.15; // add margin
    const distance = viewDim / (2 * Math.tan(fov / 2));
    cameraRef.current.position.z = distance;
    cameraRef.current.position.y = box.min.y + size.y / 2 + 0.1; // center vertically
    cameraRef.current.lookAt(0, box.min.y + size.y / 2, 0);
    // Center model
    meshRef.current.position.set(0, -box.min.y - size.y / 2, 0);
    // Reset zoom
    zoomRef.current = 1.1;
    meshRef.current.scale.set(zoomRef.current, zoomRef.current, zoomRef.current);
  };

  useImperativeHandle(ref, () => ({ fitToView }), [fitToView]);

  useEffect(() => {
    if (!meshUrl) return;
    // Remove previous renderer if it exists
    if (rendererRef.current && mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }
    // Scene setup
    const scene = new THREE.Scene();
    // Camera: adjust to fit full model in view
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 3.2; // farther back for full body
    camera.position.y = 0.8; // higher up
    camera.lookAt(0, 0.9, 0); // look at model center
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(900, 900); // Match preview area size
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting (add ambient for softer look)
    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Error handling
    let didCancel = false;
    const loader = new OBJLoader();
    loader.load(
      meshUrl,
      (object) => {
        if (didCancel) return;
        let mesh = object;
        meshRef.current = mesh;
        if (textureUrl) {
          const texLoader = new THREE.TextureLoader();
          texLoader.load(
            textureUrl,
            (texture) => {
              mesh.traverse((child) => {
                if (child.isMesh) child.material.map = texture;
              });
              scene.add(mesh);
              setTimeout(fitToView, 100); // fit after mesh loads
            },
            undefined,
            (err) => {
              scene.add(mesh);
              setTimeout(fitToView, 100);
            }
          );
        } else {
          scene.add(mesh);
          setTimeout(fitToView, 100);
        }
      },
      undefined,
      (err) => {
        // Show error overlay or fallback
        const errorDiv = document.createElement('div');
        errorDiv.innerText = 'Failed to load mesh.';
        errorDiv.style.color = 'salmon';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.position = 'absolute';
        errorDiv.style.width = '100%';
        mountRef.current.appendChild(errorDiv);
      }
    );

    // Interactive zoom handler
    const handleWheel = (e) => {
      e.preventDefault();
      if (!meshRef.current) return;
      let scale = zoomRef.current;
      if (e.deltaY < 0) scale *= 1.08;
      else scale /= 1.08;
      scale = Math.max(0.5, Math.min(3.5, scale));
      zoomRef.current = scale;
      meshRef.current.scale.set(scale, scale, scale);
    };
    mountRef.current.addEventListener('wheel', handleWheel, { passive: false });

    // Animation loop
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      didCancel = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current && mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (mountRef.current) {
        mountRef.current.removeEventListener('wheel', handleWheel);
      }
      meshRef.current = null;
    };
  }, [meshUrl, textureUrl]);

  return (
    <div style={{ position: 'relative', width: 900, height: 900, margin: '0 auto', overflow: 'hidden', cursor: 'grab' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} title="Scroll to zoom. Click 'Fit to Frame' to reset." />
    </div>
  );
});

export default MeshPreview;
