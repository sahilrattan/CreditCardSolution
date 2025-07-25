"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Images, FileText } from "lucide-react";

interface MediaItem {
  type: "poster" | "slideshow" | "pdf";
  files: File[];
}

interface AddMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (media: MediaItem) => void;
}

export function AddMediaDialog({
  open,
  onOpenChange,
  onSave,
}: AddMediaDialogProps) {
  const [activeTab, setActiveTab] = useState<"poster" | "slideshow" | "pdf">(
    "poster"
  );
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file types based on active tab
      if (activeTab === "pdf") {
        const pdfFiles = newFiles.filter(
          (file) => file.type === "application/pdf"
        );
        setFiles(pdfFiles);
      } else {
        const imageFiles = newFiles.filter((file) =>
          file.type.startsWith("image/")
        );
        setFiles(imageFiles);
      }
    }
  };

  const handleSave = () => {
    if (files.length > 0) {
      onSave({
        type: activeTab,
        files: files,
      });
      onOpenChange(false);
      setFiles([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
          <DialogDescription>
            Upload media files for your form
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="poster">
              <ImagePlus className="mr-2 h-4 w-4" />
              Poster
            </TabsTrigger>
            <TabsTrigger value="slideshow">
              <Images className="mr-2 h-4 w-4" />
              Slideshow
            </TabsTrigger>
            <TabsTrigger value="pdf">
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="poster">
            <div className="space-y-4 py-4">
              <Label>Upload a single image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                multiple={false}
              />
              {files.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected: {files[0].name}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="slideshow">
            <div className="space-y-4 py-4">
              <Label>Upload multiple images</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                multiple
              />
              {files.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected {files.length} images
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pdf">
            <div className="space-y-4 py-4">
              <Label>Upload a PDF file</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                multiple={false}
              />
              {files.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected: {files[0].name}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={files.length === 0}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
