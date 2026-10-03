import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function JobBoardPage() {
  return (
    <Layout>
      <section className="container mx-auto px-4 py-24 max-w-xl">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold">Job Board</h1>
            <p className="text-muted-foreground">The job board is not available right now. Check back soon.</p>
            <Button asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
