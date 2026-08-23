import Star from "./Star";
import Planet from "./Planet";
import Orbit from "./Orbit";

export default function StarSystem() {
    return (
        <group
            position={[0, 0.8, 0]}
            rotation={[0.08, 0, -0.08]}
        >

            <Star
                position={[0, 0, 0]}
                scale={1.25}
            />

            {/* Main orbital path */}
            <Orbit
                radius={3.25}
                opacity={0.34}
            />

            {/* Outer orbital path */}
            <Orbit
                radius={3.85}
                opacity={0.18}
            />

            {/* Main exoplanet */}
            <Planet
                radius={0.28}
                distance={3.25}
                speed={0.28}
                phase = {0.9}
                color="#111322"
            />

            {/* Small distant planet */}
            <Planet
                radius={0.12}
                distance={3.85}
                speed={0.17}
                color="#6d5fd1"
            />

        </group>
    );
}