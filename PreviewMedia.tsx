"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileText, Image } from "lucide-react";

interface MediaItem {
  type: "poster" | "slideshow" | "pdf";
  files: File[];
}

interface PreviewMediaProps {
  media: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewMedia({ media, open, onOpenChange }: PreviewMediaProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview Media</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh]">
          {media?.type === "pdf" && (
            <div className="flex flex-col items-center justify-center p-4">
              <FileText className="h-24 w-24 text-muted-foreground" />
              <p className="mt-2 text-lg font-medium">{media.files[0]?.name}</p>
              <p className="text-sm text-muted-foreground">PDF File</p>
            </div>
          )}

          {media?.type === "poster" && media.files[0] && (
            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(media.files[0])}
                alt="Poster"
                className="max-h-[60vh] object-contain"
              />
            </div>
          )}

          {media?.type === "slideshow" && media.files.length > 0 && (
            <Carousel className="w-full max-w-2xl mx-auto">
              <CarouselContent>
                {media.files.map((file, index) => (
                  <CarouselItem key={index}>
                    <div className="flex justify-center p-1">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Slide ${index + 1}`}
                        className="max-h-[60vh] object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
