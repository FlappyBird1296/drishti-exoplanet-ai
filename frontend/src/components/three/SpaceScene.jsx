import { Canvas } from "@react-three/fiber";

import {
    CameraControls,
} from "@react-three/drei";

import StarField from "./StarField";
import StarSystem from "./StarSystem";
import Nebula from "./Nebula";

function Scene() {
    return (
        <>

            <ambientLight
                intensity={0.12}
            />

            <StarField />

            <StarSystem />

            <CameraControls
                minDistance={6}
                maxDistance={11}
                smoothTime={1.2}
                azimuthRotateSpeed={0.12}
                polarRotateSpeed={0.08}
            />

        </>
    );
}


export default function SpaceScene() {
    return (
        <div className="
            pointer-events-none
            absolute
            right-0
            top-0
            z-[1]
            h-full
            w-full
            overflow-hidden
            lg:w-[64%]
        ">

            {/* Atmospheric nebula */}
            <Nebula />

            {/* 3D universe */}
            <div className="
                absolute
                inset-0
            ">

                <Canvas
                    camera={{
                        position: [
                            0,
                            0.5,
                            8.2
                        ],
                        fov: 42
                    }}

                    dpr={[1, 1.5]}

                    gl={{
                        antialias: true,
                        alpha: true,
                    }}
                >

                    <Scene />

                </Canvas>

            </div>

        </div>
    );
}