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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Image as ImageIcon,
  FileImage,
  Save,
  Download,
  Upload,
  Paperclip,
  X,
  BookOpen,
  Lightbulb,
  Database,
  FlaskConical,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface PaperMaterial {
  id: string;
  type: 'pdf' | 'slide' | 'image' | 'link';
  title: string;
  url: string;
  notes?: string;
  addedAt: string;
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: string;
  link: string;
  topic: string;
  status: 'TO_READ' | 'READING' | 'READ' | 'IMPORTANT' | 'USED_IN_RESEARCH';
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
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: 'TO_READ', label: 'To Read', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800' },
  { value: 'READING', label: 'Reading', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900' },
  { value: 'READ', label: 'Read', color: 'bg-green-100 text-green-700 dark:bg-green-900' },
  { value: 'IMPORTANT', label: 'Important', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900' },
  { value: 'USED_IN_RESEARCH', label: 'Used in Research', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900' },
];

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [isAddingPaper, setIsAddingPaper] = useState(false);
  const [isViewingPaper, setIsViewingPaper] = useState(false);
  const [isEditingPaper, setIsEditingPaper] = useState(false);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    link: '',
    topic: '',
    status: 'TO_READ' as const,
  });

  const [materialForm, setMaterialForm] = useState({
    type: 'pdf' as const,
    title: '',
    url: '',
    notes: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = () => {
    const saved = localStorage.getItem('researchPapers');
    if (saved) {
      setPapers(JSON.parse(saved));
    }
  };

  const savePapers = (updatedPapers: ResearchPaper[]) => {
    localStorage.setItem('researchPapers', JSON.stringify(updatedPapers));
    setPapers(updatedPapers);
  };

  const handleAddPaper = () => {
    if (!formData.title) {
      alert('Please enter a paper title');
      return;
    }

    const newPaper: ResearchPaper = {
      id: Date.now().toString(),
      ...formData,
      researchProblem: '',
      dataset: '',
      method: '',
      model: '',
      results: '',
      limitations: '',
      importantNotes: '',
      myThoughts: '',
      researchIdeas: '',
      materials: [],
      createdAt: new Date().toISOString(),
    };

    // Add uploaded files as materials
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const fileType = file.type.includes('pdf') ? 'pdf' 
          : file.type.includes('presentation') || file.type.includes('ppt') ? 'slide'
          : file.type.includes('image') ? 'image'
          : 'link';
        
        // Create a local URL for the file
        const fileUrl = URL.createObjectURL(file);
        
        const material: PaperMaterial = {
          id: Date.now().toString() + Math.random(),
          type: fileType,
          title: file.name,
          url: fileUrl,
          notes: `Uploaded file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
          addedAt: new Date().toISOString(),
        };
        
        newPaper.materials.push(material);
      });
    }

    savePapers([...papers, newPaper]);
    setFormData({ title: '', authors: '', year: '', link: '', topic: '', status: 'TO_READ' });
    setUploadedFiles([]);
    setIsAddingPaper(false);
  };

  const handleUpdatePaper = (field: string, value: string) => {
    if (!selectedPaper) return;
    const updated = papers.map(p => 
      p.id === selectedPaper.id ? { ...p, [field]: value } : p
    );
    savePapers(updated);
    setSelectedPaper({ ...selectedPaper, [field]: value });
  };

  const handleDeletePaper = (id: string) => {
    if (confirm('Delete this paper permanently?')) {
      savePapers(papers.filter(p => p.id !== id));
      setIsViewingPaper(false);
    }
  };

  const handleAddMaterial = () => {
    if (!selectedPaper || !materialForm.title || !materialForm.url) {
      alert('Please fill in title and URL');
      return;
    }

    const newMaterial: PaperMaterial = {
      id: Date.now().toString(),
      ...materialForm,
      addedAt: new Date().toISOString(),
    };

    const updated = papers.map(p =>
      p.id === selectedPaper.id
        ? { ...p, materials: [...p.materials, newMaterial] }
        : p
    );
    savePapers(updated);
    setSelectedPaper({ ...selectedPaper, materials: [...selectedPaper.materials, newMaterial] });
    setMaterialForm({ type: 'pdf', title: '', url: '', notes: '' });
    setIsAddingMaterial(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setUploadedFiles([...uploadedFiles, ...fileArray]);
  };

  const handleRemoveUploadedFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleMaterialFileUpload = (file: File) => {
    if (!selectedPaper) return;

    const fileType = file.type.includes('pdf') ? 'pdf' 
      : file.type.includes('presentation') || file.type.includes('ppt') ? 'slide'
      : file.type.includes('sheet') || file.type.includes('excel') ? 'link'
      : file.type.includes('image') ? 'image'
      : 'link';
    
    const fileUrl = URL.createObjectURL(file);
    
    const newMaterial: PaperMaterial = {
      id: Date.now().toString(),
      type: fileType,
      title: file.name,
      url: fileUrl,
      notes: `Uploaded file: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      addedAt: new Date().toISOString(),
    };

    const updated = papers.map(p =>
      p.id === selectedPaper.id
        ? { ...p, materials: [...p.materials, newMaterial] }
        : p
    );
    savePapers(updated);
    setSelectedPaper({ ...selectedPaper, materials: [...selectedPaper.materials, newMaterial] });
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (!selectedPaper) return;
    if (confirm('Delete this material?')) {
      const updated = papers.map(p =>
        p.id === selectedPaper.id
          ? { ...p, materials: p.materials.filter(m => m.id !== materialId) }
          : p
      );
      savePapers(updated);
      setSelectedPaper({
        ...selectedPaper,
        materials: selectedPaper.materials.filter(m => m.id !== materialId),
      });
    }
  };

  const filteredPapers = papers.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: papers.length,
    toRead: papers.filter(p => p.status === 'TO_READ').length,
    reading: papers.filter(p => p.status === 'READING').length,
    read: papers.filter(p => p.status === 'READ').length,
    important: papers.filter(p => p.status === 'IMPORTANT').length,
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'slide': return <FileImage className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'link': return <Link2 className="h-4 w-4" />;
      default: return <Paperclip className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-xl shadow-lg">
                <FlaskConical className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Research Papers</h1>
                <p className="text-lg text-muted-foreground">
                  Organize, annotate, and track your research literature
                </p>
              </div>
            </div>
            <Dialog open={isAddingPaper} onOpenChange={setIsAddingPaper}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Add Paper
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Research Paper</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 pr-2">
                  <div>
                    <Label>Paper Title *</Label>
                    <Input
                      placeholder="Enter paper title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Authors</Label>
                      <Input
                        placeholder="John Doe, Jane Smith"
                        value={formData.authors}
                        onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        placeholder="2024"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Topic</Label>
                    <Input
                      placeholder="Machine Learning, Antenna Design"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Paper Link/URL</Label>
                    <Input
                      placeholder="https://arxiv.org/..."
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    />
                  </div>
                  
                  {/* File Upload Section */}
                  <div className="space-y-3">
                    <Label>Upload Files (PDF, PPT, Excel, Images)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload files</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, PPT, XLSX, Images supported
                        </p>
                      </label>
                    </div>
                    
                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Uploaded Files ({uploadedFiles.length})
                        </Label>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-primary/10 rounded">
                                {file.type.includes('pdf') ? (
                                  <FileText className="h-4 w-4 text-red-600" />
                                ) : file.type.includes('presentation') || file.type.includes('ppt') ? (
                                  <FileImage className="h-4 w-4 text-orange-600" />
                                ) : file.type.includes('image') ? (
                                  <ImageIcon className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Paperclip className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveUploadedFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddPaper} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Add Paper
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingPaper(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Papers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{stats.toRead}</div>
                <div className="text-sm text-muted-foreground">To Read</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.reading}</div>
                <div className="text-sm text-muted-foreground">Reading</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.read}</div>
                <div className="text-sm text-muted-foreground">Read</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.important}</div>
                <div className="text-sm text-muted-foreground">Important</div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers by title, author, or topic..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Papers Grid */}
        {filteredPapers.length === 0 ? (
          <Card className="p-12 text-center">
            <FlaskConical className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No papers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Start by adding your first research paper'}
            </p>
            <Button onClick={() => setIsAddingPaper(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Paper
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPapers.map((paper) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === paper.status);
              return (
                <Card key={paper.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
                      <Badge className={statusOpt?.color}>{statusOpt?.label}</Badge>
                    </div>
                    {paper.authors && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{paper.authors}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paper.year && (
                        <div className="text-sm">
                          <span className="font-medium">Year:</span> {paper.year}
                        </div>
                      )}
                      {paper.topic && (
                        <Badge variant="outline">{paper.topic}</Badge>
                      )}
                      {paper.materials.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Paperclip className="h-4 w-4" />
                          {paper.materials.length} material(s)
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPaper(paper);
                            setIsViewingPaper(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePaper(paper.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Paper Details Dialog */}
        <Dialog open={isViewingPaper} onOpenChange={setIsViewingPaper}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {selectedPaper && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <DialogTitle className="text-2xl pr-8">{selectedPaper.title}</DialogTitle>
                    <Select
                      value={selectedPaper.status}
                      onValueChange={(value) => handleUpdatePaper('status', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedPaper.authors && (
                    <p className="text-muted-foreground">
                      {selectedPaper.authors}
                      {selectedPaper.year && ` (${selectedPaper.year})`}
                    </p>
                  )}
                  {selectedPaper.link && (
                    <a
                      href={selectedPaper.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Paper Link
                    </a>
                  )}
                </DialogHeader>

                <Tabs defaultValue="materials" className="py-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="materials">Materials & Files</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="notes">Notes & Ideas</TabsTrigger>
                  </TabsList>

                  {/* Materials Tab */}
                  <TabsContent value="materials" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Materials ({selectedPaper.materials.length})
                      </h3>
                      <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Material
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Material</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {/* File Upload Option */}
                            <div className="space-y-3">
                              <Label>Upload File</Label>
                              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                                <input
                                  type="file"
                                  id="material-file-upload"
                                  accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleMaterialFileUpload(file);
                                      setIsAddingMaterial(false);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <label htmlFor="material-file-upload" className="cursor-pointer">
                                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm font-medium">Click to upload file</p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, PPT, Excel, Images
                                  </p>
                                </label>
                              </div>
                            </div>

                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                  Or enter URL manually
                                </span>
                              </div>
                            </div>

                            <div>
                              <Label>Type</Label>
                              <Select
                                value={materialForm.type}
                                onValueChange={(value: any) =>
                                  setMaterialForm({ ...materialForm, type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pdf">PDF Document</SelectItem>
                                  <SelectItem value="slide">Slides/Presentation</SelectItem>
                                  <SelectItem value="image">Image/Figure</SelectItem>
                                  <SelectItem value="link">External Link</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Title *</Label>
                              <Input
                                placeholder="Material title"
                                value={materialForm.title}
                                onChange={(e) =>
                                  setMaterialForm({ ...materialForm, title: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>URL/File Path *</Label>
                              <Input
                                placeholder="https://... or /path/to/file"
                                value={materialForm.url}
                                onChange={(e) =>
                                  setMaterialForm({ ...materialForm, url: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Textarea
                                placeholder="Optional notes about this material"
                                value={materialForm.notes}
                                onChange={(e) =>
                                  setMaterialForm({ ...materialForm, notes: e.target.value })
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleAddMaterial} className="flex-1">
                                <Save className="mr-2 h-4 w-4" />
                                Add Material
                              </Button>
                              <Button variant="outline" onClick={() => setIsAddingMaterial(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {selectedPaper.materials.length === 0 ? (
                      <Card className="p-8 text-center">
                        <Paperclip className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No materials added yet</p>
                        <Button size="sm" onClick={() => setIsAddingMaterial(true)}>
                          Add First Material
                        </Button>
                      </Card>
                    ) : (
                      <div className="grid gap-3">
                        {selectedPaper.materials.map((material) => (
                          <Card key={material.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  {getMaterialIcon(material.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <h4 className="font-medium">{material.title}</h4>
                                      <p className="text-sm text-muted-foreground truncate">
                                        {material.url}
                                      </p>
                                      {material.notes && (
                                        <p className="text-sm mt-2 text-muted-foreground">
                                          {material.notes}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => window.open(material.url, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteMaterial(material.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="mt-2 capitalize">
                                    {material.type}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Analysis Tab */}
                  <TabsContent value="analysis" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          Research Problem
                        </Label>
                        <Textarea
                          placeholder="What problem does this paper address?"
                          value={selectedPaper.researchProblem}
                          onChange={(e) => handleUpdatePaper('researchProblem', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Database className="h-4 w-4" />
                          Dataset
                        </Label>
                        <Textarea
                          placeholder="What dataset(s) were used?"
                          value={selectedPaper.dataset}
                          onChange={(e) => handleUpdatePaper('dataset', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Method</Label>
                          <Textarea
                            placeholder="Methodology used"
                            value={selectedPaper.method}
                            onChange={(e) => handleUpdatePaper('method', e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block">Model</Label>
                          <Textarea
                            placeholder="Model architecture"
                            value={selectedPaper.model}
                            onChange={(e) => handleUpdatePaper('model', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          Results
                        </Label>
                        <Textarea
                          placeholder="Key results and findings"
                          value={selectedPaper.results}
                          onChange={(e) => handleUpdatePaper('results', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Limitations</Label>
                        <Textarea
                          placeholder="Limitations mentioned in the paper"
                          value={selectedPaper.limitations}
                          onChange={(e) => handleUpdatePaper('limitations', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Notes & Ideas Tab */}
                  <TabsContent value="notes" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4" />
                          Important Notes
                        </Label>
                        <Textarea
                          placeholder="Key points to remember from this paper"
                          value={selectedPaper.importantNotes}
                          onChange={(e) => handleUpdatePaper('importantNotes', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4" />
                          My Thoughts
                        </Label>
                        <Textarea
                          placeholder="Your personal thoughts and analysis"
                          value={selectedPaper.myThoughts}
                          onChange={(e) => handleUpdatePaper('myThoughts', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <FlaskConical className="h-4 w-4" />
                          Research Ideas
                        </Label>
                        <Textarea
                          placeholder="Ideas for future research inspired by this paper"
                          value={selectedPaper.researchIdeas}
                          onChange={(e) => handleUpdatePaper('researchIdeas', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
