'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { upload } from '@vercel/blob/client';
import {
  BookOpen, CheckCircle2, Clock3, Download, Edit, ExternalLink, Eye, File, FileImage,
  FileText, Loader2, Plus, Presentation, Search, Sparkles, Trash2, Upload, X,
} from 'lucide-react';

type PaperStatus = 'TO_READ' | 'READING' | 'READ' | 'IMPORTANT' | 'USED_IN_RESEARCH';

interface PaperMaterial {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  dataUrl?: string;
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: string | null;
  link: string | null;
  topic: string | null;
  status: PaperStatus;
  researchProblem: string | null;
  dataset: string | null;
  method: string | null;
  model: string | null;
  results: string | null;
  limitations: string | null;
  importantNotes: string | null;
  myThoughts: string | null;
  researchIdeas: string | null;
  materials: string;
}

interface PaperFormData {
  title: string;
  authors: string;
  year: string;
  link: string;
  topic: string;
  status: PaperStatus;
  researchProblem: string;
  dataset: string;
  method: string;
  model: string;
  results: string;
  limitations: string;
  importantNotes: string;
  myThoughts: string;
  researchIdeas: string;
  materials: PaperMaterial[];
}

const userId = 'cmtszibhe0000uzf04p06d1fe';
const STATUS_OPTIONS: { value: PaperStatus; label: string; color: string }[] = [
  { value: 'TO_READ', label: 'To Read', color: 'bg-slate-700 text-slate-200' },
  { value: 'READING', label: 'Reading', color: 'bg-blue-500/20 text-blue-200' },
  { value: 'READ', label: 'Read', color: 'bg-emerald-500/20 text-emerald-200' },
  { value: 'IMPORTANT', label: 'Important', color: 'bg-amber-500/20 text-amber-200' },
  { value: 'USED_IN_RESEARCH', label: 'Used in Research', color: 'bg-fuchsia-500/20 text-fuchsia-200' },
];

const emptyForm: PaperFormData = {
  title: '', authors: '', year: '', link: '', topic: '', status: 'TO_READ', researchProblem: '',
  dataset: '', method: '', model: '', results: '', limitations: '', importantNotes: '', myThoughts: '',
  researchIdeas: '', materials: [],
};

const parseMaterials = (value: string | PaperMaterial[]) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const paperToForm = (paper: ResearchPaper): PaperFormData => ({
  title: paper.title, authors: paper.authors, year: paper.year || '', link: paper.link || '', topic: paper.topic || '',
  status: paper.status, researchProblem: paper.researchProblem || '', dataset: paper.dataset || '', method: paper.method || '',
  model: paper.model || '', results: paper.results || '', limitations: paper.limitations || '', importantNotes: paper.importantNotes || '',
  myThoughts: paper.myThoughts || '', researchIdeas: paper.researchIdeas || '', materials: parseMaterials(paper.materials),
});

function MaterialIcon({ type }: { type: string }) {
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-300" />;
  if (type.includes('presentation')) return <Presentation className="h-4 w-4 text-orange-300" />;
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4 text-cyan-300" />;
  return <File className="h-4 w-4 text-slate-600" />;
}

function PaperEditor({ formData, setFormData, onUpload, onRemoveMaterial, onSave, onCancel, isSaving, saveLabel }: {
  formData: PaperFormData;
  setFormData: React.Dispatch<React.SetStateAction<PaperFormData>>;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveMaterial: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  saveLabel: string;
}) {
  const set = (key: keyof PaperFormData, value: string | PaperStatus) => setFormData((current) => ({ ...current, [key]: value }));
  return (
    <div className="space-y-5 font-semibold">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><Label>Paper title *</Label><Input value={formData.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Machine learning for antenna optimization" /></div>
        <div><Label>Authors *</Label><Input value={formData.authors} onChange={(e) => set('authors', e.target.value)} placeholder="Author names" /></div>
        <div><Label>Topic</Label><Input value={formData.topic} onChange={(e) => set('topic', e.target.value)} placeholder="AI, antenna design, NLP..." /></div>
        <div><Label>Year</Label><Input value={formData.year} onChange={(e) => set('year', e.target.value)} placeholder="2024" /></div>
        <div><Label>Status</Label><Select value={formData.status} onValueChange={(value) => set('status', value as PaperStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="md:col-span-2"><Label>Paper URL</Label><Input value={formData.link} onChange={(e) => set('link', e.target.value)} placeholder="https://doi.org/..." /></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between"><div><p className="font-semibold">Research analysis</p><p className="text-xs text-slate-500">Capture the parts you will want when writing later.</p></div><Sparkles className="h-4 w-4 text-cyan-300" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          {([['researchProblem', 'Research problem'], ['dataset', 'Dataset'], ['method', 'Method'], ['model', 'Model / approach'], ['results', 'Key results'], ['limitations', 'Limitations']] as const).map(([key, label]) => <div key={key}><Label>{label}</Label><Input value={formData[key]} onChange={(e) => set(key, e.target.value)} /></div>)}
          {([['importantNotes', 'Important notes'], ['myThoughts', 'My thoughts'], ['researchIdeas', 'Research ideas']] as const).map(([key, label]) => <div key={key} className="md:col-span-2"><Label>{label}</Label><Textarea value={formData[key]} onChange={(e) => set(key, e.target.value)} rows={3} placeholder={`Write ${label.toLowerCase()}...`} /></div>)}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.04] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Materials</p><p className="text-xs text-slate-500">Upload PDFs, presentations, images, and supporting files to your library.</p></div><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"><Upload className="h-4 w-4" /> Add files<input type="file" className="hidden" accept=".pdf,.ppt,.pptx,image/*" multiple onChange={onUpload} /></label></div>
        {formData.materials.length > 0 && <div className="mt-4 space-y-2">{formData.materials.map((material) => <div key={material.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100 px-3 py-2"><div className="flex min-w-0 items-center gap-2"><MaterialIcon type={material.type} /><span className="truncate text-sm">{material.name}</span><span className="text-xs text-slate-500">{(material.size / 1024 / 1024).toFixed(1)} MB</span></div><button type="button" onClick={() => onRemoveMaterial(material.id)} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-slate-900" aria-label={`Remove ${material.name}`}><X className="h-4 w-4" /></button></div>)}</div>}
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button><Button onClick={onSave} disabled={isSaving} className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{saveLabel}</Button></div>
    </div>
  );
}

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formData, setFormData] = useState<PaperFormData>(emptyForm);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'view' | 'edit' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/research-papers?userId=${userId}`);
      if (response.ok) setPapers(await response.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadPapers(); }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setIsSaving(true);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const blob = await upload(`research-materials/${Date.now()}-${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/research-materials/upload',
        });
        return { id: `${Date.now()}-${file.name}`, name: file.name, type: file.type || 'application/octet-stream', size: file.size, url: blob.url, dataUrl: blob.url };
      }));
      setFormData((current) => ({ ...current, materials: [...current.materials, ...uploaded] }));
    } catch (error) {
      console.error('Research material upload failed:', error);
      alert('Upload failed. Please connect Vercel Blob storage first.');
    } finally {
      setIsSaving(false);
    }
    event.target.value = '';
  };

  const savePaper = async () => {
    if (!formData.title.trim() || !formData.authors.trim()) { alert('Please enter the paper title and authors.'); return; }
    setIsSaving(true);
    const payload = { userId, ...formData, year: formData.year || null, link: formData.link || null, topic: formData.topic || null };
    const response = await fetch('/api/research-papers', { method: dialogMode === 'edit' ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dialogMode === 'edit' ? { id: selectedPaper?.id, ...payload } : payload) });
    if (response.ok) { const saved = await response.json(); setPapers((current) => dialogMode === 'edit' ? current.map((paper) => paper.id === saved.id ? saved : paper) : [saved, ...current]); setDialogMode(null); setSelectedPaper(null); setFormData(emptyForm); }
    setIsSaving(false);
  };

  const deletePaper = async (id: string) => {
    if (!confirm('Delete this paper permanently?')) return;
    const response = await fetch(`/api/research-papers?id=${id}`, { method: 'DELETE' });
    if (response.ok) { setPapers((current) => current.filter((paper) => paper.id !== id)); setDialogMode(null); setSelectedPaper(null); }
  };

  const filteredPapers = papers.filter((paper) => (paper.title.toLowerCase().includes(searchQuery.toLowerCase()) || paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) || (paper.topic || '').toLowerCase().includes(searchQuery.toLowerCase())) && (statusFilter === 'ALL' || paper.status === statusFilter));
  const openPaper = (paper: ResearchPaper) => { setSelectedPaper(paper); setFormData(paperToForm(paper)); setDialogMode('view'); };
  const statusLabel = (status: PaperStatus) => STATUS_OPTIONS.find((option) => option.value === status);
  const removeMaterial = (id: string) => setFormData((current) => ({ ...current, materials: current.materials.filter((material) => material.id !== id) }));
  const metrics: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { label: 'Total papers', value: papers.length, icon: FileText, color: 'text-cyan-300' },
    { label: 'In progress', value: papers.filter((paper) => paper.status === 'READING').length, icon: Clock3, color: 'text-amber-300' },
    { label: 'Completed', value: papers.filter((paper) => paper.status === 'READ').length, icon: CheckCircle2, color: 'text-emerald-300' },
    { label: 'Priority', value: papers.filter((paper) => ['IMPORTANT', 'USED_IN_RESEARCH'].includes(paper.status)).length, icon: Sparkles, color: 'text-fuchsia-300' },
  ];

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 font-semibold text-slate-600"><Loader2 className="mr-3 h-6 w-6 animate-spin text-cyan-600" />Loading your research library...</div>;

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/50 to-white p-4 font-semibold text-slate-900 sm:p-6"><div className="mx-auto max-w-7xl">
    <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md md:p-8"><div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700"><Sparkles className="h-4 w-4" /> Research library</div><div className="flex items-center gap-3"><div className="rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 p-3"><BookOpen className="h-8 w-8 text-slate-950" /></div><div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Research Papers</h1><p className="mt-1 text-sm font-semibold text-slate-600 md:text-base">A focused home for your literature, insights, and evidence.</p></div></div></div><Dialog open={dialogMode === 'add'} onOpenChange={(open) => { if (!open) setDialogMode(null); }}><DialogTrigger asChild><Button onClick={() => { setFormData(emptyForm); setDialogMode('add'); }} className="h-11 rounded-xl bg-cyan-300 px-5 font-bold text-slate-950 hover:bg-cyan-200"><Plus className="mr-2 h-4 w-4" />Add paper</Button></DialogTrigger><DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-slate-700 bg-white text-slate-900"><DialogHeader><DialogTitle className="text-xl">Add to your research library</DialogTitle></DialogHeader><PaperEditor formData={formData} setFormData={setFormData} onUpload={handleUpload} onRemoveMaterial={removeMaterial} onSave={savePaper} onCancel={() => setDialogMode(null)} isSaving={isSaving} saveLabel="Save paper" /></DialogContent></Dialog></div></section>
    <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">{metrics.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span><Icon className={`h-4 w-4 ${color}`} /></div><div className="mt-3 text-3xl font-bold">{value}</div></div>)}</div>
    <div className="mb-7 grid gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-3 md:grid-cols-[1fr_220px]"><div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" /><Input placeholder="Search title, author, or topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 border-slate-200 bg-white/[0.08] pl-10 text-slate-900 placeholder:text-slate-500" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-11 border-slate-200 bg-white/[0.08] text-slate-900"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem>{STATUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredPapers.length === 0 ? <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center"><FileText className="mx-auto mb-4 h-12 w-12 text-slate-600" /><p className="text-lg font-semibold text-slate-200">No papers match this view</p><p className="mt-1 text-sm text-slate-500">Add a paper or adjust your search to continue.</p></div> : filteredPapers.map((paper) => { const status = statusLabel(paper.status); const materials = parseMaterials(paper.materials); return <Card key={paper.id} onClick={() => openPaper(paper)} className="group cursor-pointer rounded-2xl border-slate-200 bg-white shadow-xl shadow-slate-950/20 transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/[0.09]"><CardHeader><div className="flex items-start justify-between gap-3"><div className="min-w-0"><CardTitle className="line-clamp-2 text-lg text-slate-900">{paper.title}</CardTitle><p className="mt-1 line-clamp-1 text-sm text-slate-500">{paper.authors}</p></div>{status && <Badge className={`shrink-0 border-0 ${status.color}`}>{status.label}</Badge>}</div></CardHeader><CardContent><div className="space-y-3 text-sm"><div className="flex flex-wrap gap-2 text-slate-500">{paper.year && <span>{paper.year}</span>}{paper.topic && <span className="rounded-full bg-white/10 px-2 py-0.5">{paper.topic}</span>}{materials.length > 0 && <span className="inline-flex items-center gap-1 text-cyan-300"><File className="h-3 w-3" />{materials.length} material{materials.length > 1 ? 's' : ''}</span>}</div>{paper.researchProblem && <p className="line-clamp-2 text-slate-600">{paper.researchProblem}</p>}<div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500"><span>Open paper details</span><Eye className="h-4 w-4 text-cyan-300" /></div></div></CardContent></Card>; })}</div>

    <Dialog open={dialogMode === 'view' || dialogMode === 'edit'} onOpenChange={(open) => { if (!open) { setDialogMode(null); setSelectedPaper(null); } }}><DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-slate-700 bg-white text-slate-900"><DialogHeader><div className="flex items-center justify-between"><DialogTitle className="text-xl">{dialogMode === 'edit' ? 'Edit research paper' : 'Paper details'}</DialogTitle>{dialogMode === 'view' && <Button variant="ghost" size="sm" onClick={() => setDialogMode('edit')}><Edit className="mr-2 h-4 w-4" />Edit</Button>}</div></DialogHeader>{dialogMode === 'edit' ? <PaperEditor formData={formData} setFormData={setFormData} onUpload={handleUpload} onRemoveMaterial={removeMaterial} onSave={savePaper} onCancel={() => setDialogMode('view')} isSaving={isSaving} saveLabel="Update paper" /> : selectedPaper && <div className="space-y-5"><div><div className="mb-2 flex flex-wrap gap-2">{statusLabel(selectedPaper.status) && <Badge className={`border-0 ${statusLabel(selectedPaper.status)?.color}`}>{statusLabel(selectedPaper.status)?.label}</Badge>}{selectedPaper.year && <span className="text-sm text-slate-500">{selectedPaper.year}</span>}</div><h2 className="text-2xl font-bold">{selectedPaper.title}</h2><p className="mt-1 text-slate-500">{selectedPaper.authors}</p></div>{selectedPaper.link && <a href={selectedPaper.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"><ExternalLink className="h-4 w-4" />Open source paper</a>}<div className="grid gap-4 sm:grid-cols-2">{[['Research problem', selectedPaper.researchProblem], ['Dataset', selectedPaper.dataset], ['Method', selectedPaper.method], ['Model', selectedPaper.model], ['Key results', selectedPaper.results], ['Limitations', selectedPaper.limitations], ['Important notes', selectedPaper.importantNotes], ['My thoughts', selectedPaper.myThoughts], ['Research ideas', selectedPaper.researchIdeas]].filter(([, value]) => value).map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{value}</p></div>)}</div>{parseMaterials(selectedPaper.materials).length > 0 && <div><p className="mb-2 text-sm font-semibold">Materials</p><div className="space-y-2">{parseMaterials(selectedPaper.materials).map((material) => <a key={material.id} href={material.dataUrl} download={material.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-white/10"><span className="flex min-w-0 items-center gap-2"><MaterialIcon type={material.type} /><span className="truncate text-sm">{material.name}</span></span><Download className="h-4 w-4 text-cyan-300" /></a>)}</div></div>}<Button variant="destructive" onClick={() => deletePaper(selectedPaper.id)}><Trash2 className="mr-2 h-4 w-4" />Delete paper</Button></div>}</DialogContent></Dialog>
  </div></div>;
}
