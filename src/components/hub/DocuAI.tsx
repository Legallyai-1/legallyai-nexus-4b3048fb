import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { 
  FileText, Upload, Download, PenTool, Share2, Sparkles, 
  FolderOpen, Send, Loader2, CheckCircle2, Eye, Trash2,
  File, Image, Video, FileSpreadsheet, Copy, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  signed?: boolean;
  folder?: string;
  content?: string;
  shared?: boolean;
}

interface DocuAIProps {
  colorVariant?: "purple" | "cyan" | "pink" | "green" | "orange" | "blue";
  hubContext?: string;
  onDocumentGenerated?: (doc: Document) => void;
}

export function DocuAI({ 
  colorVariant = "purple", 
  hubContext = "general",
  onDocumentGenerated 
}: DocuAIProps) {
  const [activeTab, setActiveTab] = useState("create");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [signature, setSignature] = useState("");
  const [initials, setInitials] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colorClass = `neon-${colorVariant}`;

  const contextPrompts: Record<string, string> = {
    custody: "You are a legal document specialist focused on child custody agreements, parenting plans, and family law documents.",
    defense: "You are a legal document specialist for criminal defense, traffic citations, and court filings.",
    workplace: "You are a legal document specialist for employment law, workplace complaints, and HR documents.",
    probation: "You are a legal document specialist for probation/parole documentation and compliance tracking.",
    probono: "You are a legal document specialist for pro bono legal services and charitable legal work.",
    lawfirm: "You are a legal document specialist for law firm operations, contracts, and client agreements.",
    general: "You are a legal document specialist who can create various types of legal documents."
  };

  const handleGenerateDocument = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe the document you need");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: {
          prompt: prompt,
          type: hubContext,
          systemContext: contextPrompts[hubContext] || contextPrompts.general
        }
      });

      if (error) throw error;

      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: `${hubContext.charAt(0).toUpperCase() + hubContext.slice(1)} Document - ${new Date().toLocaleDateString()}`,
        type: 'application/pdf',
        size: data.document?.length || 5000,
        uploadedAt: new Date(),
        signed: false,
        content: data.document
      };

      setDocuments(prev => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
      onDocumentGenerated?.(newDoc);
      toast.success("Document generated successfully!");
      setPrompt("");
      setActiveTab("manage");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate document");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs: Document[] = files.map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      signed: false
    }));
    
    setDocuments(prev => [...newDocs, ...prev]);
    toast.success(`${files.length} document(s) uploaded`);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSign = (doc: Document) => {
    if (!signature || !initials) {
      toast.error("Please set up your signature and initials first");
      setActiveTab("sign");
      return;
    }
    
    setDocuments(prev => 
      prev.map(d => d.id === doc.id ? { ...d, signed: true } : d)
    );
    toast.success(`${doc.name} has been signed`);
  };

  const handleShare = (doc: Document) => {
    if (!shareEmail.trim()) {
      toast.error("Please enter an email to share with");
      return;
    }
    
    setDocuments(prev => 
      prev.map(d => d.id === doc.id ? { ...d, shared: true } : d)
    );
    toast.success(`Document shared with ${shareEmail}`);
    setShareEmail("");
  };

  const handleDownload = (doc: Document) => {
    // Create a blob and trigger download
    const content = doc.content || `Legal Document: ${doc.name}\n\nGenerated by LegallyAI on ${doc.uploadedAt.toLocaleDateString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const handleDelete = (doc: Document) => {
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    if (selectedDoc?.id === doc.id) setSelectedDoc(null);
    toast.success("Document deleted");
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <Image className="w-5 h-5" />;
    if (type.includes("video")) return <Video className="w-5 h-5" />;
    if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className={`glass-card border-${colorClass}/30 p-4`}>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
        <AnimatedAIHead variant={colorVariant as any} size="sm" />
        <div>
          <h3 className={`font-display font-semibold text-${colorClass}`}>DocuAI</h3>
          <p className="text-xs text-muted-foreground">Create, Sign & Share Legal Documents</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="create" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" /> Create
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-1 text-xs">
            <FolderOpen className="w-3 h-3" /> Manage
          </TabsTrigger>
          <TabsTrigger value="sign" className="gap-1 text-xs">
            <PenTool className="w-3 h-3" /> Sign
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-1 text-xs">
            <Share2 className="w-3 h-3" /> Share
          </TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-4">
          <div className="space-y-3">
            <Label>Describe the document you need</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe your ${hubContext} document needs. For example: "Create a custody agreement for joint legal custody with a 50/50 parenting time schedule..."`}
              className={`min-h-[120px] bg-background/30 border-${colorClass}/30`}
            />
            
            <Button
              variant="neon-purple"
              className="w-full gap-2"
              onClick={handleGenerateDocument}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Document
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or upload existing</span>
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" /> Upload Documents
            </Button>
          </div>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No documents yet</p>
              <p className="text-sm">Create or upload documents to get started</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group ${
                    selectedDoc?.id === doc.id ? `border border-${colorClass}/50` : ''
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className={`p-2 rounded-lg bg-${colorClass}/20 text-${colorClass}`}>
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {doc.signed && (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                        Signed
                      </Badge>
                    )}
                    {doc.shared && (
                      <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs">
                        Shared
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}>
                      <Download className="w-3 h-3" />
                    </Button>
                    {!doc.signed && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-neon-purple" onClick={(e) => { e.stopPropagation(); handleSign(doc); }}>
                        <PenTool className="w-3 h-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedDoc?.content && (
            <div className="p-3 rounded-lg border border-border/50 bg-background/20">
              <p className="text-xs text-muted-foreground mb-2">Document Preview:</p>
              <div className="max-h-[150px] overflow-y-auto text-sm text-foreground whitespace-pre-wrap">
                {selectedDoc.content.substring(0, 500)}...
              </div>
            </div>
          )}
        </TabsContent>

        {/* Sign Tab */}
        <TabsContent value="sign" className="space-y-4">
          <div>
            <Label>Full Legal Name (Signature)</Label>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full legal name"
              className="bg-background/30"
            />
            {signature && (
              <div className="mt-2 p-3 rounded-lg border border-dashed border-border bg-background/20">
                <p className="text-xs text-muted-foreground mb-1">Signature Preview:</p>
                <p className="text-xl italic font-serif text-foreground">{signature}</p>
              </div>
            )}
          </div>
          
          <div>
            <Label>Initials</Label>
            <Input
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              placeholder="e.g., JS"
              maxLength={4}
              className="bg-background/30"
            />
            {initials && (
              <div className="mt-2 p-3 rounded-lg border border-dashed border-border bg-background/20">
                <p className="text-xs text-muted-foreground mb-1">Initials Preview:</p>
                <p className="text-xl italic font-serif text-foreground">{initials}</p>
              </div>
            )}
          </div>

          {signature && initials && (
            <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
              <p className="text-xs text-neon-green flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Signature ready - you can now sign documents
              </p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-neon-orange/10 border border-neon-orange/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-neon-orange">Legal Notice:</strong> By typing your name and initials, 
              you agree this constitutes a legally binding electronic signature under the E-SIGN Act.
            </p>
          </div>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-4">
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-background/30 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Selected Document:</p>
                <p className="font-medium text-foreground">{selectedDoc.name}</p>
              </div>

              <div>
                <Label>Share with Email</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="recipient@email.com"
                    className="bg-background/30 flex-1"
                  />
                  <Button 
                    variant="neon-purple" 
                    onClick={() => handleShare(selectedDoc)}
                    disabled={!shareEmail.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleDownload(selectedDoc)}>
                  <Download className="w-4 h-4" /> Download
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => {
                  navigator.clipboard.writeText(`https://legallyai.ai/documents/${selectedDoc.id}`);
                  toast.success("Link copied to clipboard");
                }}>
                  <Copy className="w-4 h-4" /> Copy Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Share2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Select a document to share</p>
              <p className="text-sm">Go to Manage tab and select a document first</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}