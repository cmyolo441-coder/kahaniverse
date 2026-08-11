import React from 'react';
import { SavedStoryProject } from '../types';
import { History, Play, Download, Trash2, Clock, Sparkles, Volume2, Calendar } from 'lucide-react';

interface HistorySectionProps {
  historyProjects: SavedStoryProject[];
  onLoadProject: (project: SavedStoryProject) => void;
  onDeleteProject: (id: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  historyProjects,
  onLoadProject,
  onDeleteProject,
}) => {
  if (historyProjects.length === 0) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full bg-stone-900/60 border border-amber-900/30 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-stone-100">सहेजी गई पुरानी कहानियाँ (Project History)</h2>
        </div>
        <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-900/40 px-2.5 py-1 rounded-full font-medium">
          अंतिम 5 प्रोजेक्ट्स (Last 5 Saved)
        </span>
      </div>

      {/* Grid of Saved Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {historyProjects.map((project) => (
          <div
            key={project.id}
            className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-stone-100 text-sm line-clamp-1 font-serif group-hover:text-amber-300 transition-colors">
                  {project.hindiTitle || project.title}
                </h3>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  title="हटाएं (Delete)"
                  type="button"
                  className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-400">
                <span className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-amber-400">
                  {project.voiceHindiName}
                </span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-stone-300">
                  {project.moodHindiName}
                </span>
                {project.ambianceId !== 'none' && (
                  <span className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-orange-400">
                    {project.ambianceHindiName}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-400/80 line-clamp-2 italic bg-stone-900/50 p-2 rounded border border-stone-900">
                "{project.storyTextSnippet}..."
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-xs text-stone-500">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Calendar className="w-3 h-3 text-stone-500" />
                {formatDate(project.createdAt)}
              </span>

              <button
                onClick={() => onLoadProject(project)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-stone-950 font-bold border border-amber-500/30 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>सुनें / लोड करें</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
