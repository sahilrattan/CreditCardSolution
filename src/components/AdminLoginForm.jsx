"use client"

import { useEffect, useState } from "react"
import { SopService } from "@/api/services/SopService"
import { DepartmentService } from "@/api/services/DepartmentService"
import { DocumentsService } from "@/api/services/DocumentsService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Download,
  Upload,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Check,
} from "lucide-react"
import { cn } from "@/utils/cn"
import type { SopListVM } from "@/api/models/SopListVM"
import type { Department } from "@/api/models/Department"
import type { CreateDocumentUrlCommand } from "@/api/models/CreateDocumentUrlCommand"
import type { DocumentUrlListVM } from "@/api/models/DocumentUrlListVM"

export default function SopPageEnhanced() {
  const [sops, setSops] = useState<SopListVM[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [error, setError] = useState("")
  const [editingSop, setEditingSop] = useState<SopListVM | null>(null)
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    departmentId: "",
    file: null as File | null,
  })
  const [fileBase64, setFileBase64] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [existingDocuments, setExistingDocuments] = useState<Record<string, DocumentUrlListVM[]>>({})
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false)
  const [editDepartmentSearchOpen, setEditDepartmentSearchOpen] = useState(false)

  useEffect(() => {
    fetchSops()
    DepartmentService.getApiVDepartment("1.0")
      .then((res) => {
        const depts = res.data ?? []
        setDepartments(depts)
        setFilteredDepartments(depts.slice(0, 10))
      })
      .catch(() => setError("Could not load departments list."))
  }, [])

  const fetchSops = () => {
    setIsLoading(true)
    SopService.getApiVSop("1")
      .then((res) => {
        const sopsData = (res.data as any)?.data ?? res.data ?? []
        setSops(sopsData)

        const documentPromises = sopsData.map((sop: SopListVM) =>
          DocumentsService.getApiVDocuments("1", "Sop", sop.sopId)
            .then((docRes) => ({
              sopId: sop.sopId,
              documents: docRes.data ?? [],
            }))
            .catch(() => ({
              sopId: sop.sopId,
              documents: [],
            })),
        )

        Promise.all(documentPromises).then((results) => {
          const docsMap = results.reduce(
            (acc, { sopId, documents }) => {
              acc[sopId] = documents
              return acc
            },
            {} as Record<string, DocumentUrlListVM[]>,
          )
          setExistingDocuments(docsMap)
        })
      })
      .catch(() => setError("Error loading SOPs. Please try again."))
      .finally(() => setIsLoading(false))
  }

  const resetForm = () => {
    setFormState({ name: "", description: "", departmentId: "", file: null })
    setFileBase64("")
    setUploadProgress(0)
    setIsUploading(false)
  }
const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".")
  return lastDotIndex === -1 ? "" : fileName.substring(lastDotIndex + 1).toLowerCase()
}


  // const getFileExtensionWithoutDot = (file: File | string): string => {
  //   const name = typeof file === "string" ? file : file.name
  //   const lastDotIndex = name.lastIndexOf(".")
  //   return lastDotIndex !== -1 ? name.substring(lastDotIndex + 1).toLowerCase() : ""
  // }

const getMimeType = (fileName: string): string => {
  const extension = getFileExtension(fileName)
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  }
  return mimeTypes[extension] || "application/octet-stream"
}


  const DepartmentCombobox = ({
    value,
    onChange,
    open,
    setOpen,
    placeholder = "Select department...",
  }: {
    value: string
    onChange: (val: string) => void
    open: boolean
    setOpen: (open: boolean) => void
    placeholder?: string
  }) => {
    const selectedDepartment = departments.find((d) => d.departmentID === value)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{selectedDepartment ? selectedDepartment.name : placeholder}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search departments..." className="h-9" />
            <CommandList>
              <CommandEmpty>No department found.</CommandEmpty>
              <CommandGroup>
                {filteredDepartments.map((dept) => (
                  <CommandItem
                    key={dept.departmentID}
                    value={dept.name}
                    onSelect={() => {
                      onChange(dept.departmentID)
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{dept.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {dept.departmentID.slice(0, 20)}...</div>
                      </div>
                    </div>
                    <Check
                      className={cn("ml-auto h-4 w-4", value === dept.departmentID ? "opacity-100" : "opacity-0")}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  const handleFileChange = async (file: File | null) => {
    setFormState((p) => ({ ...p, file }))
    if (!file) {
      setFileBase64("")
      setUploadProgress(0)
      setIsUploading(false)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    const reader = new FileReader()
    reader.onload = () => {
      setFileBase64(reader.result?.toString().split(",")[1] || "")
      clearInterval(progressInterval)
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
      }, 500)
    }
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    const { name, description, departmentId, file } = formState
    if (!name.trim() || !description.trim() || !departmentId) return

    try {
      const sopRes = await SopService.postApiVSop("1", {
        name,
        description,
        departmentId,
      })

      const sopId = sopRes.data?.sopId || sopRes.data?.data?.sopId || sopRes.data?.data?.sopID

      if (file && fileBase64 && sopId) {
   const ext = file.name.split(".").pop() || ""
const extension = ext.startsWith(".") ? ext : `.${ext}`

        const docCmd = {
          name: file.name,
          description: `Document for ${name}`,
          content: fileBase64,
          category: "Sop",
          categoryId: sopId,
          extension: extension,
          contentType: file.type,
          documentFileName: file.name,
        }
        await DocumentsService.postApiVDocuments("1", docCmd)
      }

      resetForm()
      setIsCreateDialogOpen(false)
      fetchSops()
    } catch (error) {
      console.error("Create error:", error)
      setError("Failed to create SOP or upload document.")
    }
  }

  const handleEdit = (sop: SopListVM) => {
    setEditingSop(sop)
    setFormState({
      name: sop.name ?? "",
      description: sop.description ?? "",
      departmentId: (sop as any).departmentId ?? "",
      file: null,
    })
    setFileBase64("")
    setUploadProgress(0)
    setIsUploading(false)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingSop) return
    const { name, description, departmentId, file } = formState
    if (!name.trim() || !description.trim() || !departmentId) return

    try {
      await SopService.putApiVSop("1", {
        sopId: editingSop.sopId,
        name,
        description,
        departmentId,
      })

      if (file && fileBase64 && editingSop.sopId) {
        const docCmd: CreateDocumentUrlCommand = {
          name: file.name,
          description: `Document for ${name}`,
          url: fileBase64,
          category: "Sop",
          categoryId: editingSop.sopId,
        }
        await DocumentsService.postApiVDocuments("1", docCmd)
      }

      setEditingSop(null)
      resetForm()
      setIsEditDialogOpen(false)
      fetchSops()
    } catch (error) {
      console.error("Update error:", error)
      setError("Failed to update SOP or upload document.")
    }
  }

  const handleDelete = (id: string) =>
    confirm("Delete this SOP?") &&
    SopService.deleteSop(id, "1")
      .then(fetchSops)
      .catch(() => setError("Failed to delete SOP. Please try again."))

  const handleCancel = () => {
    setEditingSop(null)
    resetForm()
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setDepartmentSearchOpen(false)
    setEditDepartmentSearchOpen(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i])
  }

  const handleDownload = async (doc: DocumentUrlListVM) => {
    try {
      if (!doc.categoryID || !doc.name || !doc.blobUrl) {
        console.warn("Missing document metadata")
        return
      }
      const link = document.createElement("a")
      link.href = doc.url
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download error", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                SOP Management
              </h1>
              <p className="text-muted-foreground text-lg">Manage Standard Operating Procedures with ease</p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New SOP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  Create New SOP
                </DialogTitle>
                <DialogDescription className="text-base">
                  Fill in the details below to create a new Standard Operating Procedure.
                </DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="grid gap-6 py-4">
                <div className="grid gap-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    SOP Title
                  </Label>
                  <Input
                    placeholder="Enter SOP title..."
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="grid gap-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Description
                  </Label>
                  <Input
                    placeholder="Enter description..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="grid gap-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Department
                  </Label>
                  <DepartmentCombobox
                    value={formState.departmentId}
                    onChange={(val) => setFormState({ ...formState, departmentId: val })}
                    open={departmentSearchOpen}
                    setOpen={setDepartmentSearchOpen}
                    placeholder="Search and select department..."
                  />
                </div>

                <div className="grid gap-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Attach File (optional)
                  </Label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx"
                      className="h-11"
                      disabled={isUploading}
                    />

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Uploading...</span>
                          <span className="font-medium">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    {formState.file && !isUploading && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="font-medium text-green-900">{formState.file.name}</div>
                            <div className="text-sm text-green-700">
                              Size: {formatFileSize(formState.file.size)} • Type: {getMimeType(formState.file.name)}
                            </div>
                            <div className="text-xs text-green-600">
                              Extension:{" "}
  Extension: <code className="bg-green-100 px-1 rounded">{"." + getFileExtension(formState.file.name)}</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-4">
                <Button variant="outline" onClick={handleCancel} size="lg">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    !formState.name.trim() || !formState.description.trim() || !formState.departmentId || isUploading
                  }
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Create SOP
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span>SOP Directory</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                {sops.length} {sops.length === 1 ? "item" : "items"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">View and manage all Standard Operating Procedures</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600" />
                <p className="text-muted-foreground font-medium">Loading SOPs...</p>
              </div>
            ) : sops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-gray-900">No SOPs found</p>
                  <p className="text-muted-foreground">Get started by creating your first SOP</p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="hidden sm:table-cell font-semibold">Department</TableHead>
                      <TableHead className="hidden sm:table-cell font-semibold">Documents</TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold">ID</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sops.map((sop, index) => (
                      <TableRow key={sop.sopId} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium">{sop.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {departments.find((d) => d.departmentID === (sop as any).departmentId)?.name ||
                                "Unassigned"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {existingDocuments[sop.sopId]?.length || 0} file(s)
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {sop.sopId.slice(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(sop)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(sop.sopId)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit className="h-5 w-5 text-orange-600" />
                </div>
                Edit SOP
              </DialogTitle>
              <DialogDescription className="text-base">
                Update the SOP details and manage attached documents.
              </DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  SOP Title
                </Label>
                <Input
                  placeholder="Enter SOP title..."
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Description
                </Label>
                <Input
                  placeholder="Enter description..."
                  value={formState.description}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      description: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Department
                </Label>
                <DepartmentCombobox
                  value={formState.departmentId}
                  onChange={(val) => setFormState({ ...formState, departmentId: val })}
                  open={editDepartmentSearchOpen}
                  setOpen={setEditDepartmentSearchOpen}
                  placeholder="Search and select department..."
                />
              </div>

              {/* Existing Documents Section */}
              {editingSop && existingDocuments[editingSop.sopId]?.length > 0 && (
                <div className="grid gap-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Existing Documents
                  </Label>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {existingDocuments[editingSop.sopId].map((doc) => (
                      <div
                        key={doc.documentID}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-blue-900">{doc.name || "Unnamed Document"}</div>
                            {doc.description && <div className="text-sm text-blue-700">{doc.description}</div>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="hover:bg-blue-100"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Add New Document (optional)
                </Label>
                <div className="space-y-3">
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx"
                    className="h-11"
                    disabled={isUploading}
                  />

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uploading...</span>
                        <span className="font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {formState.file && !isUploading && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-green-900">{formState.file.name}</div>
                          <div className="text-sm text-green-700">
                            Size: {formatFileSize(formState.file.size)} • Type: {getMimeType(formState.file.name)}
                          </div>
                          <div className="text-xs text-green-600">
                            Extension:{" "}
  Extension: <code className="bg-green-100 px-1 rounded">{"." + getFileExtension(formState.file.name)}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {editingSop && (
                <div className="grid gap-3">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    SOP ID
                  </Label>
                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <code className="text-sm font-mono text-gray-700">{editingSop.sopId}</code>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel} size="lg">
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={
                  !formState.name.trim() || !formState.description.trim() || !formState.departmentId || isUploading
                }
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Update SOP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

