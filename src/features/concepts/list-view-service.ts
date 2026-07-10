import {
  conceptGraphService,
  type ConceptGraph,
  type GraphEdge,
} from "./graph-service";

export interface ListViewNode {
  id: string;
  label: string;
  type: "concept" | "paper";
  confirmed: boolean;
  connections: number;
}

export interface ListViewEdge {
  sourceLabel: string;
  targetLabel: string;
  relationship: string;
}

export interface RelationshipListView {
  nodes: ListViewNode[];
  edges: ListViewEdge[];
  summary: string;
}

export const listViewService = {
  async getRelationshipList(
    workspaceId: string,
  ): Promise<RelationshipListView> {
    const graph = await conceptGraphService.getGraph(workspaceId);

    const connectionCounts = new Map<string, number>();
    for (const edge of graph.edges) {
      connectionCounts.set(
        edge.source,
        (connectionCounts.get(edge.source) ?? 0) + 1,
      );
      connectionCounts.set(
        edge.target,
        (connectionCounts.get(edge.target) ?? 0) + 1,
      );
    }

    const nodes: ListViewNode[] = graph.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      confirmed: n.confirmed,
      connections: connectionCounts.get(n.id) ?? 0,
    }));

    const nodeMap = new Map(graph.nodes.map((n) => [n.id, n.label]));

    const edges: ListViewEdge[] = graph.edges.map((e) => ({
      sourceLabel: nodeMap.get(e.source) ?? e.source,
      targetLabel: nodeMap.get(e.target) ?? e.target,
      relationship: e.relationship,
    }));

    const confirmedCount = nodes.filter((n) => n.confirmed).length;
    const summary = `${nodes.length} concepts (${confirmedCount} confirmed), ${edges.length} connections`;

    return { nodes, edges, summary };
  },

  sortNodesByConnections(nodes: ListViewNode[]): ListViewNode[] {
    return [...nodes].sort((a, b) => b.connections - a.connections);
  },

  filterNodes(
    nodes: ListViewNode[],
    options: {
      confirmedOnly?: boolean;
      type?: "concept" | "paper";
      minConnections?: number;
    },
  ): ListViewNode[] {
    return nodes.filter((n) => {
      if (options.confirmedOnly && !n.confirmed) return false;
      if (options.type && n.type !== options.type) return false;
      if (
        options.minConnections !== undefined &&
        n.connections < options.minConnections
      )
        return false;
      return true;
    });
  },

  focusMode(
    graph: ConceptGraph,
    focusNodeId: string,
    depth: number = 1,
  ): ConceptGraph {
    const visited = new Set<string>();
    const nodesToInclude = new Set<string>();
    const edgesToInclude: GraphEdge[] = [];

    function traverse(nodeId: string, currentDepth: number): void {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      nodesToInclude.add(nodeId);

      if (currentDepth >= depth) return;

      for (const edge of graph.edges) {
        if (edge.source === nodeId || edge.target === nodeId) {
          const neighbor = edge.source === nodeId ? edge.target : edge.source;
          edgesToInclude.push(edge);
          traverse(neighbor, currentDepth + 1);
        }
      }
    }

    traverse(focusNodeId, 0);

    return {
      nodes: graph.nodes.filter((n) => nodesToInclude.has(n.id)),
      edges: edgesToInclude,
    };
  },
};
