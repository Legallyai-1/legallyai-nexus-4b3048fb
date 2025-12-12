import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

const StoreAssetsPage = () => {
  const assets = [
    { name: "Feature Graphic (1024x500)", file: "/store-assets/feature-graphic.png" },
    { name: "Screenshot 1 - AI Chat", file: "/store-assets/screenshot-1-chat.png" },
    { name: "Screenshot 2 - Documents", file: "/store-assets/screenshot-2-documents.png" },
    { name: "Screenshot 3 - AI Assistants", file: "/store-assets/screenshot-3-assistants.png" },
    { name: "Screenshot 4 - Dashboard", file: "/store-assets/screenshot-4-dashboard.png" },
  ];

  const handleDownload = (file: string, name: string) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Play Store Assets</h1>
        
        <div className="grid gap-4">
          {assets.map((asset) => (
            <Card key={asset.file} className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg">{asset.name}</CardTitle>
                <Button onClick={() => handleDownload(asset.file, asset.name)} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardHeader>
              <CardContent>
                <img src={asset.file} alt={asset.name} className="w-full rounded-lg border" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreAssetsPage;
