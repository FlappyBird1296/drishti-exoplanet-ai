import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Star({
    position = [0, 0, 0],
    scale = 1,
}) {
    const starRef = useRef();

    useFrame((state) => {
        if (!starRef.current) return;

        const time = state.clock.elapsedTime;

        const pulse =
            1 + Math.sin(time * 1.2) * 0.018;

        starRef.current.scale.setScalar(
            scale * pulse
        );

        starRef.current.rotation.y += 0.0005;
    });

    return (
        <group position={position}>

            {/* Outer atmosphere */}
            <mesh>
                <sphereGeometry
                    args={[1.55, 48, 48]}
                />

                <meshBasicMaterial
                    color="#ffd36b"
                    transparent
                    opacity={0.055}
                    depthWrite={false}
                />
            </mesh>

            {/* Inner glow */}
            <mesh>
                <sphereGeometry
                    args={[1.25, 48, 48]}
                />

                <meshBasicMaterial
                    color="#ffe28a"
                    transparent
                    opacity={0.10}
                    depthWrite={false}
                />
            </mesh>

            {/* Main star */}
            <mesh ref={starRef}>
                <sphereGeometry
                    args={[1, 64, 64]}
                />

                <meshStandardMaterial
                    color="#fff0ae"
                    emissive="#ffc94d"
                    emissiveIntensity={3.2}
                    roughness={0.3}
                />
            </mesh>

            {/* Light */}
            <pointLight
                color="#ffd477"
                intensity={85}
                distance={20}
                decay={2}
            />

        </group>
    );
}