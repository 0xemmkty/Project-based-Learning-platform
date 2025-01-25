import * as THREE from 'three';
import { Image, ScrollControls, useScroll, Billboard, Text } from '@react-three/drei';
import React, { Suspense, useLayoutEffect, useRef, useState } from 'react'; // 正确导入 React 钩子
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { easing } from 'maath';

const categories = {
  mechanical: {
    title: "Mechanical",
    projects: Array.from({ length: 8 }, (_, i) => ({
      id: `mech-${i}`,
      title: `Mechanical Project ${i}`,
      image: `/mechanical${i + 1}.jpg`,
    })),
  },
  electrical: {
    title: "Electrical",
    projects: Array.from({ length: 8 }, (_, i) => ({
      id: `elec-${i}`,
      title: `Electrical Project ${i}`,
      image: `/electrical${i + 1}.jpg`,
    })),
  },
  software: {
    title: "Software",
    projects: Array.from({ length: 8 }, (_, i) => ({
      id: `soft-${i}`,
      title: `Software Project ${i}`,
      image: `/software${i + 1}.jpg`,
    })),
  },
};

export function ProjectGallery() {
  return (
    <Suspense fallback={<div>Loading Gallery...</div>}>
      <Canvas dpr={[1, 1.5]} style={{ width: '100vw', height: '100vh' }}>
        <ScrollControls pages={4} infinite>
          <Scene position={[0, 1.5, 0]} />
        </ScrollControls>
      </Canvas>
    </Suspense>
  );
}

function Scene({ children, ...props }) {
  const ref = useRef();
  const scroll = useScroll();
  const [hovered, hover] = useState(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y = -scroll.offset * (Math.PI * 2);
    }
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9],
      0.3,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref} {...props}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <CategorySection
        category="mechanical"
        from={0}
        len={Math.PI / 3}
        onPointerOver={hover}
        onPointerOut={hover}
      />
      <CategorySection
        category="electrical"
        from={Math.PI / 3}
        len={Math.PI / 3}
        position={[0, 0.4, 0]}
        onPointerOver={hover}
        onPointerOut={hover}
      />
      <CategorySection
        category="software"
        from={(2 * Math.PI) / 3}
        len={Math.PI / 3}
        position={[0, -0.4, 0]}
        onPointerOver={hover}
        onPointerOut={hover}
      />
      <ActiveProject hovered={hovered} />
    </group>
  );
}

function CategorySection({
  category,
  from = 0,
  len = Math.PI * 2,
  radius = 5.25,
  onPointerOver,
  onPointerOut,
  ...props
}) {
  const [hovered, hover] = useState(null);
  const projects = categories[category].projects;
  const textPosition = from + (len / 2);

  return (
    <group {...props}>
      <Billboard position={[Math.sin(textPosition) * radius * 1.4, 0.5, Math.cos(textPosition) * radius * 1.4]}>
        <Text fontSize={0.25} anchorX="center" color="black">
          {categories[category].title}
        </Text>
      </Billboard>
      {projects.map((project, i) => {
        const angle = from + (i / projects.length) * len;
        return (
          <ProjectCard
            key={project.id}
            project={project}
            onPointerOver={(e) => {
              e.stopPropagation();
              hover(i);
              onPointerOver(project);
            }}
            onPointerOut={() => {
              hover(null);
              onPointerOut(null);
            }}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, Math.PI / 2 + angle, 0]}
            active={hovered !== null}
            hovered={hovered === i}
          />
        );
      })}
    </group>
  );
}

function ProjectCard({ project, active, hovered, ...props }) {
  const ref = useRef();

  useFrame((state, delta) => {
    const f = hovered ? 1.4 : active ? 1.25 : 1;
    easing.damp3(ref.current.position, [0, hovered ? 0.25 : 0, 0], 0.1, delta);
    easing.damp3(ref.current.scale, [1.618 * f, 1 * f, 1], 0.15, delta);
  });

  const handleClick = () => {
    window.open(`/projects/${project.id}`, '_blank');
  };

  return (
    <group {...props} onClick={handleClick}>
      <Image
        ref={ref}
        transparent
        radius={0.075}
        url={project.image}
        scale={[1.618, 1, 1]}
        side={THREE.DoubleSide}
      />
    </group>
  );
}

function ActiveProject({ hovered, ...props }) {
  const ref = useRef();

  useLayoutEffect(() => {
    if (ref.current && ref.current.material) {
      ref.current.material.zoom = 0.8;
    }
  }, [hovered]);

  useFrame((state, delta) => {
    if (ref.current && ref.current.material) {
      easing.damp(ref.current.material, 'zoom', 1, 0.5, delta);
      easing.damp(ref.current.material, 'opacity', hovered !== null, 0.3, delta);
    }
  });

  return (
    <Billboard {...props}>
      {hovered && hovered.category && hovered.index !== undefined && (
        <Image
          ref={ref}
          url={categories[hovered.category].projects[hovered.index].image}
          scale={[4, 3, 1]}
          opacity={1}
          zoom={1.25}
        />
      )}
    </Billboard>
  );
}

export default ProjectGallery;
