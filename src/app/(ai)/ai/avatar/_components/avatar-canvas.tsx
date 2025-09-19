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
    camera.position.z = 220; // Moved camera closer

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Particle Geometry
    const particleCount = 5000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);

    const radius = 120; // Increased radius for a larger sphere

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Distribute points evenly on a sphere using Fibonacci lattice for better distribution
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
        const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
        const r = Math.sqrt(1 - y * y); // radius at y

        const theta = phi * i;

        const x = Math.cos(theta) * r * radius;
        const z = Math.sin(theta) * r * radius;
        
        positions[i3] = x;
        positions[i3 + 1] = y * radius;
        positions[i3 + 2] = z;

        initialPositions[i3] = x;
        initialPositions[i3 + 1] = y * radius;
        initialPositions[i3 + 2] = z;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('initialPosition', new THREE.BufferAttribute(initialPositions, 3));

    // Particle Material
    const particleMaterial = new THREE.PointsMaterial({
      color: theme === 'dark' ? 0xffffff : 0x666666,
      size: 1.5,
      sizeAttenuation: true,
      alphaTest: 0.5,
      transparent: true
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Mouse interaction
    const mouse = new THREE.Vector2(-10000, -10000);
    const handleMouseMove = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
        mouse.y = -(event.clientY - rect.top) / rect.height * 2 + 1;
    };
     const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = (touch.clientX - rect.left) / rect.width * 2 - 1;
        mouse.y = -(touch.clientY - rect.top) / rect.height * 2 + 1;
      }
    };
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove);
    const handleMouseLeave = () => {
        mouse.x = -10000;
        mouse.y = -10000;
    };
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchend', handleMouseLeave);

    // Animation
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse3D = new THREE.Vector3();

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      if (isAnimated) {
        particleSystem.rotation.y = elapsedTime * 0.05;
      }
      
      const posAttr = particles.getAttribute('position') as THREE.BufferAttribute;
      const initialPosAttr = particles.getAttribute('initialPosition') as THREE.BufferAttribute;
      
      // Update mouse3D position only when mouse moves
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.at(200, mouse3D)

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const vertex = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        const initialVertex = new THREE.Vector3().fromBufferAttribute(initialPosAttr, i);
        
        const dist = vertex.distanceTo(mouse3D);
        const maxDist = 60; // Adjusted for larger sphere
        
        if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const dir = vertex.clone().sub(mouse3D).normalize().multiplyScalar(force * 3); // Reduced repel force for subtlety
            vertex.add(dir);
        }

        // Return to initial position
        vertex.lerp(initialVertex, 0.04); // Smoother return

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
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchend', handleMouseLeave);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      particles.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [theme, isAnimated]);

  return <div ref={mountRef} className="h-full w-full cursor-pointer" />;
}
