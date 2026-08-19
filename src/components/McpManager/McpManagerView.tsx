import React, { useState } from 'react';
import { McpServer } from '../../types';
import { Network, Plus, CheckCircle, XCircle, Shield, Play, Terminal, Lock, Key } from 'lucide-react';

interface McpManagerViewProps {
  servers: McpServer[];
  onUpdateServers: (servers: McpServer[]) => void;
}

export const McpManagerView: React.FC<McpManagerViewProps> = ({ servers, onUpdateServers }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerName, setNewServerName] = useState('');
  const [selectedType, setSelectedType] = useState<'sse' | 'stdio' | 'websocket'>('sse');
  const [apiKey, setApiKey] = useState('');

  const [activeTestTool, setActiveTestTool] = useState<{ serverId: string; toolName: string } | null>(null);
  const [toolResult, setToolResult] = useState<any>(null);

  const handleToggleToolConfirm = (serverId: string, toolName: string) => {
    const next = servers.map((s) => {
      if (s.id === serverId) {
        return {
          ...s,
          tools: s.tools.map((t) =>
            t.name === toolName ? { ...t, requireConfirmation: !t.requireConfirmation } : t
          ),
        };
      }
      return s;
    });
    onUpdateServers(next);
  };

  const handleToggleToolEnabled = (serverId: string, toolName: string) => {
    const next = servers.map((s) => {
      if (s.id === serverId) {
        return {
          ...s,
          tools: s.tools.map((t) => (t.name === toolName ? { ...t, enabled: !t.enabled } : t)),
        };
      }
      return s;
    });
    onUpdateServers(next);
  };

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerUrl.trim()) return;

    const newServer: McpServer = {
      id: `mcp-${Date.now()}`,
      name: newServerName.trim() || 'Custom MCP Server',
      url: newServerUrl.trim(),
      type: selectedType,
      status: 'connected',
      apiKey: apiKey.trim(),
      description: `Custom ${selectedType.toUpperCase()} endpoint for model context exploration.`,
      tools: [
        {
          name: 'query_custom_resource',
          description: 'Fetch structured context from the connected server endpoint',
          inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
          enabled: true,
          requireConfirmation: false,
        },
      ],
    };

    onUpdateServers([...servers, newServer]);
    setIsAddModalOpen(false);
    setNewServerUrl('');
    setNewServerName('');
    setApiKey('');
  };

  const handleRunTool = (serverId: string, toolName: string) => {
    setActiveTestTool({ serverId, toolName });
    if (toolName === 'get_battery_status') {
      setToolResult({
        batteryPercentage: 88,
        isCharging: true,
        voltageMv: 4180,
        temperatureC: 31.4,
        health: 'Good',
      });
    } else if (toolName === 'get_device_thermals') {
      setToolResult({
        socTemperatureC: 38.2,
        gpuTemperatureC: 40.1,
        throttlingStatus: 'NONE',
        acceleratorPowerMw: 1450,
      });
    } else if (toolName === 'read_file' || toolName === 'list_directory') {
      setToolResult({
        status: 'ok',
        path: '/sandboxed/data',
        files: ['models_cache.bin', 'user_prompts.json', 'audit_logs.db'],
      });
    } else {
      setToolResult({
        status: 'success',
        mcpExecutionTimestamp: new Date().toISOString(),
        tool: toolName,
        message: 'Tool call completed over local MCP protocol.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Model Context Protocol (MCP) Manager</span>
            <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs rounded-full font-mono">
              MCP Standard v1.0
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Connect AI Edge Gallery to standardized external data sources, local hardware telemetry sensors, and development workspaces.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add MCP Server</span>
        </button>
      </div>

      {/* Servers Grid */}
      <div className="space-y-4">
        {servers.map((server) => {
          const isConnected = server.status === 'connected';
          return (
            <div
              key={server.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{server.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] uppercase font-mono rounded">
                        {server.type}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{server.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    {isConnected ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400 font-semibold">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {server.description && (
                <p className="text-xs text-slate-400">{server.description}</p>
              )}

              {/* Tools List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Exposed MCP Tools ({server.tools.length})
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {server.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {tool.name}()
                          </span>
                          <button
                            onClick={() => handleToggleToolEnabled(server.id, tool.name)}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              tool.enabled
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {tool.enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                        <button
                          onClick={() => handleToggleToolConfirm(server.id, tool.name)}
                          className={`flex items-center gap-1 text-[10px] ${
                            tool.requireConfirmation ? 'text-amber-400' : 'text-slate-500'
                          }`}
                          title="Toggle user permission prompt"
                        >
                          <Shield className="w-3 h-3" />
                          <span>{tool.requireConfirmation ? 'Prompt Perm' : 'Auto-Approve'}</span>
                        </button>

                        <button
                          onClick={() => handleRunTool(server.id, tool.name)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold transition-colors"
                        >
                          <Play className="w-3 h-3 text-sky-400 fill-current" />
                          <span>Execute</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tool Output Inspector */}
      {activeTestTool && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-slate-200">
                MCP Tool Telemetry Output: {activeTestTool.toolName}()
              </h4>
            </div>
            <button
              onClick={() => setActiveTestTool(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-bold"
            >
              Close Output
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 whitespace-pre-wrap">
            {JSON.stringify(toolResult, null, 2)}
          </div>
        </div>
      )}

      {/* Add Server Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Add Model Context Protocol Server</h3>

            <form onSubmit={handleAddServer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Server Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SQLite Vector Memory MCP"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Protocol Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sse', 'stdio', 'websocket'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`py-1.5 rounded-lg font-semibold uppercase ${
                        selectedType === t
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Endpoint URL / Target *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://mcp.local:8080/sse or stdio://binary"
                  value={newServerUrl}
                  onChange={(e) => setNewServerUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Bearer Token / API Key</label>
                <input
                  type="password"
                  placeholder="Optional authentication header..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg"
                >
                  Connect MCP Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
