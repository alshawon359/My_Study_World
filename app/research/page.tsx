'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Plus,
  Link2,
  Trash2,
  Eye,
  Edit,
  Search,
  Filter,
  ExternalLink,
  Save,
  X,
  BookOpen,
  Database,
  Loader2,
} from 'lucide-react';

interface ResearchPaper {
  id: string;
  userId: string;
  title: string;
  authors: string;
  year: string | null;
  link: string | null;
  topic: string | null;
  status: 'TO_READ' | 'READING' | 'READ' | 'IMPORTANT' | 'USED_IN_RESEARCH';
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
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'TO_READ', label: 'To Read', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800' },
  { value: 'READING', label: 'Reading', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900' },
  { value: 'READ', label: 'Read', color: 'bg-green-100 text-green-700 dark:bg-green-900' },
  { value: 'IMPORTANT', label: 'Important', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900' },
  { value: 'USED_IN_RESEARCH', label: 'Used in Research', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900' },
];

const userId = 'cmtszibhe0000uzf04p06d1fe'; // Shawon's user ID

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [isAddingPaper, setIsAddingPaper] = useState(false);
  const [isViewingPaper, setIsViewingPaper] = useState(false);
  const [isEditingPaper, setIsEditingPaper] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    link: '',
    topic: '',
    status: 'TO_READ' as ResearchPaper['status'],
    researchProblem: '',
    dataset: '',
    method: '',
    model: '',
    results: '',
    limitations: '',
    importantNotes: '',
    myThoughts: '',
    researchIdeas: '',
  });

  // Load papers on mount
  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/research-papers?userId=${userId}`);
      if (response.ok) {
        const data: ResearchPaper[] = await response.json();
        const legacyPapers = getLegacyPapers();
        const existingKeys = new Set(data.map(getPaperKey));
        const papersToMigrate = legacyPapers.filter((paper) => !existingKeys.has(getPaperKey(paper)));

        if (papersToMigrate.length > 0) {
          const migratedPapers = await Promise.all(
            papersToMigrate.map(async (paper) => {
              const migrationResponse = await fetch('/api/research-papers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...paper }),
              });

              if (!migrationResponse.ok) return null;
              return migrationResponse.json() as Promise<ResearchPaper>;
            })
          );

          const imported = migratedPapers.filter((paper): paper is ResearchPaper => paper !== null);
          setPapers([...imported, ...data]);
        } else {
          setPapers(data);
        }
      }
    } catch (error) {
      console.error('❌ Error loading research papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaperKey = (paper: Pick<ResearchPaper, 'title' | 'authors'>) =>
    `${paper.title.trim().toLowerCase()}::${paper.authors.trim().toLowerCase()}`;

  const getLegacyPapers = () => {
    try {
      const saved = localStorage.getItem('researchPapers');
      if (!saved) return [];

      const legacyPapers = JSON.parse(saved);
      if (!Array.isArray(legacyPapers)) return [];

      return legacyPapers
        .filter((paper) => paper?.title && paper?.authors)
        .map((paper) => ({
          title: String(paper.title),
          authors: Array.isArray(paper.authors) ? paper.authors.join(', ') : String(paper.authors),
          year: paper.year ? String(paper.year) : null,
          link: paper.link || null,
          topic: paper.topic || null,
          status: STATUS_OPTIONS.some((option) => option.value === paper.status) ? paper.status : 'TO_READ',
          researchProblem: paper.researchProblem || null,
          dataset: paper.dataset || null,
          method: paper.method || null,
          model: paper.model || null,
          results: paper.results || null,
          limitations: paper.limitations || null,
          importantNotes: paper.importantNotes || null,
          myThoughts: paper.myThoughts || null,
          researchIdeas: paper.researchIdeas || null,
          materials: Array.isArray(paper.materials) ? paper.materials : [],
        }));
    } catch (error) {
      console.error('❌ Error reading legacy research papers:', error);
      return [];
    }
  };

  const handleAddPaper = async () => {
    if (!formData.title || !formData.authors) {
      alert('Please enter title and authors');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/research-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: formData.title,
          authors: formData.authors,
          year: formData.year || null,
          link: formData.link || null,
          topic: formData.topic || null,
          status: formData.status,
          researchProblem: formData.researchProblem || null,
          dataset: formData.dataset || null,
          method: formData.method || null,
          model: formData.model || null,
          results: formData.results || null,
          limitations: formData.limitations || null,
          importantNotes: formData.importantNotes || null,
          myThoughts: formData.myThoughts || null,
          researchIdeas: formData.researchIdeas || null,
          materials: [],
        }),
      });

      if (response.ok) {
        const newPaper = await response.json();
        setPapers([newPaper, ...papers]);
        setFormData({
          title: '',
          authors: '',
          year: '',
          link: '',
          topic: '',
          status: 'TO_READ',
          researchProblem: '',
          dataset: '',
          method: '',
          model: '',
          results: '',
          limitations: '',
          importantNotes: '',
          myThoughts: '',
          researchIdeas: '',
        });
        setIsAddingPaper(false);
      }
    } catch (error) {
      console.error('❌ Error adding paper:', error);
      alert('Error adding research paper');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePaper = async () => {
    if (!selectedPaper) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/research-papers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPaper.id,
          title: formData.title,
          authors: formData.authors,
          year: formData.year || null,
          link: formData.link || null,
          topic: formData.topic || null,
          status: formData.status,
          researchProblem: formData.researchProblem || null,
          dataset: formData.dataset || null,
          method: formData.method || null,
          model: formData.model || null,
          results: formData.results || null,
          limitations: formData.limitations || null,
          importantNotes: formData.importantNotes || null,
          myThoughts: formData.myThoughts || null,
          researchIdeas: formData.researchIdeas || null,
        }),
      });

      if (response.ok) {
        const updatedPaper = await response.json();
        setPapers(papers.map(p => p.id === updatedPaper.id ? updatedPaper : p));
        setIsEditingPaper(false);
        setSelectedPaper(null);
      }
    } catch (error) {
      console.error('❌ Error updating paper:', error);
      alert('Error updating research paper');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;

    try {
      const response = await fetch(`/api/research-papers?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPapers(papers.filter(p => p.id !== id));
        setSelectedPaper(null);
      }
    } catch (error) {
      console.error('❌ Error deleting paper:', error);
      alert('Error deleting research paper');
    }
  };

  const handleViewPaper = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setFormData({
      title: paper.title,
      authors: paper.authors,
      year: paper.year || '',
      link: paper.link || '',
      topic: paper.topic || '',
      status: paper.status,
      researchProblem: paper.researchProblem || '',
      dataset: paper.dataset || '',
      method: paper.method || '',
      model: paper.model || '',
      results: paper.results || '',
      limitations: paper.limitations || '',
      importantNotes: paper.importantNotes || '',
      myThoughts: paper.myThoughts || '',
      researchIdeas: paper.researchIdeas || '',
    });
    setIsViewingPaper(true);
  };

  const handleEditPaper = () => {
    setIsViewingPaper(false);
    setIsEditingPaper(true);
  };

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.authors.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || paper.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-slate-300">Loading research papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Research Papers</h1>
          </div>
          <p className="text-slate-400">All your research papers synced across browsers</p>
        </div>

        {/* Database Status Badge */}
        <div className="mb-6 flex items-center gap-2 bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-2 w-fit">
          <Database className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-300">✅ Database Connected</span>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isAddingPaper} onOpenChange={setIsAddingPaper}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Paper
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Add Research Paper</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Paper title"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Authors *</Label>
                    <Input
                      value={formData.authors}
                      onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Author names"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Year</Label>
                    <Input
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Topic</Label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="AI, ML, etc."
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Link</Label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Research Problem</Label>
                  <Textarea
                    value={formData.researchProblem}
                    onChange={(e) => setFormData({ ...formData, researchProblem: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="What problem does this paper address?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Dataset</Label>
                    <Input
                      value={formData.dataset}
                      onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Dataset used"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Method</Label>
                    <Input
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Methodology"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Model/Approach"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Results</Label>
                    <Input
                      value={formData.results}
                      onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Key results"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">My Thoughts & Ideas</Label>
                  <Textarea
                    value={formData.myThoughts}
                    onChange={(e) => setFormData({ ...formData, myThoughts: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Your thoughts on this paper..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAddPaper}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Paper
                  </Button>
                  <Button
                    onClick={() => setIsAddingPaper(false)}
                    variant="outline"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No research papers found</p>
            </div>
          ) : (
            filteredPapers.map(paper => {
              const statusOption = STATUS_OPTIONS.find(o => o.value === paper.status);
              return (
                <Card key={paper.id} className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => handleViewPaper(paper)}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg line-clamp-2">{paper.title}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">{paper.authors}</p>
                      </div>
                      {statusOption && (
                        <Badge className={statusOption.color}>
                          {statusOption.label}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {paper.year && <p className="text-slate-300"><span className="text-slate-500">Year:</span> {paper.year}</p>}
                      {paper.topic && <p className="text-slate-300"><span className="text-slate-500">Topic:</span> {paper.topic}</p>}
                      {paper.link && (
                        <a href={paper.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          View Paper
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* View/Edit Dialog */}
        <Dialog open={isViewingPaper || isEditingPaper} onOpenChange={(open) => {
          if (!open) {
            setIsViewingPaper(false);
            setIsEditingPaper(false);
            setSelectedPaper(null);
          }
        }}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-white">{isEditingPaper ? 'Edit Paper' : 'Paper Details'}</DialogTitle>
                {!isEditingPaper && (
                  <Button
                    onClick={handleEditPaper}
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogHeader>

            {isViewingPaper && !isEditingPaper && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{formData.title}</h3>
                  <p className="text-slate-400">{formData.authors}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.year && <div><p className="text-slate-500 text-sm">Year</p><p className="text-white">{formData.year}</p></div>}
                  {formData.topic && <div><p className="text-slate-500 text-sm">Topic</p><p className="text-white">{formData.topic}</p></div>}
                </div>

                {formData.link && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Link</p>
                    <a href={formData.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      Open Paper
                    </a>
                  </div>
                )}

                {formData.researchProblem && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Research Problem</p>
                    <p className="text-slate-300">{formData.researchProblem}</p>
                  </div>
                )}

                {formData.dataset && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Dataset</p>
                    <p className="text-slate-300">{formData.dataset}</p>
                  </div>
                )}

                {formData.method && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Method</p>
                    <p className="text-slate-300">{formData.method}</p>
                  </div>
                )}

                {formData.myThoughts && (
                  <div>
                    <p className="text-slate-500 text-sm mb-1">My Thoughts</p>
                    <p className="text-slate-300">{formData.myThoughts}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleDeletePaper(selectedPaper!.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {isEditingPaper && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Authors</Label>
                    <Input
                      value={formData.authors}
                      onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Year</Label>
                    <Input
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Topic</Label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Link</Label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Research Problem</Label>
                  <Textarea
                    value={formData.researchProblem}
                    onChange={(e) => setFormData({ ...formData, researchProblem: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Dataset</Label>
                    <Input
                      value={formData.dataset}
                      onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Method</Label>
                    <Input
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">My Thoughts</Label>
                  <Textarea
                    value={formData.myThoughts}
                    onChange={(e) => setFormData({ ...formData, myThoughts: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdatePaper}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Update Paper
                  </Button>
                  <Button
                    onClick={() => setIsEditingPaper(false)}
                    variant="outline"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
