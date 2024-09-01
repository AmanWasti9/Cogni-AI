import React from "react";
import { PerspectiveCamera, Center, Text3D, Resize } from "@react-three/drei";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

function BadgeTexture(user) {
  // Define your variables here
  const planeWidth = 4; // Example value
  const textureAspect = 1.5; // Example value
  const resizeId = "uniqueId123"; // Example unique ID

  // Load the texture using useLoader
  const texture = useLoader(
    THREE.TextureLoader,
    "/assets_incase/logo-flip.png"
  );

  return (
    <>
      <PerspectiveCamera
        makeDefault
        manual
        aspect={1.05}
        position={[0.49, 0.22, 2]}
      />

      <mesh>
        <planeGeometry args={[planeWidth, -planeWidth / textureAspect]} />
        <meshBasicMaterial color={"black"} side={THREE.BackSide} />
      </mesh>

      <Center>
        <Resize key={resizeId} maxHeight={0.45} maxWidth={0.8}>
          <group position={[0, 0.5, 0]}>
            <mesh position={[0, -3, 0]} rotation={[0, 0, Math.PI]}>
              <planeGeometry args={[5, 4]} />
              <meshBasicMaterial map={texture} />
            </mesh>
            <Center top={[10]}>
              <Text3D
                bevelEnabled={false}
                bevelSize={0}
                font="/assets_incase/poppins-bold.json"
                height={0.1}
                scale={[0.7, 1, 0.7]}
                position={[0, 0.3, 0]} // Adjust Y position
                rotation={[0, Math.PI, Math.PI]}
              >
                {"Thank you"}
              </Text3D>
              <Text3D
                bevelEnabled={false}
                bevelSize={0}
                font="/assets_incase/poppins-bold.json"
                height={0.1}
                scale={[0.7, 1, 0.7]}
                position={[2, 1.8, 0]} // Adjust Y position
                rotation={[0, Math.PI, Math.PI]}
              >
                {"for"}
              </Text3D>
              <Text3D
                bevelEnabled={false}
                bevelSize={0}
                font="/assets_incase/poppins-bold.json"
                height={0.1}
                scale={[0.7, 1, 0.7]}
                position={[0, 3.2, 0]} // Adjust Y position
                rotation={[0, Math.PI, Math.PI]}
              >
                {"joining us!"}
              </Text3D>
            </Center>
          </group>
        </Resize>
      </Center>
    </>
  );
}

export default BadgeTexture;
