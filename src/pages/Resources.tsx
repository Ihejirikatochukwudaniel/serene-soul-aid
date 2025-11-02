import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  content_text: string | null;
}

const CATEGORIES = ["All", "ANXIETY", "MINDFULNESS", "STRESS", "SELF-ESTEEM", "JOURNALING", "EXERCISES"];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, selectedCategory, searchQuery]);

  async function loadResources() {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading resources:", error);
      return;
    }

    if (data) {
      setResources(data);
    }
  }

  function filterResources() {
    let filtered = resources;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    setFilteredResources(filtered);
  }

  const categoryColors: Record<string, string> = {
    ANXIETY: "text-orange-400",
    MINDFULNESS: "text-blue-400",
    STRESS: "text-red-400",
    "SELF-ESTEEM": "text-purple-400",
    JOURNALING: "text-yellow-400",
    EXERCISES: "text-green-400",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      
      <main className="flex-1 pt-20 pb-24 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-3xl font-bold">Resources</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, videos..."
              className="pl-9 glass"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat === "SELF-ESTEEM" ? "Self-Esteem" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                className="glass p-5 cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setSelectedResource(resource)}
              >
                <div className="space-y-2">
                  <p className={`text-xs font-bold uppercase tracking-wider ${categoryColors[resource.category] || "text-primary"}`}>
                    {resource.category.replace("-", " ")}
                  </p>
                  <h3 className="text-lg font-bold">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
              </Card>
            ))}

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="space-y-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${categoryColors[selectedResource?.category || ""] || "text-primary"}`}>
                {selectedResource?.category.replace("-", " ")}
              </p>
              <DialogTitle className="text-2xl">{selectedResource?.title}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">{selectedResource?.description}</p>
            {selectedResource?.content_text && (
              <div className="prose prose-sm dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed">{selectedResource.content_text}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
