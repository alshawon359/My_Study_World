'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowDown, ArrowUp, BookOpen, Brain, Check, CheckCircle2, Circle, Clock3,
  ExternalLink, FileText, Layers3, Link2, ListChecks, Loader2, Pencil, Plus, Sparkles, Trash2, Video,
} from 'lucide-react';

type Subtopic = { id: string; name: string; completed: boolean };
type Topic = { id: string; levelId: string; name: string; estimatedTime: string | null; completed: boolean; videoLinks: string; resources: string | null; subtopics: string };
type Level = { id: string; userId: string; title: string; description: string | null; estimatedWeeks: string | null; status: string; order: number; topics: Topic[] };
type LevelForm = { title: string; description: string; estimatedWeeks: string };
type TopicForm = { name: string; estimatedTime: string; resources: string; videoLinks: string; subtopics: string };

const userId = 'cmtszibhe0000uzf04p06d1fe';
const emptyLevel: LevelForm = { title: '', description: '', estimatedWeeks: '' };
const emptyTopic: TopicForm = { name: '', estimatedTime: '', resources: '', videoLinks: '', subtopics: '' };

const readJson = <T,>(value: string | null | undefined, fallback: T): T => {
  try { const parsed = JSON.parse(value || ''); return parsed ?? fallback; } catch { return fallback; }
};
const getSubtopics = (topic: Topic): Subtopic[] => readJson(topic.subtopics, []);
const getLinks = (topic: Topic): string[] => readJson(topic.videoLinks, []);
const levelStats = (level: Level) => {
  const subtopics = level.topics.flatMap(getSubtopics);
  const total = level.topics.length + subtopics.length;
  const completed = level.topics.filter((topic) => topic.completed).length + subtopics.filter((item) => item.completed).length;
  return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0, subtopics };
};

export default function AIRoadmapPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [levelForm, setLevelForm] = useState<LevelForm>(emptyLevel);
  const [topicForm, setTopicForm] = useState<TopicForm>(emptyTopic);
  const [levelDialog, setLevelDialog] = useState(false);
  const [topicDialog, setTopicDialog] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [topicLevelId, setTopicLevelId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai-roadmap?userId=${userId}`);
      if (response.ok) setLevels((await response.json()).sort((a: Level, b: Level) => a.order - b.order));
    } finally { setLoading(false); }
  };
  useEffect(() => { void loadLevels(); }, []);

  const saveLevel = async () => {
    if (!levelForm.title.trim()) return alert('Please enter a level title.');
    setSaving(true);
    const body = { userId, ...levelForm, status: 'not-started', order: editingLevelId ? undefined : levels.length };
    const response = await fetch('/api/ai-roadmap', { method: editingLevelId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingLevelId ? { id: editingLevelId, ...body } : body) });
    if (response.ok) { const level = await response.json(); setLevels((current) => editingLevelId ? current.map((item) => item.id === level.id ? { ...item, ...level } : item) : [...current, level]); setLevelForm(emptyLevel); setEditingLevelId(null); setLevelDialog(false); }
    setSaving(false);
  };

  const deleteLevel = async (id: string) => {
    if (!confirm('Delete this level and all its topics?')) return;
    if ((await fetch(`/api/ai-roadmap?id=${id}`, { method: 'DELETE' })).ok) setLevels((current) => current.filter((level) => level.id !== id));
  };

  const saveTopic = async () => {
    if (!topicForm.name.trim() || !topicLevelId) return alert('Please enter a topic name.');
    setSaving(true);
    const subtopics = topicForm.subtopics.split('\n').map((name) => name.trim()).filter(Boolean).map((name, index) => ({ id: `${Date.now()}-${index}`, name, completed: false }));
    const videoLinks = topicForm.videoLinks.split('\n').map((link) => link.trim()).filter(Boolean);
    const response = await fetch('/api/ai-roadmap/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ levelId: topicLevelId, name: topicForm.name, estimatedTime: topicForm.estimatedTime || null, resources: topicForm.resources || null, videoLinks, subtopics }) });
    if (response.ok) { const topic = await response.json(); setLevels((current) => current.map((level) => level.id === topicLevelId ? { ...level, topics: [...level.topics, topic] } : level)); setTopicForm(emptyTopic); setTopicDialog(false); setTopicLevelId(null); }
    setSaving(false);
  };

  const updateTopic = async (topic: Topic, patch: { name?: string; estimatedTime?: string | null; completed?: boolean; resources?: string | null; subtopics?: Subtopic[]; videoLinks?: string[] }) => {
    const response = await fetch('/api/ai-roadmap/topics', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: topic.id, ...patch }) });
    if (response.ok) { const updated = await response.json(); setLevels((current) => current.map((level) => ({ ...level, topics: level.topics.map((item) => item.id === updated.id ? updated : item) }))); }
  };

  const toggleTopic = (topic: Topic) => void updateTopic(topic, { completed: !topic.completed });
  const toggleSubtopic = (topic: Topic, subtopicId: string) => void updateTopic(topic, { subtopics: getSubtopics(topic).map((item) => item.id === subtopicId ? { ...item, completed: !item.completed } : item) });
  const deleteTopic = async (id: string) => { if (!confirm('Delete this topic?')) return; if ((await fetch(`/api/ai-roadmap/topics?id=${id}`, { method: 'DELETE' })).ok) setLevels((current) => current.map((level) => ({ ...level, topics: level.topics.filter((topic) => topic.id !== id) }))); };
  const openAddTopic = (levelId: string) => { setTopicLevelId(levelId); setTopicForm(emptyTopic); setTopicDialog(true); };
  const openEditLevel = (level: Level) => { setEditingLevelId(level.id); setLevelForm({ title: level.title, description: level.description || '', estimatedWeeks: level.estimatedWeeks || '' }); setLevelDialog(true); };
  const moveLevel = async (level: Level, direction: -1 | 1) => { const target = levels.find((item) => item.order === level.order + direction); if (!target) return; await Promise.all([fetch('/api/ai-roadmap', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: level.id, order: target.order }) }), fetch('/api/ai-roadmap', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: target.id, order: level.order }) })]); void loadLevels(); };

  const overall = levels.reduce((acc, level) => { const stats = levelStats(level); return { total: acc.total + stats.total, completed: acc.completed + stats.completed }; }, { total: 0, completed: 0 });
  const overallPercent = overall.total ? Math.round((overall.completed / overall.total) * 100) : 0;

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600"><Loader2 className="mr-3 h-6 w-6 animate-spin text-cyan-600" />Loading your roadmap...</div>;

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/50 to-white px-4 py-6 font-semibold text-slate-900 sm:px-6 lg:py-8"><div className="mx-auto max-w-7xl">
    <section className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8"><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700"><Sparkles className="h-4 w-4" /> Personal learning system</div><div className="flex items-center gap-3"><div className="rounded-2xl bg-slate-950 p-3 shadow-lg"><Brain className="h-8 w-8 text-cyan-300" /></div><div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">AI / ML Roadmap</h1><p className="mt-1 max-w-xl text-sm text-slate-500 md:text-base">Build a deliberate path from fundamentals to research-ready fluency.</p></div></div></div><Dialog open={levelDialog} onOpenChange={setLevelDialog}><DialogTrigger asChild><Button onClick={() => { setEditingLevelId(null); setLevelForm(emptyLevel); }} className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />Add level</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{editingLevelId ? 'Edit level' : 'Create a learning level'}</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Level title *</Label><Input value={levelForm.title} onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })} placeholder="Foundations, Deep Learning..." /></div><div><Label>Description</Label><Textarea value={levelForm.description} onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })} rows={3} /></div><div><Label>Estimated duration</Label><Input value={levelForm.estimatedWeeks} onChange={(e) => setLevelForm({ ...levelForm, estimatedWeeks: e.target.value })} placeholder="4 weeks" /></div><Button onClick={saveLevel} disabled={saving} className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}{editingLevelId ? 'Save changes' : 'Create level'}</Button></div></DialogContent></Dialog></div><div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:px-8"><span className="font-semibold">{levels.length} levels</span><span>•</span><span className="font-semibold">{overall.completed} of {overall.total} learning items complete</span></div></section>
      <section className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8"><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700"><Sparkles className="h-4 w-4" /> Personal learning system</div><div className="flex items-center gap-3"><div className="rounded-2xl bg-slate-950 p-3 shadow-lg"><Brain className="h-8 w-8 text-cyan-300" /></div><div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Roadmap</h1><p className="mt-1 max-w-xl text-sm text-slate-500 md:text-base">Build a deliberate path from fundamentals to research-ready fluency.</p></div></div></div><Dialog open={levelDialog} onOpenChange={setLevelDialog}><DialogTrigger asChild><Button onClick={() => { setEditingLevelId(null); setLevelForm(emptyLevel); }} className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />Add level</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{editingLevelId ? 'Edit level' : 'Create a learning level'}</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Level title *</Label><Input value={levelForm.title} onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })} placeholder="Foundations, Deep Learning..." /></div><div><Label>Description</Label><Textarea value={levelForm.description} onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })} rows={3} /></div><div><Label>Estimated duration</Label><Input value={levelForm.estimatedWeeks} onChange={(e) => setLevelForm({ ...levelForm, estimatedWeeks: e.target.value })} placeholder="4 weeks" /></div><Button onClick={saveLevel} disabled={saving} className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}{editingLevelId ? 'Save changes' : 'Create level'}</Button></div></DialogContent></Dialog></div><div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:px-8"><span className="font-semibold">{levels.length} levels</span><span>•</span><span className="font-semibold">{overall.completed} of {overall.total} learning items complete</span></div></section>
    <section className="mb-7 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_280px] md:items-center"><div><div className="mb-2 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Overall progress</p><p className="text-xs text-slate-500">Topics and subtopics count together</p></div><span className="text-3xl font-bold text-cyan-700">{overallPercent}%</span></div><Progress value={overallPercent} className="h-3" /></div><div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-slate-50 p-3"><Layers3 className="mx-auto mb-1 h-4 w-4 text-cyan-600" /><p className="text-xl font-bold">{levels.length}</p><p className="text-[11px] text-slate-500">Levels</p></div><div className="rounded-xl bg-slate-50 p-3"><ListChecks className="mx-auto mb-1 h-4 w-4 text-indigo-600" /><p className="text-xl font-bold">{overall.total}</p><p className="text-[11px] text-slate-500">Items</p></div><div className="rounded-xl bg-slate-50 p-3"><CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-emerald-600" /><p className="text-xl font-bold">{overall.completed}</p><p className="text-[11px] text-slate-500">Done</p></div></div></section>
    {levels.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center"><Brain className="mx-auto mb-4 h-12 w-12 text-slate-300" /><p className="font-semibold">Your roadmap is empty</p><p className="mt-1 text-sm text-slate-500">Create your first level and turn a big goal into a clear sequence.</p></div> : <div className="space-y-5">{levels.map((level, index) => { const stats = levelStats(level); const isOpen = expanded[level.id] !== false; return <Card key={level.id} className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-cyan-50/60"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-cyan-300">{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><CardTitle className="text-xl">{level.title}</CardTitle><Badge className={stats.percent === 100 && stats.total > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}>{stats.percent === 100 && stats.total > 0 ? 'Completed' : stats.percent > 0 ? 'In progress' : 'Not started'}</Badge></div>{level.description && <p className="mt-1 text-sm text-slate-500">{level.description}</p>}<div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">{level.estimatedWeeks && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{level.estimatedWeeks}</span>}<span>{stats.completed}/{stats.total} items</span></div></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => moveLevel(level, -1)} disabled={index === 0} title="Move level up"><ArrowUp className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => moveLevel(level, 1)} disabled={index === levels.length - 1} title="Move level down"><ArrowDown className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => openEditLevel(level)} title="Edit level"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteLevel(level.id)} className="text-red-500" title="Delete level"><Trash2 className="h-4 w-4" /></Button></div></div><div className="mt-5 flex items-center gap-3"><Progress value={stats.percent} className="h-2 flex-1" /><span className="w-10 text-right text-sm font-bold text-cyan-700">{stats.percent}%</span><Button variant="ghost" size="sm" onClick={() => setExpanded((current) => ({ ...current, [level.id]: !isOpen }))}>{isOpen ? 'Collapse' : 'Expand'}</Button></div></CardHeader>{isOpen && <CardContent className="space-y-3 p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-700">Topics & subtopics</p><Button size="sm" onClick={() => openAddTopic(level.id)} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="mr-1 h-4 w-4" />Add topic</Button></div>{level.topics.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No topics yet. Add the first milestone for this level.</div> : level.topics.map((topic) => { const subs = getSubtopics(topic); const links = getLinks(topic); return <div key={topic.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-start gap-3"><button onClick={() => toggleTopic(topic)} className="mt-0.5 rounded-full" aria-label={`Mark ${topic.name} complete`}>{topic.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-400" />}</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className={`font-semibold ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{topic.name}</p>{topic.estimatedTime && <span className="text-xs text-slate-500">{topic.estimatedTime}</span>}</div><div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500"><span>{subs.filter((item) => item.completed).length}/{subs.length} subtopics</span>{links.length > 0 && <span className="inline-flex items-center gap-1 text-cyan-700"><Video className="h-3.5 w-3.5" />{links.length} videos</span>}{topic.resources && <a href={topic.resources} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600"><Link2 className="h-3.5 w-3.5" />Resource</a>}</div></div><Button variant="ghost" size="icon" onClick={() => deleteTopic(topic.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button></div>{subs.length > 0 && <div className="mt-3 space-y-1 border-l-2 border-cyan-200 pl-8">{subs.map((subtopic) => <button key={subtopic.id} onClick={() => toggleSubtopic(topic, subtopic.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white">{subtopic.completed ? <Check className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}<span className={subtopic.completed ? 'text-slate-400 line-through' : 'text-slate-600'}>{subtopic.name}</span></button>)}</div>}{links.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{links.map((link) => <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-cyan-700 shadow-sm hover:bg-cyan-50"><ExternalLink className="h-3 w-3" />Video</a>)}</div>}</div>; })}</CardContent>}</Card>; })}</div>}

    <Dialog open={topicDialog} onOpenChange={setTopicDialog}><DialogContent className="max-h-[92vh] overflow-y-auto"><DialogHeader><DialogTitle>Add a topic with learning resources</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Topic name *</Label><Input value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="Neural network fundamentals" /></div><div><Label>Estimated time</Label><Input value={topicForm.estimatedTime} onChange={(e) => setTopicForm({ ...topicForm, estimatedTime: e.target.value })} placeholder="3 hours" /></div><div><Label>Subtopics</Label><Textarea value={topicForm.subtopics} onChange={(e) => setTopicForm({ ...topicForm, subtopics: e.target.value })} rows={5} placeholder="One subtopic per line" /></div><div><Label>Video URLs</Label><Textarea value={topicForm.videoLinks} onChange={(e) => setTopicForm({ ...topicForm, videoLinks: e.target.value })} rows={3} placeholder="One YouTube or course URL per line" /></div><div><Label>Resource URL</Label><Input value={topicForm.resources} onChange={(e) => setTopicForm({ ...topicForm, resources: e.target.value })} placeholder="https://course, docs, or article" /></div><Button onClick={saveTopic} disabled={saving} className="w-full bg-cyan-600 hover:bg-cyan-700">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Add topic</Button></div></DialogContent></Dialog>
  </div></div>;
}
