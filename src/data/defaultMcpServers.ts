import { McpServer } from '../types';

export const INITIAL_MCP_SERVERS: McpServer[] = [
  {
    id: 'edge-filesystem-mcp',
    name: 'Local Filesystem MCP',
    url: 'stdio://ai-edge/fs-provider',
    type: 'stdio',
    status: 'connected',
    description: 'Provides sandboxed read/write file access and directory exploration on local storage.',
    tools: [
      {
        name: 'read_file',
        description: 'Read content of a file from sandbox storage',
        inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
        enabled: true,
        requireConfirmation: false,
      },
      {
        name: 'write_file',
        description: 'Write string or binary buffer into local sandboxed file',
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] },
        enabled: true,
        requireConfirmation: true,
      },
      {
        name: 'list_directory',
        description: 'List directories and file sizes in folder',
        inputSchema: { type: 'object', properties: { dirPath: { type: 'string' } }, required: ['dirPath'] },
        enabled: true,
        requireConfirmation: false,
      }
    ]
  },
  {
    id: 'edge-device-sensors-mcp',
    name: 'Device Telemetry & Sensors MCP',
    url: 'https://mcp.edge.google.internal/v1/sensors',
    type: 'sse',
    status: 'connected',
    description: 'Access battery health, ambient light sensors, thermal state, and accelerometer steadiness.',
    tools: [
      {
        name: 'get_battery_status',
        description: 'Returns battery percentage, charging state, and estimated discharge time',
        inputSchema: { type: 'object', properties: {} },
        enabled: true,
        requireConfirmation: false,
      },
      {
        name: 'get_device_thermals',
        description: 'Returns CPU/GPU temperatures and throttling state',
        inputSchema: { type: 'object', properties: {} },
        enabled: true,
        requireConfirmation: false,
      }
    ]
  },
  {
    id: 'github-workspace-mcp',
    name: 'GitHub Repo MCP',
    url: 'https://api.githubcopilot.com/mcp',
    type: 'sse',
    status: 'disconnected',
    description: 'Fetch repository issues, discussions, pull requests, and file trees directly.',
    tools: [
      {
        name: 'fetch_issues',
        description: 'Search repository issues by label and milestone',
        inputSchema: { type: 'object', properties: { repo: { type: 'string' }, query: { type: 'string' } }, required: ['repo'] },
        enabled: true,
        requireConfirmation: false,
      }
    ]
  }
];
