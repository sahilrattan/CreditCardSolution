"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFileIcon, getMimeType } from "@/utils/file-utils";
import type { DocumentUrlListVM } from "@/api/models/DocumentUrlListVM";
import { useEffect, useCallback, useState } from "react";
import { ExternalLink, Download, AlertCircle } from "lucide-react";

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentUrlListVM | null;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  document,
}: FilePreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const mimeType = getMimeType(document?.name ?? "");
  const Icon = getFileIcon(document?.name ?? "");
  const fileUrl = document?.url || document?.blobUrl || "";

  const getProxyUrl = useCallback(() => {
    return `http://localhost:3001/api/view-pdf?url=${encodeURIComponent(fileUrl)}`;
  }, [fileUrl]);

  const openPdf = useCallback(() => {
    if (fileUrl) {
      const proxyUrl = getProxyUrl();
      window.open(proxyUrl, "_blank", "noopener,noreferrer");
    }
  }, [fileUrl, getProxyUrl]);

  const downloadFile = useCallback(() => {
    if (fileUrl && document?.name) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = document.name;
      link.click();
    }
  }, [fileUrl, document?.name]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open]);

  if (!document) return null;

  const renderPreviewContent = () => {
    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Icon className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">No preview available.</p>
          <p className="text-sm">The file URL is missing or invalid.</p>
        </div>
      );
    }

    /** ---------- Image ---------- */
    if (mimeType.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={document.name ?? "File preview"}
          className="max-w-full max-h-[70vh] object-contain mx-auto"
          onLoad={() => setIsLoading(false)}
        />
      );
    }

    /** ---------- PDF with iframe (via proxy) ---------- */
    if (mimeType === "application/pdf") {
      const proxyUrl = getProxyUrl();
      return (
        <div className="w-full h-[80vh] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}
          <iframe
            src={proxyUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="PDF Preview"
            onLoad={() => setIsLoading(false)}
          />
          {!isLoading && (
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <Button onClick={openPdf} size="sm" variant="secondary" className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Open
              </Button>
              <Button onClick={downloadFile} size="sm" variant="secondary" className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>
          )}
        </div>
      );
    }

    /** ---------- Unsupported file ---------- */
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-2" />
        <p className="text-lg font-medium">Preview not available</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          This file cannot be displayed in-browser. You can open it in a new tab or download it below.
        </p>
        <div className="flex gap-3 mt-4">
          {mimeType === "application/pdf" && (
            <Button
              onClick={openPdf}
              variant="default"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          )}
          <Button
            onClick={downloadFile}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Download File
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-blue-600" />
            {document.name ?? "File Preview"}
          </DialogTitle>
          <DialogDescription>
            {document.description ?? "No description available."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex justify-center items-center w-full">
          {renderPreviewContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}





















const express = require("express");
const fetch = require("node-fetch"); // Use node-fetch v2 for CommonJS
const app = express();
const PORT = 3001;

app.get("/api/view-pdf", async (req, res) => {
  const fileUrl = req.query.url;

  if (!fileUrl) {
    return res.status(400).send("Missing 'url' query parameter");
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch file");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=preview.pdf");

    response.body.pipe(res); // Stream the response to client
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Server error while fetching file");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
