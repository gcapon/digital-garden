'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Note, GraphNode } from '@/types';
import { slugify } from '@/lib/utils';

interface GraphVisualizationProps {
  notes: Note[];
  compact?: boolean;
}

export function GraphVisualization({ notes, compact = false }: GraphVisualizationProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<{ from: string; to: string }[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });

  // Parse links from notes to build edges
  useEffect(() => {
    if (!notes || notes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const newEdges: { from: string; to: string }[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Create nodes with positions
    notes.forEach((note, index) => {
      const angle = (2 * Math.PI * index) / notes.length;
      const radius = compact ? Math.min(dimensions.width, dimensions.height) * 0.3 : Math.min(dimensions.width, dimensions.height) * 0.4;
      const x = dimensions.width / 2 + radius * Math.cos(angle);
      const y = dimensions.height / 2 + radius * Math.sin(angle);

      nodeMap.set(note.id, {
        id: note.id,
        title: note.title,
        slug: note.slug,
        x,
        y,
        connections: [],
      });

      // Parse links from content
      let match;
      while ((match = linkRegex.exec(note.content)) !== null) {
        const linkedTitle = match[1].trim();
        const linkedSlug = slugify(linkedTitle);
        const targetNote = notes.find(n => n.slug === linkedSlug);
        if (targetNote) {
          newEdges.push({ from: note.id, to: targetNote.id });
          const node = nodeMap.get(note.id);
          if (node && !node.connections.includes(targetNote.id)) {
            node.connections.push(targetNote.id);
          }
        }
      }
    });

    setNodes(Array.from(nodeMap.values()));
    setEdges(newEdges);
  }, [notes, dimensions, compact]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleNodeClick = (slug: string) => {
    router.push(`/garden/${slug}`);
  };

  const nodeRadius = compact ? 20 : 28;
  const fontSize = compact ? 10 : 12;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: compact ? 150 : 300,
        position: 'relative',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const isHighlighted =
            hoveredNode === edge.from || hoveredNode === edge.to;

          // Create curved bezier path
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const curve = 0.2;
          const ctrlX = midX - dy * curve;
          const ctrlY = midY + dx * curve;

          return (
            <path
              key={`edge-${i}`}
              d={`M ${fromNode.x} ${fromNode.y} Q ${ctrlX} ${ctrlY} ${toNode.x} ${toNode.y}`}
              fill="none"
              stroke="#7A9E7E"
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              opacity={hoveredNode ? (isHighlighted ? 1 : 0.2) : 0.6}
              style={{ transition: 'all 200ms ease' }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isHovered = hoveredNode === node.id;
          const isConnected = hoveredNode && nodes.find(n => n.id === hoveredNode)?.connections.includes(node.id);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => handleNodeClick(node.slug)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Node circle */}
              <circle
                r={isHovered ? nodeRadius * 1.2 : nodeRadius}
                fill={isHovered || isConnected ? '#7A9E7E' : '#E8E6E1'}
                stroke={isHovered ? '#C67B5D' : 'transparent'}
                strokeWidth={isHovered ? 3 : 0}
                style={{ transition: 'all 200ms ease' }}
              />
              {/* Node label */}
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isHovered || isConnected ? '#FFFFFF' : '#2D2A24'}
                fontSize={fontSize}
                fontWeight={500}
                style={{
                  pointerEvents: 'none',
                  transition: 'fill 200ms ease',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {node.title.length > 12 ? node.title.substring(0, 12) + '...' : node.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}