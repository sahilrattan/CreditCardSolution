"use client"
import { useDroppable } from "@dnd-kit/core"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField } from "@/components/ui/form"
import {
  DynamicCheckbox,
  DynamicInput,
  DynamicRadioGroup,
  DynamicSelect,
  DynamicTextarea,
  DynamicEmail,
  DynamicNumber,
  DynamicPhone,
  DynamicDate,
  DynamicTime,
  DynamicFile,
  DynamicToggle,
  DynamicSection,
  DynamicDivider,
} from "@/components/form/dynamic-fileds"
import { FormFieldType } from "./types"
import { cn } from "@/utils/cn"
import { useEffect, useState, useMemo } from "react"
import { useDndMonitor } from "@dnd-kit/core"

interface FormPreviewProps {
  formId?: string
  formFields?: FormFieldType[]
  onFieldClick?: (id: string) => void
  selectedFieldId?: string | null
  onSaveForm?: (formData: any) => void
}

export function FormPreview({
  formId,
  formFields: initialFormFields = [],
  onFieldClick,
  selectedFieldId,
  onSaveForm,
}: FormPreviewProps) {
  const [formFields, setFormFields] = useState<FormFieldType[]>(initialFormFields)
  const [savedValues, setSavedValues] = useState<Record<string, any>>({})

  const { setNodeRef, isOver } = useDroppable({
    id: "form-drop-area",
    data: {
      accepts: [
        "text",
        "textarea",
        "select",
        "checkbox",
        "radioGroup",
        "email",
        "number",
        "phone",
        "toggle",
        "multiselect",
        "date",
        "time",
        "datetime",
        "file",
        "image",
        "section",
        "divider",
      ],
    },
  })

  // Load form data from localStorage if formId is provided
  useEffect(() => {
    if (formId) {
      const forms = JSON.parse(localStorage.getItem("forms") || "[]")
      const form = forms.find((f: any) => f.id === formId)
      if (form) {
        setFormFields(form.fields || [])
        setSavedValues(form.values || {})
      }
    }
  }, [formId])

  // Sync with parent component when formFields prop changes
  useEffect(() => {
    setFormFields(initialFormFields)
  }, [initialFormFields])

  // Handle drop events
  useDndMonitor({
    onDragEnd({ active, over }) {
      if (over?.id === "form-drop-area") {
        const fieldType = active.data.current?.type
        const fieldLabel = active.data.current?.label || "New Field"
        if (fieldType) {
          const newField: FormFieldType = {
            id: `field-${Date.now()}`,
            type: fieldType,
            label: fieldLabel,
            required: false,
            placeholder: `Enter ${fieldLabel.toLowerCase()}`,
            options:
              fieldType === "select" || fieldType === "radioGroup" || fieldType === "multiselect"
                ? [{ label: "Option 1", value: "option1" }]
                : undefined,
          }
          setFormFields([...formFields, newField])
          if (onFieldClick) {
            onFieldClick(newField.id)
          }
        }
      }
    },
  })

  // Generate schema dynamically based on current form fields
  const dynamicSchema = useMemo(() => {
    const schema: { [key: string]: z.ZodTypeAny } = {}
    formFields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny
      switch (field.type) {
        case FormFieldType.Text:
        case FormFieldType.Textarea:
        case "email":
        case "phone":
          fieldSchema = z.string()
          break
        case "number":
          fieldSchema = z.coerce.number()
          break
        case FormFieldType.Select:
        case FormFieldType.RadioGroup:
        case "multiselect":
          fieldSchema = z.string()
          break
        case FormFieldType.Checkbox:
        case "toggle":
          fieldSchema = z.boolean()
          break
        case "date":
        case "time":
        case "datetime":
          fieldSchema = z.date().optional()
          break
        case "file":
        case "image":
          fieldSchema = z.any().optional()
          break
        default:
          fieldSchema = z.any().optional()
      }
      if (field.required && fieldSchema) {
        if (field.type === FormFieldType.Checkbox || field.type === "toggle") {
          fieldSchema = z.boolean().refine((val) => val === true, {
            message: `${field.label} is required.`,
          })
        } else {
          fieldSchema = fieldSchema.min(1, {
            message: `${field.label} is required.`,
          })
        }
      } else if (!field.required) {
        fieldSchema = fieldSchema.optional()
      }
      schema[field.id] = fieldSchema
    })
    return z.object(schema)
  }, [formFields])

  // Generate default values based on current form fields and saved values
  const defaultValues = useMemo(() => {
    return formFields.reduce(
      (acc, field) => {
        // Use saved value if available, otherwise use default
        if (savedValues[field.id] !== undefined) {
          acc[field.id] = savedValues[field.id]
        } else if (field.type === FormFieldType.Checkbox || field.type === "toggle") {
          acc[field.id] = false
        } else if (
          field.type === FormFieldType.Select ||
          field.type === FormFieldType.RadioGroup ||
          field.type === "multiselect"
        ) {
          acc[field.id] = ""
        } else {
          acc[field.id] = ""
        }
        return acc
      },
      {} as Record<string, any>,
    )
  }, [formFields, savedValues])

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
  })

  // Reset form when fields change
  useEffect(() => {
    form.reset(defaultValues)
  }, [form, defaultValues])

  function onSubmit(values: z.infer<typeof dynamicSchema>) {
    console.log("Form submitted:", values)
    alert("Form submitted! Check console for values.")
  }

  // Save form with current values
  const handleSaveForm = () => {
    const currentValues = form.getValues()
    const formData = {
      fields: formFields,
      values: currentValues,
    }

    if (onSaveForm) {
      onSaveForm(formData)
    }

    // Also save to localStorage if formId exists
    if (formId) {
      const forms = JSON.parse(localStorage.getItem("forms") || "[]")
      const formIndex = forms.findIndex((f: any) => f.id === formId)

      if (formIndex >= 0) {
        forms[formIndex] = {
          ...forms[formIndex],
          fields: formFields,
          values: currentValues,
        }
      } else {
        forms.push({
          id: formId,
          fields: formFields,
          values: currentValues,
          name: "New Form",
          createdAt: new Date().toISOString(),
        })
      }

      localStorage.setItem("forms", JSON.stringify(forms))
      alert("Form saved successfully!")
    }
  }

  const handleFieldClick = (fieldId: string) => {
    if (onFieldClick) {
      onFieldClick(fieldId)
    }
  }

  const renderDynamicField = (fieldConfig: FormFieldType) => {
    switch (fieldConfig.type) {
      case FormFieldType.Text:
        return DynamicInput
      case FormFieldType.Textarea:
        return DynamicTextarea
      case "email":
        return DynamicEmail
      case "number":
        return DynamicNumber
      case "phone":
        return DynamicPhone
      case FormFieldType.Select:
      case "multiselect":
        return DynamicSelect
      case FormFieldType.Checkbox:
        return DynamicCheckbox
      case "toggle":
        return DynamicToggle
      case FormFieldType.RadioGroup:
        return DynamicRadioGroup
      case "date":
        return DynamicDate
      case "time":
        return DynamicTime
      case "file":
      case "image":
        return DynamicFile
      case "section":
        return DynamicSection
      case "divider":
        return DynamicDivider
      default:
        return () => (
          <div className="text-sm text-muted-foreground">Field type "{fieldConfig.type}" is not yet implemented</div>
        )
    }
  }

  return (
    <Card ref={setNodeRef} className={cn("h-full overflow-y-auto", isOver && "border-2 border-dashed border-primary")}>
      <CardHeader>
        <CardTitle className="text-lg">Form Preview</CardTitle>
        <CardDescription>This is a preview of your form. Drag fields here to add them.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px] p-4">
        {formFields.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {isOver ? "Drop your field here" : "No form fields found. Drag fields here to add them."}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {formFields.map((fieldConfig) => {
                const DynamicComponent = renderDynamicField(fieldConfig)
                return (
                  <div
                    key={fieldConfig.id}
                    className={cn(
                      "relative rounded-md border p-4 transition-all cursor-pointer hover:bg-muted/50",
                      selectedFieldId === fieldConfig.id && "ring-2 ring-primary",
                    )}
                    onClick={() => handleFieldClick(fieldConfig.id)}
                  >
                    <FormField
                      control={form.control}
                      name={fieldConfig.id}
                      render={({ field }) => <DynamicComponent fieldConfig={fieldConfig} field={field} />}
                    />
                  </div>
                )
              })}
              <div className="flex gap-4">
                <Button type="submit" className="mt-6">
                  Submit Form
                </Button>
                <Button type="button" variant="outline" className="mt-6 bg-transparent" onClick={handleSaveForm}>
                  Save Form
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
