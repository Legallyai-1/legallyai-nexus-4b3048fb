import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Download, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface DocumentGeneratorProps {
  title: string;
  description: string;
  documentType: string;
  fields: DocumentField[];
  systemPrompt: string;
  colorVariant?: "pink" | "blue" | "purple" | "green" | "orange" | "cyan";
  icon?: React.ReactNode;
}

export function DocumentGenerator({
  title,
  description,
  documentType,
  fields,
  systemPrompt,
  colorVariant = "blue",
  icon
}: DocumentGeneratorProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const colorClasses = {
    pink: "border-neon-pink/30 from-neon-pink/20",
    blue: "border-neon-blue/30 from-neon-blue/20",
    purple: "border-purple-500/30 from-purple-500/20",
    green: "border-neon-green/30 from-neon-green/20",
    orange: "border-orange-500/30 from-orange-500/20",
    cyan: "border-neon-cyan/30 from-neon-cyan/20",
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleGenerate = async () => {
    // Validate required fields
    const missingFields = fields
      .filter(f => f.required && !formData[f.id])
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    setIsGenerating(true);
    setGeneratedDocument("");

    try {
      // Build the prompt with form data
      const formDataStr = fields
        .map(f => `${f.label}: ${formData[f.id] || "Not provided"}`)
        .join("\n");

      const fullPrompt = `Generate a professional ${documentType} document with the following information:

${formDataStr}

${additionalNotes ? `Additional Notes/Instructions:\n${additionalNotes}` : ""}

Please create a complete, professional legal document that is ready for review. Include all standard clauses and provisions appropriate for this document type. Format it properly with sections, headings, and legal language.`;

      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: {
          prompt: fullPrompt,
          documentType,
          systemPrompt
        }
      });

      if (error) throw error;

      setGeneratedDocument(data.document || data.response || "Document generated successfully.");
      toast.success("Document generated successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error("Failed to generate document. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDocument);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDocument], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentType.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded!");
  };

  const renderField = (field: DocumentField) => {
    switch (field.type) {
      case "select":
        return (
          <Select 
            value={formData[field.id] || ""} 
            onValueChange={(v) => handleFieldChange(field.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={3}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className={`glass-card ${colorClasses[colorVariant]}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon || <FileText className="h-5 w-5" />}
            {title}
            {fields.some(f => f.required) && (
              <Badge variant="outline" className="ml-2 text-xs">* Required</Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <Label className="flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Additional Notes / AI Instructions
            </Label>
            <Textarea
              placeholder="Add any specific requirements, clauses you want included, special circumstances, or instructions for the AI to consider when generating your document..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              className="bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">
              Tell the AI what you want. Be specific about any special terms, conditions, or provisions you need.
            </p>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
            variant="neon"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {documentType}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Document */}
      {generatedDocument && (
        <Card className={`glass-card ${colorClasses[colorVariant]}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated {documentType}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatedDocument}</pre>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ⚠️ This is an AI-generated template. Please review carefully and consult with a licensed attorney before use.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
