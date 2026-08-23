import * as THREE from "three";

export default function Orbit({
    radius,
    opacity = 0.28,
}) {
    const points = [];

    for (
        let i = 0;
        i <= 160;
        i++
    ) {
        const angle =
            (i / 160) *
            Math.PI *
            2;

        points.push(
            new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            )
        );
    }

    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(points);

    return (
        <line geometry={geometry}>

            <lineBasicMaterial
                color="#b78cff"
                transparent
                opacity={opacity}
            />

        </line>
    );
}