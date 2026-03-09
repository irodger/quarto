// src/components/WebGLRenderer.tsx - Основной WebGL рендерер
import React, { useEffect, useRef, useMemo } from 'react';

interface WebGLRendererProps {
  children: React.ReactNode;
}

export const WebGLRenderer: React.FC<WebGLRendererProps> = ({ children }) => {
  return children;
};

// Хук для WebGL фигур Quarto
export const useQuartoWebGL = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const createQuartoGeometry = (color: 'light' | 'dark', size: 'small' | 'large', shape: 'round' | 'square', top: 'hollow' | 'solid') => {
    const isLight = color === 'light';
    const isLarge = size === 'large';
    const isRound = shape === 'round';
    const isHollow = top === 'hollow';

    const pieceHeight = isLarge ? 0.8 : 0.5;
    const pieceRadius = isLarge ? 0.3 : 0.2;
    const pieceDepth = isLarge ? 0.3 : 0.2;

    const fillColor = isLight ? [0.96, 0.87, 0.70] : [0.41, 0.41, 0.41];
    const strokeColor = [0.0, 0.0, 0.0];

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const addVertex = (x: number, y: number, z: number, color: number[]) => {
      vertices.push(x, y, z);
      colors.push(...color);
    };

    const addTriangle = (i1: number, i2: number, i3: number) => {
      indices.push(i1, i2, i3);
    };

    if (isRound) {
      // Создаем цилиндр
      const segments = 16;
      const vertexCount = vertices.length / 3;

      // Верхний круг
      for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2;
        const angle2 = ((i + 1) / segments) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * pieceRadius;
        const z1 = Math.sin(angle1) * pieceRadius;
        const x2 = Math.cos(angle2) * pieceRadius;
        const z2 = Math.sin(angle2) * pieceRadius;
        
        const centerIndex = vertices.length / 3;
        addVertex(0, pieceHeight, 0, fillColor);
        addVertex(x1, pieceHeight, z1, fillColor);
        addVertex(x2, pieceHeight, z2, fillColor);
        
        addTriangle(centerIndex, centerIndex + 1, centerIndex + 2);
      }

      // Боковые грани
      for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2;
        const angle2 = ((i + 1) / segments) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * pieceRadius;
        const z1 = Math.sin(angle1) * pieceRadius;
        const x2 = Math.cos(angle2) * pieceRadius;
        const z2 = Math.sin(angle2) * pieceRadius;
        
        const startIndex = vertices.length / 3;
        addVertex(x1, pieceHeight, z1, fillColor);
        addVertex(x2, pieceHeight, z2, fillColor);
        addVertex(x1, 0, z1, fillColor);
        addVertex(x2, 0, z2, fillColor);
        
        addTriangle(startIndex, startIndex + 1, startIndex + 2);
        addTriangle(startIndex + 2, startIndex + 1, startIndex + 3);
      }

      // Нижний круг
      for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2;
        const angle2 = ((i + 1) / segments) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * pieceRadius;
        const z1 = Math.sin(angle1) * pieceRadius;
        const x2 = Math.cos(angle2) * pieceRadius;
        const z2 = Math.sin(angle2) * pieceRadius;
        
        const startIndex = vertices.length / 3;
        addVertex(x1, 0, z1, fillColor);
        addVertex(x2, 0, z2, fillColor);
        addVertex(0, 0, 0, fillColor);
        
        addTriangle(startIndex, startIndex + 1, startIndex + 2);
      }

    } else {
      // Создаем куб
      const halfSize = pieceRadius;
      const halfHeight = pieceHeight / 2;
      const halfDepth = pieceDepth / 2;

      // Вершины куба
      const cubeVertices = [
        // Передняя грань
        [-halfSize, -halfHeight, halfDepth],
        [halfSize, -halfHeight, halfDepth],
        [halfSize, halfHeight, halfDepth],
        [-halfSize, halfHeight, halfDepth],
        // Задняя грань
        [-halfSize, -halfHeight, -halfDepth],
        [halfSize, -halfHeight, -halfDepth],
        [halfSize, halfHeight, -halfDepth],
        [-halfSize, halfHeight, -halfDepth],
      ];

      cubeVertices.forEach(vertex => {
        addVertex(vertex[0], vertex[1], vertex[2], fillColor);
      });

      // Индексы куба
      const cubeIndices = [
        // Передняя
        0, 1, 2, 0, 2, 3,
        // Задняя
        4, 7, 6, 4, 6, 5,
        // Верхняя
        3, 2, 6, 3, 6, 7,
        // Нижняя
        0, 4, 5, 0, 5, 1,
        // Левая
        0, 3, 7, 0, 7, 4,
        // Правая
        1, 5, 6, 1, 6, 2,
      ];

      cubeIndices.forEach(index => {
        indices.push(index);
      });
    }

    return { vertices, colors, indices };
  };

  return {
    createQuartoGeometry,
    canvasRef,
    glRef,
    programRef
  };
};