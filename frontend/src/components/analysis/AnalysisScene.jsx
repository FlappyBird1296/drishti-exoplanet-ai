import {
    Canvas,
    useFrame,
} from "@react-three/fiber";

import {
    Stars,
} from "@react-three/drei";

import {
    useRef,
} from "react";

import * as THREE from "three";


function TransitSystem({
    period = 4.7,
}) {

    const planetRef =
        useRef();

    const orbitRef =
        useRef();


    useFrame((state) => {

        const time =
            state.clock.elapsedTime;


        /*
         * The actual orbital period may be several
         * days, which is too slow for a demo.
         *
         * We therefore preserve the period as the
         * scientific parameter while accelerating
         * the visualization.
         */

        const visualSpeed =
            (2 * Math.PI / Math.max(period, 0.1))
            * 1.2;

        const angle =
            time * visualSpeed;


        const radius = 3;


        if (planetRef.current) {

            planetRef.current.position.x =
                Math.cos(angle) * radius;

            planetRef.current.position.z =
                Math.sin(angle) * radius;
        }


        if (orbitRef.current) {

            orbitRef.current.rotation.y =
                time * 0.08;
        }

    });


    return (
        <group>

            {/* Star */}

            <mesh>

                <sphereGeometry
                    args={[1.05, 64, 64]}
                />

                <meshStandardMaterial
                    color="#fff0aa"
                    emissive="#ffc94d"
                    emissiveIntensity={3}
                    roughness={0.3}
                />

            </mesh>


            {/* Star glow */}

            <mesh>

                <sphereGeometry
                    args={[1.4, 48, 48]}
                />

                <meshBasicMaterial
                    color="#ffd76d"
                    transparent
                    opacity={0.07}
                    depthWrite={false}
                />

            </mesh>


            <pointLight
                color="#ffd477"
                intensity={70}
                distance={18}
            />


            {/* Orbit */}

            <group ref={orbitRef}>

                <mesh
                    rotation={[
                        Math.PI / 2,
                        0,
                        0,
                    ]}
                >

                    <torusGeometry
                        args={[
                            3,
                            0.012,
                            16,
                            128,
                        ]}
                    />

                    <meshBasicMaterial
                        color="#8b7cff"
                        transparent
                        opacity={0.4}
                    />

                </mesh>

            </group>


            {/* Planet */}

            <mesh ref={planetRef}>

                <sphereGeometry
                    args={[0.25, 32, 32]}
                />

                <meshStandardMaterial
                    color="#17182a"
                    roughness={0.75}
                />

            </mesh>


            {/* Planet atmosphere */}

            <mesh>

                <sphereGeometry
                    args={[0.31, 24, 24]}
                />

                <meshBasicMaterial
                    color="#8175ff"
                    transparent
                    opacity={0.08}
                    depthWrite={false}
                />

            </mesh>

        </group>
    );
}


export default function AnalysisScene({
    period,
}) {

    return (
        <div className="
            absolute
            inset-0
        ">

            <Canvas
                camera={{
                    position: [
                        0,
                        1,
                        8
                    ],
                    fov: 40,
                }}
            >

                <color
                    attach="background"
                    args={["#070a16"]}
                />

                <ambientLight
                    intensity={0.12}
                />

                <Stars
                    radius={70}
                    depth={40}
                    count={1800}
                    factor={1.7}
                    fade
                    speed={0.15}
                />

                <TransitSystem
                    period={period}
                />

            </Canvas>

        </div>
    );
}