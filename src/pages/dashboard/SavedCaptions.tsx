import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Library, Copy, Trash2, Download, Search, Filter, FileText, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCaptions } from "@/hooks/useCaptions";
import { exportToCSV, exportToJSON, exportToTXT, exportToPDF } from "@/lib/exportUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SavedCaptions = () => {
  const { user } = useAuth();
  const { captions, fetchCaptions, deleteCaption, isLoading } = useCaptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterTone, setFilterTone] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchCaptions();
    }
  }, [user]);

  const filteredCaptions = captions.filter((caption) => {
    const matchesSearch = caption.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === "all" || caption.platform === filterPlatform;
    const matchesTone = filterTone === "all" || caption.tone === filterTone;
    return matchesSearch && matchesPlatform && matchesTone;
  });

  const handleCopy = (caption: any) => {
    const fullText = `${caption.text}\n\n${
      caption.hashtags?.length > 0 ? caption.hashtags.map((tag: string) => `#${tag}`).join(" ") : ""
    }`;
    navigator.clipboard.writeText(fullText);
    toast.success("Caption copied to clipboard!");
  };

  const handleDelete = async (captionId: string) => {
    if (confirm("Are you sure you want to delete this caption?")) {
      await deleteCaption(captionId);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'txt' | 'pdf') => {
    if (filteredCaptions.length === 0) {
      toast.error("No captions to export");
      return;
    }

    const filename = `vidpilot-captions-${Date.now()}`;
    
    try {
      switch (format) {
        case 'csv':
          exportToCSV(filteredCaptions, filename);
          toast.success("✅ Exported as CSV!");
          break;
        case 'json':
          exportToJSON(filteredCaptions, filename);
          toast.success("✅ Exported as JSON!");
          break;
        case 'txt':
          exportToTXT(filteredCaptions, filename);
          toast.success("✅ Exported as TXT!");
          break;
        case 'pdf':
          exportToPDF(filteredCaptions, filename);
          toast.success("✅ Exported as PDF!");
          break;
      }
    } catch (error) {
      toast.error("Failed to export captions");
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Library className="w-8 h-8 text-primary" />
          Caption History
        </h1>
        <p className="text-muted-foreground mt-1">
          All your generated captions are automatically saved here
        </p>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search captions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTone} onValueChange={setFilterTone}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="All Tones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tones</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="funny">Funny</SelectItem>
              <SelectItem value="emotional">Emotional</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {filteredCaptions.length} caption{filteredCaptions.length !== 1 ? "s" : ""} found
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileJson className="w-4 h-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Captions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredCaptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Library className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery || filterPlatform !== "all" || filterTone !== "all"
              ? "No captions found"
              : "No history yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || filterPlatform !== "all" || filterTone !== "all"
              ? "Try adjusting your filters"
              : "Generate captions and they'll automatically appear here"}
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCaptions.map((caption, index) => (
            <motion.div
              key={caption.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 space-y-3 bg-secondary/30 border-border hover:border-primary/50 transition-colors h-full flex flex-col">
                {/* Platform & Tone Badges */}
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                    {caption.platform}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent capitalize">
                    {caption.tone}
                  </span>
                  {caption.language === "bengali" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      বাংলা
                    </span>
                  )}
                </div>

                {/* Caption Text */}
                <p className="text-sm text-foreground whitespace-pre-wrap flex-1 line-clamp-6">
                  {caption.text}
                </p>

                {/* Hashtags */}
                {caption.hashtags && caption.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {caption.hashtags.slice(0, 5).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                    {caption.hashtags.length > 5 && (
                      <span className="text-xs px-2 py-0.5 text-muted-foreground">
                        +{caption.hashtags.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {new Date(caption.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(caption)}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(caption.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCaptions;
