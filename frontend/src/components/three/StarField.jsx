import { Stars } from "@react-three/drei";

export default function StarField() {
    return (
        <>
            {/* Distant stars */}
            <Stars
                radius={90}
                depth={60}
                count={3000}
                factor={1.5}
                saturation={0}
                fade
                speed={0.12}
            />

            {/* Closer stars */}
            <Stars
                radius={45}
                depth={30}
                count={700}
                factor={2.2}
                saturation={0.1}
                fade
                speed={0.2}
            />
        </>
    );
}