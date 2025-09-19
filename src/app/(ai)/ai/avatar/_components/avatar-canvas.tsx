"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

// A simple noise function to create organic movement
function createNoise3D(seed = 1) {
    let random = () => {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    let perm: number[] = [];
    for(let i=0; i<256; i++) perm.push(i);
    perm.sort(() => .5 - random());
    perm = [...perm, ...perm];
    
    const lerp = (a: number, b: number, t: number) => a + t * (b - a);
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (hash: number, x: number, y: number, z: number) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    return (x: number, y: number, z: number) => {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = fade(x);
        const v = fade(y);
        const w = fade(z);
        const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
        const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;

        return lerp(
            lerp(
                lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
                lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u),
                v
            ),
            lerp(
                lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
                lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u),
                v
            ),
            w
        );
    };
}


interface AvatarCanvasProps {
  isAnimated: boolean;
}

export function AvatarCanvas({ isAnimated }: AvatarCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Memoize the noise function so it's not recreated on every render
  const noise = useMemo(() => createNoise3D(), []);

  useEffect(() => {
    if (!mountRef.current || !noise) return;

    const container = mountRef.current;
    
    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Geometry
    const geometry = new THREE.IcosahedronGeometry(1.5, 64);
    geometry.setAttribute('initialPosition', new THREE.BufferAttribute(geometry.attributes.position.clone().array, 3));
    
    // Material
    const material = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0xbb86fc : 0x6200ee,
      wireframe: true,
      roughness: 0.5,
      metalness: 0.1,
    });
    
    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(theme === 'dark' ? 0xbb86fc : 0x8d3ffc, 50, 100);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Mouse interaction
    const mouse = new THREE.Vector2(-10, -10);
    const handleMouseMove = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', () => {
        mouse.x = -10;
        mouse.y = -10;
    });

    // Animation
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      if (isAnimated) {
        blob.rotation.y = elapsedTime * 0.1;
        blob.rotation.x = elapsedTime * 0.05;
      }
      
      const posAttr = geometry.getAttribute('position');
      const initialPosAttr = geometry.getAttribute('initialPosition');
      const time = elapsedTime * 0.5;
      
      for (let i = 0; i < posAttr.count; i++) {
        const ix = initialPosAttr.getX(i);
        const iy = initialPosAttr.getY(i);
        const iz = initialPosAttr.getZ(i);

        // Noise-based displacement for fluid effect
        const noiseFactor = 0.15;
        const displacement = noise(ix * 0.5 + time, iy * 0.5 + time, iz * 0.5 + time) * noiseFactor;
        
        const vertex = new THREE.Vector3(ix, iy, iz).normalize().multiplyScalar(1.5 + displacement);

        // Mouse interaction for repulsion
        const mousePos3D = new THREE.Vector3(mouse.x * 2.5, mouse.y * 2.5, 0);
        const dist = vertex.distanceTo(mousePos3D);
        if (dist < 1.5) {
            const force = (1.5 - dist) * 0.15;
            const dir = vertex.clone().sub(mousePos3D).normalize().multiplyScalar(force);
            vertex.add(dir);
        }

        posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [theme, isAnimated, noise]);

  return <div ref={mountRef} className="h-full w-full cursor-pointer rounded-md" />;
}
