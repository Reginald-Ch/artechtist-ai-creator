import { Node, Edge } from '@xyflow/react';

export interface ProximityInfo {
  nodeId: string;
  distance: number;
  direction: 'left' | 'right' | 'above' | 'below';
  angle: number;
}

export interface SuggestedConnection {
  source: string;
  target: string;
  confidence: number;
  direction: 'horizontal' | 'vertical';
}

export interface DetectionOptions {
  detectionRadius: number;
  mode: 'horizontal' | 'vertical' | 'mixed';
  allowCycles?: boolean;
}

interface DetectionZone {
  horizontal: number;
  vertical: number;
  diagonal: number;
}

const DEFAULT_ZONES: DetectionZone = {
  horizontal: 250,
  vertical: 150,
  diagonal: 300,
};

/**
 * Calculate proximity and direction between two nodes
 */
export const getNodeProximity = (nodeA: Node, nodeB: Node): ProximityInfo => {
  // Use node center points for accuracy
  const aX = nodeA.position.x + (nodeA.width || 280) / 2;
  const aY = nodeA.position.y + (nodeA.height || 200) / 2;
  const bX = nodeB.position.x + (nodeB.width || 280) / 2;
  const bY = nodeB.position.y + (nodeB.height || 200) / 2;

  const deltaX = bX - aX;
  const deltaY = bY - aY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  // Determine primary direction
  let direction: 'left' | 'right' | 'above' | 'below';
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    direction = deltaX > 0 ? 'right' : 'left';
  } else {
    direction = deltaY > 0 ? 'below' : 'above';
  }

  return {
    nodeId: nodeB.id,
    distance,
    direction,
    angle,
  };
};

/**
 * Check if a connection should be auto-created based on spatial relationship
 */
export const shouldAutoConnect = (
  nodeA: Node,
  nodeB: Node,
  existingEdges: Edge[],
  options: DetectionOptions
): boolean => {
  const proximity = getNodeProximity(nodeA, nodeB);
  const zones = DEFAULT_ZONES;

  // Check if nodes are within detection radius
  if (proximity.distance > options.detectionRadius) {
    return false;
  }

  // Prevent self-loops
  if (nodeA.id === nodeB.id) {
    return false;
  }

  // Check if connection already exists (in either direction)
  const connectionExists = existingEdges.some(
    edge =>
      (edge.source === nodeA.id && edge.target === nodeB.id) ||
      (edge.source === nodeB.id && edge.target === nodeA.id)
  );

  if (connectionExists) {
    return false;
  }

  // Prevent cycles if not allowed
  if (!options.allowCycles) {
    // Check if B → A exists (would create a cycle)
    const wouldCreateCycle = existingEdges.some(
      edge => edge.source === nodeB.id && edge.target === nodeA.id
    );
    
    if (wouldCreateCycle) {
      return false;
    }
  }

  // Apply mode-specific rules
  switch (options.mode) {
    case 'horizontal':
      // Only connect if B is to the right of A
      return proximity.direction === 'right' && proximity.distance < zones.horizontal;
      
    case 'vertical':
      // Only connect if B is below A
      return proximity.direction === 'below' && proximity.distance < zones.vertical;
      
    case 'mixed':
      // Connect based on closest direction within zones
      if (proximity.direction === 'right' && proximity.distance < zones.horizontal) {
        return true;
      }
      if (proximity.direction === 'below' && proximity.distance < zones.vertical) {
        return true;
      }
      return proximity.distance < zones.diagonal;
      
    default:
      return false;
  }
};

/**
 * Detect all spatial relationships and suggest connections
 */
export const detectSpatialRelationships = (
  nodes: Node[],
  edges: Edge[],
  options: DetectionOptions
): SuggestedConnection[] => {
  const suggestions: SuggestedConnection[] = [];

  // Analyze all node pairs
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;

      const nodeA = nodes[i];
      const nodeB = nodes[j];

      // Skip default nodes based on their type
      if (nodeA.data?.label === 'Fallback') {
        // Fallback can connect FROM but not TO
        continue;
      }

      if (shouldAutoConnect(nodeA, nodeB, edges, options)) {
        const proximity = getNodeProximity(nodeA, nodeB);
        
        // Calculate confidence score (0-1) based on distance
        const confidence = Math.max(0, 1 - proximity.distance / options.detectionRadius);
        
        suggestions.push({
          source: nodeA.id,
          target: nodeB.id,
          confidence,
          direction: proximity.direction === 'right' || proximity.direction === 'left' 
            ? 'horizontal' 
            : 'vertical',
        });
      }
    }
  }

  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Get nearby nodes within detection radius
 */
export const getNearbyNodes = (
  targetNode: Node,
  allNodes: Node[],
  detectionRadius: number
): ProximityInfo[] => {
  return allNodes
    .filter(n => n.id !== targetNode.id)
    .map(n => getNodeProximity(targetNode, n))
    .filter(p => p.distance < detectionRadius)
    .sort((a, b) => a.distance - b.distance);
};
