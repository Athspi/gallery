import React, { useState } from 'react';
import { SkillDefinition } from '../../types';
import { Plus, Play, Wrench, Check, Code, Sparkles, ExternalLink, Shield } from 'lucide-react';
import { executeSkillScript } from '../../services/skillExecutor';
import { VirtualPianoView } from '../SkillsInteractive/VirtualPianoView';
import { TinyGardenView } from '../SkillsInteractive/TinyGardenView';
import { MoodTrackerView } from '../SkillsInteractive/MoodTrackerView';
import { LearnSomethingNewView } from '../SkillsInteractive/LearnSomethingNewView';
import { QrCodeView } from '../SkillsInteractive/QrCodeView';
import { TextSpinnerView } from '../SkillsInteractive/TextSpinnerView';
import { InteractiveMapView } from '../SkillsInteractive/InteractiveMapView';
import { WikipediaView } from '../SkillsInteractive/WikipediaView';
import { MoodMusicView } from '../SkillsInteractive/MoodMusicView';

interface SkillManagerViewProps {
  skills: SkillDefinition[];
  onToggleSkill: (skillId: string) => void;
  onSaveSkill: (skill: SkillDefinition) => void;
}

export const SkillManagerView: React.FC<SkillManagerViewProps> = ({
  skills,
  onToggleSkill,
  onSaveSkill,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [testingSkill, setTestingSkill] = useState<SkillDefinition | null>(null);
  const [testInputJson, setTestInputJson] = useState<string>('{}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecutingTest, setIsExecutingTest] = useState<boolean>(false);

  // New/Edit Custom Skill Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<Partial<SkillDefinition>>({
    name: '',
    description: '',
    category: 'Utility',
    version: '1.0.0',
    toolDefinition: {
      name: '',
      description: '',
      parameters: { type: 'object', properties: {}, required: [] },
    },
    scriptJs: `// JS Execution Handler\nconst data = typeof input === 'string' ? JSON.parse(input) : input;\nreturn { result: 'Custom skill executed', payload: data };`,
  });

  const categories = ['All', 'Featured', 'Interactive', 'Utility', 'Education', 'Gaming', 'Media', 'System'];

  const filteredSkills = skills.filter((s) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Featured') return s.isFeatured;
    return s.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleOpenTester = (skill: SkillDefinition) => {
    setTestingSkill(skill);
    // Generate sample inputs based on parameters
    const sample: Record<string, any> = {};
    if (skill.toolDefinition.parameters?.properties) {
      Object.entries(skill.toolDefinition.parameters.properties).forEach(([key, prop]) => {
        if (key === 'action') sample[key] = 'log_mood';
        else if (key === 'score') sample[key] = 9;
        else if (key === 'topic') sample[key] = 'Quantum Computing';
        else if (key === 'location') sample[key] = 'Tokyo, Japan';
        else if (key === 'url') sample[key] = 'https://ai.google.dev';
        else if (key === 'genre') sample[key] = 'Lo-Fi';
        else sample[key] = 'sample_value';
      });
    }
    setTestInputJson(JSON.stringify(sample, null, 2));
    setTestResult(null);
  };

  const handleExecuteTest = async () => {
    if (!testingSkill) return;
    setIsExecutingTest(true);
    try {
      const parsed = JSON.parse(testInputJson);
      const res = await executeSkillScript(testingSkill, parsed);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, error: `Invalid JSON input: ${e.message}`, durationMs: 0 });
    } finally {
      setIsExecutingTest(false);
    }
  };

  const handleSaveCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill.name || !editingSkill.toolDefinition?.name) return;

    const newSkill: SkillDefinition = {
      id: `custom-skill-${Date.now()}`,
      name: editingSkill.name,
      description: editingSkill.description || '',
      category: editingSkill.category || 'Utility',
      icon: 'Sparkles',
      version: editingSkill.version || '1.0.0',
      author: 'User Local Sandbox',
      enabled: true,
      toolDefinition: editingSkill.toolDefinition as any,
      scriptJs: editingSkill.scriptJs || 'return { result: "Success" };',
    };

    onSaveSkill(newSkill);
    setIsEditModalOpen(false);
  };

  const renderInteractivePayload = (toolCall: any) => {
    const type = toolCall.interactiveType;
    const payload = toolCall.payload || toolCall.result?.payload;

    switch (type) {
      case 'virtual-piano':
        return <VirtualPianoView payload={payload} />;
      case 'tiny-garden':
        return <TinyGardenView payload={payload} />;
      case 'mood-tracker':
        return <MoodTrackerView payload={payload} />;
      case 'learn-something-new':
        return <LearnSomethingNewView payload={payload} />;
      case 'qr-code':
        return <QrCodeView payload={payload} />;
      case 'text-spinner':
        return <TextSpinnerView payload={payload} />;
      case 'interactive-map':
        return <InteractiveMapView payload={payload} />;
      case 'wikipedia-query':
        return <WikipediaView payload={payload} />;
      case 'mood-music':
        return <MoodMusicView payload={payload} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>On-Device Skills & Function Calling</span>
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs rounded-full font-mono">
              {skills.length} Skills Installed
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous client tools and interactive widgets that on-device LLMs can invoke with JSON schemas.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Skill</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              skill.enabled
                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                : 'bg-slate-900/30 border-slate-900 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{skill.name}</h3>
                    {skill.isFeatured && (
                      <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] rounded font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-indigo-400 mt-0.5">
                    {skill.toolDefinition.name}()
                  </p>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => onToggleSkill(skill.id)}
                  className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    skill.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                  title={skill.enabled ? 'Disable Skill' : 'Enable Skill'}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      skill.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {skill.description}
              </p>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Category: <strong className="text-slate-300">{skill.category}</strong></span>
                <span>v{skill.version}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenTester(skill)}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                <span>Test & Run</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skill Tester Modal */}
      {testingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Skill Sandbox: {testingSkill.name}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Function: {testingSkill.toolDefinition.name}(input)
                </p>
              </div>
              <button
                onClick={() => setTestingSkill(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Test Input Payload (JSON)</label>
              <textarea
                value={testInputJson}
                onChange={(e) => setTestInputJson(e.target.value)}
                rows={5}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <button
              onClick={handleExecuteTest}
              disabled={isExecutingTest}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isExecutingTest ? 'Executing in WebSandbox...' : 'Run Skill'}</span>
            </button>

            {/* Test Result View */}
            {testResult && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Execution Output</span>
                  <span className="font-mono text-emerald-400">{testResult.durationMs}ms</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {JSON.stringify(testResult.result || testResult.error, null, 2)}
                </div>

                {/* Interactive Render */}
                {testResult.interactiveType && (
                  <div className="pt-2">
                    {renderInteractivePayload({
                      interactiveType: testResult.interactiveType,
                      payload: testResult.payload || JSON.parse(testInputJson || '{}'),
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Custom Skill Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-100">Create New On-Device Skill</h3>

            <form onSubmit={handleSaveCustomSkill} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Converter"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tool Function Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. convert_units"
                  value={editingSkill.toolDefinition?.name}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill,
                      toolDefinition: { ...editingSkill.toolDefinition!, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Explain when the model should invoke this tool..."
                  value={editingSkill.description}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">JavaScript Code</label>
                <textarea
                  rows={5}
                  value={editingSkill.scriptJs}
                  onChange={(e) => setEditingSkill({ ...editingSkill, scriptJs: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
