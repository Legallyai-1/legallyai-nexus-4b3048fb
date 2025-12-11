import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Download, 
  FileText, 
  PenTool, 
  Trash2, 
  Eye, 
  Check,
  FolderOpen,
  File,
  Image,
  Video,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  signed?: boolean;
  folder?: string;
}

interface DocumentManagerProps {
  caseId?: string;
  colorVariant?: "purple" | "cyan" | "pink" | "green" | "orange";
  onDocumentSelect?: (doc: Document) => void;
}

export function DocumentManager({ caseId, colorVariant = "purple", onDocumentSelect }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signature, setSignature] = useState("");
  const [initials, setInitials] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [folders, setFolders] = useState<string[]>(["All Documents", "Court Forms", "Evidence", "Contracts"]);
  const [activeFolder, setActiveFolder] = useState("All Documents");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs: Document[] = files.map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      signed: false,
      folder: activeFolder === "All Documents" ? undefined : activeFolder
    }));
    
    setDocuments(prev => [...prev, ...newDocs]);
    toast.success(`${files.length} document(s) uploaded`);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSign = (doc: Document) => {
    if (!signature || !initials) {
      toast.error("Please set up your signature first");
      return;
    }
    
    setDocuments(prev => 
      prev.map(d => d.id === doc.id ? { ...d, signed: true } : d)
    );
    toast.success(`${doc.name} has been signed`);
  };

  const handleDelete = (doc: Document) => {
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
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

  const filteredDocs = activeFolder === "All Documents" 
    ? documents 
    : documents.filter(d => d.folder === activeFolder);

  const colorClass = `neon-${colorVariant}`;

  return (
    <Card className={`glass-card border-${colorClass}/30 p-4`}>
      <Tabs defaultValue="documents">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="sign">E-Sign</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Upload Section */}
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov,.xls,.xlsx"
            />
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>

          {/* Folder Filter */}
          <div className="flex gap-2 flex-wrap">
            {folders.map(folder => (
              <Badge
                key={folder}
                variant={activeFolder === folder ? "default" : "outline"}
                className={`cursor-pointer ${activeFolder === folder ? `bg-${colorClass}/20 text-${colorClass}` : ""}`}
                onClick={() => setActiveFolder(folder)}
              >
                <FolderOpen className="w-3 h-3 mr-1" />
                {folder}
              </Badge>
            ))}
          </div>

          {/* Document List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No documents in this folder</p>
                <p className="text-sm">Upload files to get started</p>
              </div>
            ) : (
              filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group"
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
                  {doc.signed && (
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                      <Check className="w-3 h-3 mr-1" /> Signed
                    </Badge>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    {!doc.signed && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-neon-purple"
                        onClick={() => handleSign(doc)}
                      >
                        <PenTool className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(doc)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sign" className="space-y-4">
          <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
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
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <p className="text-xl italic font-serif text-foreground">{initials}</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-neon-orange/10 border border-neon-orange/20">
              <p className="text-xs text-muted-foreground">
                <strong className="text-neon-orange">Legal Notice:</strong> By typing your name and initials, 
                you agree this constitutes a legally binding electronic signature under the E-SIGN Act.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <div className="space-y-2">
            {folders.map((folder, idx) => (
              <div 
                key={folder}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
              >
                <FolderOpen className={`w-5 h-5 text-${colorClass}`} />
                <span className="flex-1 font-medium">{folder}</span>
                <Badge variant="outline">
                  {folder === "All Documents" 
                    ? documents.length 
                    : documents.filter(d => d.folder === folder).length
                  }
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="New folder name"
              className="bg-background/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  setFolders(prev => [...prev, e.currentTarget.value]);
                  e.currentTarget.value = "";
                  toast.success("Folder created");
                }
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
