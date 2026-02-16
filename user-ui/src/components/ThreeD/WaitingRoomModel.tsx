import { Suspense, useEffect, useRef, useState, useCallback} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { Box3, Vector3, DoubleSide, Euler } from 'three';
import type { RootState } from '@react-three/fiber';
import { WaitingRoomInstructionsModal } from './WaitingRoomInstructionsModal';
import { WaitingRoomLoader } from './WaitingRoomLoader';


// This will be resolved by Vite
import waitingRoomModelPath from '../../assets/3D/waitingRoom.glb?url';
import waitingSoundPath from '../../assets/waitingSound.mp3?url';

interface ModelProps {
  onCenterCalculated: (center: Vector3) => void;
}

function Model({ onCenterCalculated, ...props }: ModelProps & any) {
  const { scene } = useGLTF(waitingRoomModelPath);
  const groupRef = useRef<any>(null);
  const [modelOffset, setModelOffset] = useState<Vector3 | null>(null);
  
  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    const size = new Vector3();
    box.getSize(size);
    
    console.log('Model Center:', center);
    console.log('Model Bounds:', box.min, box.max);
    console.log('Model Size:', size);
    
    // Calculate offset to move model center to origin
    // We want the center X and Z at origin, but Y at floor level
    const offset = new Vector3(
      -center.x,
      -box.min.y, // Move floor to y=0
      -center.z
    );
    setModelOffset(offset);
    
    console.log('Model Offset applied:', offset);
    onCenterCalculated(center);

    // Enable double-sided rendering for interior viewing while preserving materials
    scene.traverse((child: any) => {
      if (child.isMesh) {
        // Handle both single materials and material arrays
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat: any) => {
            const clonedMat = mat.clone();
            clonedMat.side = DoubleSide;
            return clonedMat;
          });
        } else if (child.material) {
          // Clone material to avoid modifying shared materials
          child.material = child.material.clone();
          child.material.side = DoubleSide;
        }
        
        // Log material info for debugging
        console.log('Mesh:', child.name, 'Material:', child.material?.name || 'unnamed', 
          'Color:', child.material?.color, 'Map:', child.material?.map ? 'has texture' : 'no texture');
      }
    });
  }, [scene, onCenterCalculated]);

  return (
    <group ref={groupRef} position={modelOffset ? [modelOffset.x, modelOffset.y, modelOffset.z] : [0, 0, 0]} {...props}>
      <primitive object={scene} />
    </group>
  );
}

// First-person movement controller
function FirstPersonController({ isEnabled = true }: { isEnabled?: boolean }) {
  const { camera } = useThree();
  const moveSpeed = 0.1;
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'KeyP':
          // Log current position for debugging
          console.log('📍 CURRENT CAMERA POSITION:', {
            x: camera.position.x.toFixed(2),
            y: camera.position.y.toFixed(2),
            z: camera.position.z.toFixed(2)
          });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEnabled]);

  useFrame(() => {
    if (!isEnabled) return;
    
    const direction = new Vector3();
    const frontVector = new Vector3();
    const sideVector = new Vector3();

    camera.getWorldDirection(direction);
    direction.y = 0; // Keep movement horizontal
    direction.normalize();

    frontVector.copy(direction);
    sideVector.crossVectors(camera.up, direction);

    if (keys.current.forward) camera.position.addScaledVector(frontVector, moveSpeed);
    if (keys.current.backward) camera.position.addScaledVector(frontVector, -moveSpeed);
    if (keys.current.left) camera.position.addScaledVector(sideVector, moveSpeed);
    if (keys.current.right) camera.position.addScaledVector(sideVector, -moveSpeed);

    // Constrain Z movement
    // Range: [-6.48, 0.00]
    camera.position.z = Math.max(-6.48, Math.min(0.00, camera.position.z));
  });

  return null;
}

// Drag-based look controls - works immediately without click
function DragLookControls({ isEnabled = true }: { isEnabled?: boolean }) {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const sensitivity = 0.005;
  const isInitialized = useRef(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isEnabled) return;
      if (e.button === 0) { // Left click
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
        
        // Initialize euler from camera on first interaction
        if (!isInitialized.current) {
          euler.current.setFromQuaternion(camera.quaternion);
          isInitialized.current = true;
        }
        
        gl.domElement.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      gl.domElement.style.cursor = 'grab';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      
      previousMouse.current = { x: e.clientX, y: e.clientY };

      // Drag to look: drag left = look left, drag up = look up
      euler.current.y -= deltaX * sensitivity;
      euler.current.x -= deltaY * sensitivity;
      
      // Clamp vertical rotation to avoid flipping
      euler.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.current.x));
      
      camera.quaternion.setFromEuler(euler.current);
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      gl.domElement.style.cursor = 'grab';
    };

    // Use window for mouse events to capture even when mouse moves outside canvas
    gl.domElement.style.cursor = 'grab';
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [camera, gl, isEnabled]);

  return null;
}

function CameraHandler({ shouldReset }: { shouldReset: boolean }) {
  const { camera } = useThree();
  const resetDone = useRef(false);

  useEffect(() => {
    if (shouldReset && !resetDone.current) {
      camera.position.set(-6.51, 1.60, -0.54);
      camera.lookAt(new Vector3(0, 1.6, 0)); // Look towards center roughly, or just keep rotation
      // Actually obtaining the correct rotation might be tricky without storing it.
      // But just resetting position is what was asked. The rotation should probably also be reset or set to a good initial view.
      // Let's set a neutral look direction or just position.
      // If we want to force the rotation we can do:
      // camera.rotation.set(0, Math.PI, 0); 
      resetDone.current = true;
    }
  }, [shouldReset, camera]);

  return null;
}

// Cleanup component that disposes resources on unmount
function SceneCleanup() {
  const { gl, scene } = useThree();

  useEffect(() => {
    return () => {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => mat.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      gl.dispose();
    };
  }, [gl, scene]);

  return null;
}

export function WaitingRoomModel() {
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const audio = new Audio(waitingSoundPath);
    audio.loop = true;
    audio.volume = 0.5;

    if (!showInstructions) {
      audio.play().catch(e => console.log("Audio play failed:", e));
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [showInstructions]);

  const handleCreated = useCallback((state: RootState) => {
    state.gl.getContext().canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    });
  }, []);

  return (
    <div className="w-full h-full absolute inset-0">

      <Canvas
        shadows
        camera={{
          position: [-6.51, 1.60, -0.54],
          fov: 75,
          near: 0.01,
        }}
        onCreated={handleCreated}
      >
        <SceneCleanup />
        <CameraHandler shouldReset={!showInstructions} />
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 3, 0]} intensity={1.5} distance={15} decay={2} />
        <pointLight position={[3, 2, 3]} intensity={0.8} />
        <pointLight position={[-3, 2, -3]} intensity={0.8} />
        <hemisphereLight intensity={0.5} />
        
        <Suspense fallback={null}>
          <Model onCenterCalculated={() => {}} />
          <Environment preset="apartment" />
        </Suspense>
        
        <FirstPersonController isEnabled={!showInstructions} />
        <DragLookControls isEnabled={!showInstructions} />
      </Canvas>
      

      
      <WaitingRoomInstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
      
      <WaitingRoomLoader />
    </div>
  );
}

useGLTF.preload(waitingRoomModelPath);

