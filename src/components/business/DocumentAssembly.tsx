import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { arePaymentsEnabled } from "@/lib/env";
import { requestHubDocument, useDocumentCheckout } from "@/hooks/useHubDocumentGeneration";
import { canExportHubDocument, type GeneratedDocumentResult } from "@/lib/document-export-entitlement";
import { HubDocumentStatus } from "@/components/hub/HubDocumentStatus";
import { Copy, Download, FileText, Loader2, Plus, Search, Wand2 } from "lucide-react";

interface AssemblyTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Firm-authored template text, sent as the drafting base. */
  content?: string | null;
  source: "standard" | "firm";
}

interface AssembledDoc {
  id: string;
  name: string;
  createdAt: Date;
  result: GeneratedDocumentResult;
}

// Standard document types the generator can draft. No usage stats are shown: none are tracked.
const STANDARD_TEMPLATES: AssemblyTemplate[] = [
  { id: "nda", name: "Non-Disclosure Agreement (NDA)", category: "Corporate", description: "Mutual or one-way confidentiality agreement.", source: "standard" },
  { id: "engagement", name: "Engagement / Retainer Agreement", category: "General", description: "Scope of representation, fees, retainer and billing terms.", source: "standard" },
  { id: "employment", name: "Employment Agreement", category: "Employment", description: "Role, compensation, confidentiality and termination terms.", source: "standard" },
  { id: "llc", name: "LLC Operating Agreement", category: "Corporate", description: "Members, capital, management and distributions.", source: "standard" },
  { id: "lease", name: "Residential Lease Agreement", category: "Real Estate", description: "Rent, deposit, term, maintenance and default terms.", source: "standard" },
  { id: "purchase", name: "Property Purchase Agreement", category: "Real Estate", description: "Price, contingencies, closing and disclosures.", source: "standard" },
  { id: "poa", name: "Power of Attorney", category: "Estate", description: "General or limited authority to act on someone's behalf.", source: "standard" },
  { id: "demand", name: "Demand Letter", category: "Litigation", description: "Formal demand for payment or performance before suit.", source: "standard" },
  { id: "settlement", name: "Settlement Agreement & Release", category: "Litigation", description: "Payment terms, release of claims and confidentiality.", source: "standard" },
];

const LAWFIRM_CONTEXT = "You are a legal document specialist for law firm operations, contracts, and client agreements.";
const MAX_TEMPLATE_CHARS = 8000;

export function DocumentAssembly({ organizationId, canManageTemplates = false }: { organizationId?: string | null; canManageTemplates?: boolean }) {
  const navigate = useNavigate();
  const startCheckout = useDocumentCheckout();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("templates");
  const [firmTemplates, setFirmTemplates] = useState<AssemblyTemplate[]>([]);
  const [selected, setSelected] = useState<AssemblyTemplate | null>(null);
  const [details, setDetails] = useState("");
  const [generating, setGenerating] = useState(false);
  const [docs, setDocs] = useState<AssembledDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<AssembledDoc | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ name: "", category: "", description: "", content: "" });
  const [saving, setSaving] = useState(false);

  const loadFirmTemplates = useCallback(async () => {
    if (!organizationId) { setFirmTemplates([]); return; }
    const { data, error } = await supabase
      .from("document_templates")
      .select("id, name, category, description, content")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) { console.error("Template load error:", error); return; }
    setFirmTemplates((data ?? []).map((t) => ({
      id: t.id, name: t.name, category: t.category || "Firm", description: t.description || "", content: t.content, source: "firm" as const,
    })));
  }, [organizationId]);

  useEffect(() => { void loadFirmTemplates(); }, [loadFirmTemplates]);

  const all = [...firmTemplates, ...STANDARD_TEMPLATES];
  const q = searchTerm.trim().toLowerCase();
  const filtered = q ? all.filter((t) => `${t.name} ${t.category} ${t.description}`.toLowerCase().includes(q)) : all;

  const assemble = async () => {
    if (!selected) return;
    if (!details.trim()) { toast.error("Add the parties, terms and facts to fill in"); return; }
    setGenerating(true);
    try {
      const base = selected.content ? `\n\nUse this firm template as the base text and keep its structure:\n"""\n${selected.content.slice(0, MAX_TEMPLATE_CHARS)}\n"""` : "";
      const outcome = await requestHubDocument({
        prompt: `Draft a ${selected.name} (${selected.category}). Details to include:\n${details.trim()}${base}`,
        type: "lawfirm",
        systemContext: LAWFIRM_CONTEXT,
      });
      if (!outcome.result) {
        toast.error(outcome.error || "Failed to generate document");
        if (outcome.needsSignIn) navigate("/auth");
        return;
      }
      const doc: AssembledDoc = {
        id: crypto.randomUUID(),
        name: `${selected.name}${outcome.result.mode === "template" ? " (free worksheet)" : ""}`,
        createdAt: new Date(),
        result: outcome.result,
      };
      setDocs((prev) => [doc, ...prev]);
      setActiveDoc(doc);
      setSelected(null);
      setDetails("");
      setActiveTab("generated");
      toast.success(outcome.result.mode === "template" ? "Free worksheet ready" : "Document drafted");
    } finally {
      setGenerating(false);
    }
  };

  const exportable = (doc: AssembledDoc) => canExportHubDocument(doc.result, arePaymentsEnabled());
  const copyDoc = async (doc: AssembledDoc) => {
    if (!exportable(doc)) return;
    await navigator.clipboard.writeText(doc.result.document);
    toast.success("Copied");
  };
  const downloadDoc = (doc: AssembledDoc) => {
    if (!exportable(doc)) return;
    const blob = new Blob([doc.result.document], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name.replace(/[^\w\- ]+/g, "").trim() || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveTemplate = async () => {
    if (!organizationId) return;
    if (!draft.name.trim() || !draft.content.trim()) { toast.error("Name and template text are required"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("document_templates").insert({
        organization_id: organizationId,
        created_by: user?.id ?? null,
        name: draft.name.trim(),
        category: draft.category.trim() || "Firm",
        description: draft.description.trim() || null,
        content: draft.content,
        is_public: false,
      });
      if (error) throw error;
      toast.success("Template saved");
      setDraft({ name: "", category: "", description: "", content: "" });
      setShowCreate(false);
      await loadFirmTemplates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Document Assembly</CardTitle>
            <CardDescription>Pick a template, add the deal or case details, and draft it with AI. Have a licensed attorney review every draft.</CardDescription>
          </div>
          {canManageTemplates && organizationId && (
            <Button variant="outline" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> New firm template</Button>
          )}
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates ({all.length})</TabsTrigger>
          <TabsTrigger value="generated">Drafted this session ({docs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No templates match "{searchTerm}".</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <Card key={`${t.source}-${t.id}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold">{t.name}</h4>
                    <Badge variant="outline">{t.source === "firm" ? "Firm template" : t.category}</Badge>
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                  <Button className="w-full" onClick={() => { setSelected(t); setDetails(""); }}>
                    <Wand2 className="h-4 w-4 mr-2" /> Assemble
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="mt-4 space-y-4">
          {docs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              Nothing drafted yet. Choose a template and select Assemble.
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Drafts stay in this browser tab only. Download the ones you want to keep.</p>
                {docs.map((d) => (
                  <button key={d.id} type="button" onClick={() => setActiveDoc(d)}
                    className={`w-full rounded-lg border p-3 text-left ${activeDoc?.id === d.id ? "border-primary" : ""}`}>
                    <p className="font-medium text-sm">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.createdAt.toLocaleTimeString()}</p>
                  </button>
                ))}
              </div>
              {activeDoc && (
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle className="text-base">{activeDoc.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={!exportable(activeDoc)} onClick={() => void copyDoc(activeDoc)}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
                      <Button size="sm" variant="outline" disabled={!exportable(activeDoc)} onClick={() => downloadDoc(activeDoc)}><Download className="h-4 w-4 mr-1" /> Download</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <HubDocumentStatus result={activeDoc.result} onBuy={() => void startCheckout()} />
                    <pre className={`max-h-[480px] overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm ${exportable(activeDoc) ? "" : "select-none"}`}>
                      {activeDoc.result.document}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open && !generating) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>Describe the parties, key terms, dates, amounts and jurisdiction.</DialogDescription>
          </DialogHeader>
          <Textarea rows={8} value={details} onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Mutual NDA between Acme LLC (California) and Beta Inc. (Texas), 2-year term, covers product roadmap and pricing..." />
          <Button onClick={() => void assemble()} disabled={generating || !details.trim()}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            {generating ? "Drafting..." : "Draft document"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New firm template</DialogTitle>
            <DialogDescription>Saved to your firm. Everyone in the firm can draft from it.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Template name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Input placeholder="Category (e.g. Corporate)" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          <Input placeholder="Short description (optional)" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          <Textarea rows={8} placeholder="Template text. Use [BRACKETS] for the parts to fill in." value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          <Button onClick={() => void saveTemplate()} disabled={saving}>{saving ? "Saving..." : "Save template"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
