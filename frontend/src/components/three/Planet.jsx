import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Planet({
    radius = 0.2,
    distance = 3.3,
    speed = 0.35,
    color = "#17192b",
    phase = 0,
}) {
    const groupRef = useRef();
    const planetRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;

        const time =
            state.clock.elapsedTime;

        const angle =
            time * speed + phase;

        groupRef.current.position.x =
            Math.cos(angle) * distance;

        groupRef.current.position.z =
            Math.sin(angle) * distance;

        if (planetRef.current) {
            planetRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef}>

            <mesh ref={planetRef}>
                <sphereGeometry
                    args={[radius, 48, 48]}
                />

                <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                    metalness={0.08}
                />
            </mesh>

            {/* Planet atmosphere */}
            <mesh>
                <sphereGeometry
                    args={[
                        radius * 1.22,
                        32,
                        32
                    ]}
                />

                <meshBasicMaterial
                    color="#7d6cff"
                    transparent
                    opacity={0.055}
                    depthWrite={false}
                />
            </mesh>

        </group>
    );
}