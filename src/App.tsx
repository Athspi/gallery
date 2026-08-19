import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { AppSettings, ChatMessage, McpServer, ModelItem, SkillDefinition, BenchmarkResult } from './types';
import { Navbar } from './components/Navbar';
import { ModelManagerView } from './components/ModelManager/ModelManagerView';
import { AgentChatView } from './components/AgentChat/AgentChatView';
import { SingleTurnView } from './components/SingleTurn/SingleTurnView';
import { SkillManagerView } from './components/SkillManager/SkillManagerView';
import { McpManagerView } from './components/McpManager/McpManagerView';
import { MobileActionsView } from './components/MobileActions/MobileActionsView';
import { BenchmarkSuiteView } from './components/BenchmarkSuite/BenchmarkSuiteView';
import { SettingsDialog } from './components/common/SettingsDialog';
import { ModelPickerModal } from './components/common/ModelPickerModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('agent-chat');
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [models, setModels] = useState<ModelItem[]>(() => storage.getModels());
  const [skills, setSkills] = useState<SkillDefinition[]>(() => storage.getSkills());
  const [mcpServers, setMcpServers] = useState<McpServer[]>(() => storage.getMcpServers());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => storage.getChatHistory());
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>(() => storage.getBenchmarks());

  const [selectedModel, setSelectedModel] = useState<ModelItem>(() => {
    const saved = storage.getModels();
    const defaultId = storage.getSettings().defaultModelId;
    return saved.find((m) => m.id === defaultId) || saved[0];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.saveModels(models);
  }, [models]);

  useEffect(() => {
    storage.saveSkills(skills);
  }, [skills]);

  useEffect(() => {
    storage.saveMcpServers(mcpServers);
  }, [mcpServers]);

  useEffect(() => {
    storage.saveChatHistory(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    storage.saveBenchmarks(benchmarks);
  }, [benchmarks]);

  const handleUpdateModelStatus = (modelId: string, status: ModelItem['status']) => {
    const updated = models.map((m) => (m.id === modelId ? { ...m, status } : m));
    setModels(updated);
    if (selectedModel.id === modelId) {
      setSelectedModel({ ...selectedModel, status });
    }
  };

  const handleAddCustomModel = (newModel: ModelItem) => {
    setModels([newModel, ...models]);
  };

  const handleToggleSkill = (skillId: string) => {
    const updated = skills.map((s) => (s.id === skillId ? { ...s, enabled: !s.enabled } : s));
    setSkills(updated);
  };

  const handleSaveSkill = (newSkill: SkillDefinition) => {
    setSkills([newSkill, ...skills]);
  };

  const handleAddBenchmarkResult = (result: BenchmarkResult) => {
    setBenchmarks([result, ...benchmarks]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 3-Zone Fixed Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedModel={selectedModel}
        onOpenModelPicker={() => setIsModelPickerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'models' && (
          <ModelManagerView
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onUpdateModelStatus={handleUpdateModelStatus}
            onAddCustomModel={handleAddCustomModel}
          />
        )}

        {currentTab === 'agent-chat' && (
          <AgentChatView
            chatHistory={chatHistory}
            onUpdateChatHistory={setChatHistory}
            selectedModel={selectedModel}
            skills={skills}
            settings={settings}
          />
        )}

        {currentTab === 'single-turn' && (
          <SingleTurnView selectedModel={selectedModel} settings={settings} />
        )}

        {currentTab === 'skills' && (
          <SkillManagerView
            skills={skills}
            onToggleSkill={handleToggleSkill}
            onSaveSkill={handleSaveSkill}
          />
        )}

        {currentTab === 'mcp' && (
          <McpManagerView servers={mcpServers} onUpdateServers={setMcpServers} />
        )}

        {currentTab === 'actions' && <MobileActionsView />}

        {currentTab === 'benchmarks' && (
          <BenchmarkSuiteView
            models={models}
            selectedModel={selectedModel}
            benchmarks={benchmarks}
            onAddBenchmarkResult={handleAddBenchmarkResult}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        models={models}
        onSave={setSettings}
      />

      <ModelPickerModal
        isOpen={isModelPickerOpen}
        onClose={() => setIsModelPickerOpen(false)}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
};

export default App;
