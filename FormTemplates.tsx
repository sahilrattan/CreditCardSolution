"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusIcon, EyeIcon, Trash2Icon, GlobeIcon, ImagePlus, FileText, Images } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import NewFormDialog from "@/components/form/NewFormDialog"
import { MdPermMedia } from "react-icons/md"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface FormTemplate {
  id: string
  name: string
  createdAt: string
  fields?: any[]
  media?: MediaItem
}

interface MediaItem {
  type: "poster" | "slideshow" | "pdf"
  files: MediaFile[] // Changed from File[] to MediaFile[]
  urls?: string[]
}

interface MediaFile {
  name: string
  type: string
  size: number
  data: string // base64 data URL
}

const LOCAL_STORAGE_KEY = "forms"

export default function FormTemplatesPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false)
  const [embedFormId, setEmbedFormId] = useState<string | null>(null)
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null)
  const [currentFormId, setCurrentFormId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadTemplates = () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      try {
        const parsed = stored ? JSON.parse(stored) : []
        // Templates are now properly stored with base64 data, no need for conversion
        const templatesWithMedia = Array.isArray(parsed) ? parsed : []
        setTemplates(templatesWithMedia)
      } catch {
        setTemplates([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [])

  const handleCreateForm = (formName: string, isBlank = false) => {
    const newForm: FormTemplate = {
      id: Date.now().toString(),
      name: formName,
      createdAt: new Date().toISOString(),
      fields: isBlank ? [] : undefined,
    }
    const updated = [...templates, newForm]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    setTemplates(updated)
    setShowDialog(false)
    navigate(`/formbuilder/${newForm.id}`)
  }

  const confirmDelete = () => {
    if (!formToDelete) return
    const updated = templates.filter((f) => f.id !== formToDelete)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    setTemplates(updated)
    setDeleteDialogOpen(false)
    setFormToDelete(null)
  }

  const generateEmbedCode = (formId: string) => {
    return `<!-- Embed this in your HTML -->
<div id="form-embed-container">
  <button class="form-btn" id="openFormBtn" data-form-id="${formId}">
    Open Form
  </button>
</div>
<script src="http://localhost:5173/embed.js"></script>
<link rel="stylesheet" href="http://localhost:5173/embed.css" />`
  }

  // Convert File objects to MediaFile objects with base64 data
  const convertFilesToMediaFiles = async (files: File[]): Promise<MediaFile[]> => {
    const mediaFiles: MediaFile[] = []

    for (const file of files) {
      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      mediaFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: data,
      })
    }

    return mediaFiles
  }

  const handleSaveMedia = async (formId: string, media: MediaItem) => {
    setIsUploading(true)
    try {
      // Convert File objects to MediaFile objects with base64 data
      const mediaFiles = await convertFilesToMediaFiles(media.files as File[])

      // Create media object with base64 data URLs
      const mediaWithData: MediaItem = {
        ...media,
        files: mediaFiles,
        urls: mediaFiles.map((file) => file.data), // Use base64 data URLs directly
      }

      const updated = templates.map((template) => {
        if (template.id === formId) {
          return { ...template, media: mediaWithData }
        }
        return template
      })

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
      setTemplates(updated)
      setCurrentMedia(null)
      setMediaDialogOpen(false)
    } catch (error) {
      console.error("Error saving media:", error)
      alert("Error saving media files. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "poster" | "slideshow" | "pdf") => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (type === "pdf") {
        const pdfFiles = newFiles.filter((file) => file.type === "application/pdf")
        setCurrentMedia({
          type: "pdf",
          files: pdfFiles.slice(0, 1) as any, // Will be converted to MediaFile[]
        })
      } else {
        const imageFiles = newFiles.filter((file) => file.type.startsWith("image/"))
        setCurrentMedia({
          type,
          files: (type === "poster" ? imageFiles.slice(0, 1) : imageFiles) as any, // Will be converted to MediaFile[]
        })
      }
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading forms...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <TooltipProvider>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Form Templates</h1>
          <div className="space-x-2">
            <Button onClick={() => setShowDialog(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Form
            </Button>
            <Button variant="outline">
              <GlobeIcon className="mr-2 h-4 w-4" />
              Docs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Blank Form */}
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCreateForm("Untitled Form", true)}>
            <CardHeader>
              <CardTitle className="text-center">Blank Form</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PlusIcon className="h-12 w-12 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Form Templates */}
          {templates.length > 0 ? (
            templates.map((template) => (
              <Card key={template.id}>
                <div
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/formbuilder/${template.id}`)}
                >
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Fields: {template.fields?.length || 0}</p>
                    {template.media && (
                      <p className="text-sm text-muted-foreground">
                        Media: {template.media.type} ({template.media.files.length} file
                        {template.media.files.length !== 1 ? "s" : ""})
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open("/embed.html", "_blank")
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview Form</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormToDelete(template.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={template.media ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentFormId(template.id)
                              setCurrentMedia(template.media || null)
                              setMediaDialogOpen(true)
                            }}
                          >
                            <MdPermMedia className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{template.media ? "Edit Media" : "Add Media"}</TooltipContent>
                      </Tooltip>
                      {template.media && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/form-preview/${template.id}`)
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Preview</TooltipContent>
                        </Tooltip>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEmbedFormId(template.id)
                          setEmbedDialogOpen(true)
                        }}
                      >
                        Embed Code
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground">No templates found.</div>
          )}
        </div>
      </TooltipProvider>

      {/* New Form Dialog */}
      <NewFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onCreate={(name) => handleCreateForm(name, false)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the form.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Embed Code Dialog */}
      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Embed This Form</DialogTitle>
            <DialogDescription>Copy the embed code and paste it into your website.</DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full p-3 rounded border text-sm font-mono bg-muted"
            rows={8}
            readOnly
            value={embedFormId ? generateEmbedCode(embedFormId) : ""}
          />
          <DialogFooter>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generateEmbedCode(embedFormId || ""))
              }}
            >
              Copy Code
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Media Dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentMedia ? "Edit Media" : "Add Media"}</DialogTitle>
            <DialogDescription>
              {currentMedia ? "Update the media files for your form" : "Upload media files for your form"}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue={currentMedia?.type || "poster"}>
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
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "poster")} multiple={false} />
                {currentMedia?.type === "poster" && currentMedia.files.length > 0 && (
                  <div className="text-sm text-muted-foreground">Selected: {currentMedia.files[0].name}</div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="slideshow">
              <div className="space-y-4 py-4">
                <Label>Upload multiple images</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "slideshow")} multiple />
                {currentMedia?.type === "slideshow" && currentMedia.files.length > 0 && (
                  <div className="text-sm text-muted-foreground">Selected {currentMedia.files.length} images</div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="pdf">
              <div className="space-y-4 py-4">
                <Label>Upload a PDF file</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "pdf")}
                  multiple={false}
                />
                {currentMedia?.type === "pdf" && currentMedia.files.length > 0 && (
                  <div className="text-sm text-muted-foreground">Selected: {currentMedia.files[0].name}</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMediaDialogOpen(false)
                setCurrentMedia(null)
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (currentMedia && currentFormId) {
                  handleSaveMedia(currentFormId, currentMedia)
                }
              }}
              disabled={!currentMedia || currentMedia.files.length === 0 || isUploading}
            >
              {isUploading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Media Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[70%] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview Media</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {currentMedia?.type === "poster" && currentMedia.urls?.[0] && (
              <div className="flex justify-center">
                <img
                  src={currentMedia.urls[0] || "/placeholder.svg"}
                  alt="Poster"
                  className="max-h-[60vh] object-contain"
                />
              </div>
            )}
            {currentMedia?.type === "slideshow" && currentMedia.urls && currentMedia.urls.length > 0 && (
              <Carousel className="w-full max-w-2xl mx-auto">
                <CarouselContent>
                  {currentMedia.urls.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="flex justify-center p-1">
                        <img
                          src={url || "/placeholder.svg"}
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
    </div>
  )
}
