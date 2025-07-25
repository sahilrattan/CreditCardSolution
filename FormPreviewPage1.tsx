"use client"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { FileText, ImageIcon } from "lucide-react"

interface FormField {
  id: string
  type: string
  label: string
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}

interface MediaFile {
  name: string
  type: string
  size: number
  data: string // base64 data URL
}

interface MediaItem {
  type: "poster" | "slideshow" | "pdf"
  files: MediaFile[] // Changed from File[] to MediaFile[]
  urls?: string[]
}

export default function MediaFormPreviewPage() {
  const { id } = useParams()
  const [formData, setFormData] = useState<{
    name: string
    fields: FormField[]
    values?: Record<string, any>
    media?: MediaItem
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    document.body.style.padding = "0"
    document.body.style.margin = "0"
    document.body.style.height = "100vh"

    const loadForm = () => {
      try {
        const stored = localStorage.getItem("forms")
        if (stored) {
          const forms = JSON.parse(stored)
          const form = forms.find((f: any) => f.id === id)
          if (form) {
            setFormData({
              name: form.name,
              fields: form.fields || [],
              values: form.values || {},
              media: form.media || undefined,
            })
          }
        }
      } catch (error) {
        console.error("Error loading form:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadForm()

    return () => {
      document.body.style.overflow = ""
      document.body.style.padding = ""
      document.body.style.margin = ""
      document.body.style.height = ""
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p>Loading preview...</p>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p>Form not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Media Preview Section (Left Side) */}
      <div className="w-1/2 h-full bg-white border-r border-gray-200 overflow-auto p-8">
        <h2 className="text-xl font-bold mb-6">Media Preview</h2>
        {formData.media ? (
          <div className="flex flex-col items-center justify-center h-[calc(100%-3rem)]">
            {formData.media.type === "pdf" && formData.media.urls?.[0] && (
              <div className="w-full h-full">
                <iframe
                  src={formData.media.urls[0]}
                  title="PDF Preview"
                  className="border-none"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                />
                <p className="mt-2 text-sm text-muted-foreground text-center">{formData.media.files[0]?.name}</p>
              </div>
            )}
            {formData.media.type === "poster" && formData.media.urls?.[0] && (
              <div className="flex justify-center max-h-full">
                <img
                  src={formData.media.urls[0] || "/placeholder.svg"}
                  alt="Poster"
                  className="max-h-[80vh] object-contain"
                  onError={(e) => {
                    console.error("Image failed to load:", formData.media?.urls?.[0])
                    e.currentTarget.src = "/placeholder.svg?height=400&width=400&text=Image+Not+Found"
                  }}
                />
              </div>
            )}
            {formData.media.type === "slideshow" && formData.media.urls && formData.media.urls.length > 0 && (
              <div className="w-full max-w-2xl">
                <Carousel>
                  <CarouselContent>
                    {formData.media.urls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="flex justify-center p-1">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Slide ${index + 1}`}
                            className="max-h-[70vh] object-contain"
                            onError={(e) => {
                              console.error(`Slide ${index + 1} failed to load:`, url)
                              e.currentTarget.src = "/placeholder.svg?height=400&width=400&text=Image+Not+Found"
                            }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100%-3rem)] text-gray-400">
            <ImageIcon className="h-24 w-24 mb-4" />
            <p>No media attached to this form</p>
          </div>
        )}
      </div>

      {/* Form Preview Section (Right Side) */}
      <div className="w-1/2 h-full overflow-auto p-8">
        <h2 className="text-xl font-bold mb-6">Form Preview</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-6">{formData.name}</h1>
          <div className="space-y-4">
            {formData.fields.length > 0 ? (
              formData.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field, formData.values?.[field.id])}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No fields in this form</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderField(field: FormField, savedValue?: any) {
  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "phone":
      return (
        <input
          type={field.type}
          placeholder={field.placeholder}
          value={savedValue || ""}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly
        />
      )
    case "textarea":
      return (
        <textarea
          placeholder={field.placeholder}
          value={savedValue || ""}
          className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly
        />
      )
    case "select":
      return (
        <select
          value={savedValue || ""}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled
        >
          <option value="">{field.placeholder || "Select an option"}</option>
          {field.options?.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    case "radio":
    case "radioGroup":
      return (
        <div className="space-y-2">
          {field.options?.map((opt, i) => (
            <label key={i} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`radio-${field.label}`}
                value={opt.value}
                checked={savedValue === opt.value}
                className="text-blue-500"
                readOnly
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )
    case "checkbox":
      return (
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={savedValue || false} className="text-blue-500 rounded" readOnly />
          <span>{field.label}</span>
        </label>
      )
    case "toggle":
      return (
        <div className="flex items-center space-x-2">
          <div
            className={`w-12 h-6 rounded-full ${savedValue ? "bg-blue-500" : "bg-gray-300"} relative transition-colors`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${savedValue ? "translate-x-6" : "translate-x-0.5"}`}
            />
          </div>
          <span className="text-sm">{savedValue ? "On" : "Off"}</span>
        </div>
      )
    case "date":
      return (
        <input
          type="date"
          value={savedValue ? new Date(savedValue).toISOString().split("T")[0] : ""}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly
        />
      )
    case "time":
      return (
        <input
          type="time"
          value={savedValue || ""}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly
        />
      )
    case "file":
    case "image":
      return (
        <div className="border-2 border-dashed border-gray-300 rounded p-4">
          {savedValue ? (
            <div className="space-y-2">
              {Array.isArray(savedValue) ? (
                savedValue.map((file: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{savedValue.name}</span>
                  <span className="text-xs text-gray-500">({(savedValue.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No file uploaded</p>
          )}
        </div>
      )
    default:
      return (
        <input
          type="text"
          placeholder="Unknown field type"
          value={savedValue || ""}
          className="w-full p-2 border rounded"
          readOnly
        />
      )
  }
}
