import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, PenTool, Check, Send, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DocumentSigningPage = () => {
  const { toast } = useToast();
  const [signature, setSignature] = useState("");
  const [initials, setInitials] = useState("");
  const [signedDocuments, setSignedDocuments] = useState<string[]>([]);

  const handleSign = (docName: string) => {
    if (!signature || !initials) {
      toast({
        title: "Missing Information",
        description: "Please enter your signature and initials",
        variant: "destructive",
      });
      return;
    }
    setSignedDocuments([...signedDocuments, docName]);
    toast({
      title: "Document Signed",
      description: `${docName} has been signed successfully`,
    });
  };

  const pendingDocuments = [
    { name: "Retainer Agreement", from: "Smith & Associates", date: "Dec 10, 2024", type: "Agreement" },
    { name: "Fee Agreement", from: "Smith & Associates", date: "Dec 10, 2024", type: "Agreement" },
    { name: "Privacy Waiver", from: "Smith & Associates", date: "Dec 9, 2024", type: "Waiver" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Document Signing</h1>
            <p className="text-muted-foreground mt-2">Review and sign your legal documents electronically</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="pending">Pending Signatures</TabsTrigger>
              <TabsTrigger value="signed">Signed Documents</TabsTrigger>
              <TabsTrigger value="setup">Signature Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-primary" />
                    Set Up Your Signature
                  </CardTitle>
                  <CardDescription>Create your digital signature and initials for document signing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label>Full Legal Name (Signature)</Label>
                      <Input
                        placeholder="Type your full legal name"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="bg-background"
                      />
                      <div className="p-4 border border-border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground mb-2">Signature Preview:</p>
                        <p className="text-2xl font-signature italic text-foreground">
                          {signature || "Your signature will appear here"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Initials</Label>
                      <Input
                        placeholder="Type your initials (e.g., JS)"
                        value={initials}
                        onChange={(e) => setInitials(e.target.value.toUpperCase())}
                        maxLength={4}
                        className="bg-background"
                      />
                      <div className="p-4 border border-border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground mb-2">Initials Preview:</p>
                        <p className="text-2xl font-signature italic text-foreground">
                          {initials || "XX"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Legal Notice:</strong> By typing your name and initials above, you agree that your typed 
                      signature and initials constitute a legally binding electronic signature under the Electronic 
                      Signatures in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic 
                      Transactions Act (UETA).
                    </p>
                  </div>

                  <Button className="w-full bg-primary text-primary-foreground" disabled={!signature || !initials}>
                    <Check className="h-4 w-4 mr-2" />
                    Save Signature
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingDocuments.filter(doc => !signedDocuments.includes(doc.name)).map((doc, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/20 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">From: {doc.from}</p>
                          <p className="text-sm text-muted-foreground">Sent: {doc.date}</p>
                          <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">{doc.type}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-primary text-primary-foreground"
                          onClick={() => handleSign(doc.name)}
                        >
                          <PenTool className="h-4 w-4 mr-1" />
                          Sign Now
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 p-4 border border-border rounded-lg bg-muted/20">
                      <p className="text-sm font-medium text-foreground mb-4">Document Preview</p>
                      <div className="h-48 bg-background rounded border border-border flex items-center justify-center">
                        <p className="text-muted-foreground">Document preview would appear here</p>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Signature</Label>
                          <div className="p-2 border border-dashed border-border rounded bg-background">
                            <p className="text-lg font-signature italic text-foreground">
                              {signature || "Set up your signature first"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Initials</Label>
                          <div className="p-2 border border-dashed border-border rounded bg-background">
                            <p className="text-lg font-signature italic text-foreground">
                              {initials || "XX"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pendingDocuments.filter(doc => !signedDocuments.includes(doc.name)).length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">All Documents Signed</h3>
                    <p className="text-muted-foreground mt-2">You have no pending documents to sign</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="signed" className="space-y-4">
              {signedDocuments.length > 0 ? (
                signedDocuments.map((docName, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-500/20 rounded-lg">
                            <Check className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{docName}</h3>
                            <p className="text-sm text-muted-foreground">Signed on: {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No Signed Documents</h3>
                    <p className="text-muted-foreground mt-2">Documents you sign will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentSigningPage;
