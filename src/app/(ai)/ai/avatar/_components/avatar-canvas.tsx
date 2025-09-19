"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface AvatarCanvasProps {
  isAnimated: boolean;
}

export function AvatarCanvas({ isAnimated }: AvatarCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

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
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Particles
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    
    const radius = 2;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      positions[i3] = radius * Math.cos(theta) * Math.sin(phi);
      positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    originalPositions.set(positions);

    const particleMaterial = new THREE.PointsMaterial({
      color: theme === "dark" ? 0xbb86fc : 0x6200ee,
      size: 0.05,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);
    
    // Mouse interaction
    const mouse = new THREE.Vector2(-100, -100);
    const handleMouseMove = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', () => {
        mouse.x = -100;
        mouse.y = -100;
    });


    // Animation
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      if (isAnimated) {
        particles.rotation.y = elapsedTime * 0.1;
      }
      
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          // Wavy effect
          const x = originalPositions[i3];
          const y = originalPositions[i3 + 1];
          const z = originalPositions[i3 + 2];
          
          const waveFactor = 0.1;
          const waveSpeed = 2.0;

          const waveX = waveFactor * Math.sin(y * waveSpeed + elapsedTime);
          const waveY = waveFactor * Math.sin(x * waveSpeed + elapsedTime);
          const waveZ = waveFactor * Math.sin(z * waveSpeed + elapsedTime);

          posAttr.setX(i, x + waveX);
          posAttr.setY(i, y + waveY);
          posAttr.setZ(i, z + waveZ);
          
           // Mouse interaction
          const particlePos = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
          const mousePos3D = new THREE.Vector3(mouse.x * 2.5, mouse.y * 2.5, 0); // Adjust multiplier for interaction radius
          const dist = particlePos.distanceTo(mousePos3D);
          
          if(dist < 1.5) {
              const force = (1.5 - dist) * 0.1;
              const dir = particlePos.clone().sub(mousePos3D).normalize().multiplyScalar(force);
              posAttr.setX(i, posAttr.getX(i) + dir.x);
              posAttr.setY(i, posAttr.getY(i) + dir.y);
              posAttr.setZ(i, posAttr.getZ(i) + dir.z);
          }
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
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [theme, isAnimated]);

  return <div ref={mountRef} className="h-full w-full cursor-pointer rounded-md" />;
}
