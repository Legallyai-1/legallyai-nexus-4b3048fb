import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

const StoreAssetsPage = () => {
  const assets = [
    { name: "App Icon (512x512)", file: "/app-icon.png" },
    { name: "Feature Graphic (1024x500)", file: "/feature-graphic.png" },
  ];

  const handleDownload = async (file: string, name: string) => {
    try {
      const response = await fetch(file);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Download Store Assets</h1>
        
        <div className="grid gap-6">
          {assets.map((asset) => (
            <Card key={asset.file} className="bg-card">
              <CardContent className="p-4">
                <img src={asset.file} alt={asset.name} className="w-full rounded-lg border mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{asset.name}</span>
                  <Button onClick={() => handleDownload(asset.file, asset.name)} size="lg" className="gap-2">
                    <Download className="w-5 h-5" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreAssetsPage;
