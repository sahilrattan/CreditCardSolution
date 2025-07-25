"use client"
import type { ControllerRenderProps } from "react-hook-form"
import type React from "react"

import type { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon } from "lucide-react"
import { format } from "date-fns"
import type { FormField, FormFieldOption } from "./types"
import { useState, useRef } from "react"

interface DynamicFieldProps {
  fieldConfig: FormField
  field: ControllerRenderProps<z.ZodObject<any>, any>
}

export function DynamicInput({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem>
      <FormLabel>{fieldConfig.label}</FormLabel>
      <FormControl>
        <Input
          placeholder={fieldConfig.placeholder || ""}
          {...field}
          type={fieldConfig.type === "number" ? "number" : "text"}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicTextarea({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem>
      <FormLabel>{fieldConfig.label}</FormLabel>
      <FormControl>
        <Textarea placeholder={fieldConfig.placeholder || ""} {...field} rows={3} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicSelect({ fieldConfig, field }: DynamicFieldProps) {
  const selectFieldConfig = fieldConfig as FormField & {
    options: FormFieldOption[]
  }
  return (
    <FormItem>
      <FormLabel>{selectFieldConfig.label}</FormLabel>
      <Select onValueChange={field.onChange} value={field.value || ""}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={selectFieldConfig.placeholder || "Select an option"} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {selectFieldConfig.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicCheckbox({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <FormControl>
        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>{fieldConfig.label}</FormLabel>
        {fieldConfig.placeholder && <FormDescription>{fieldConfig.placeholder}</FormDescription>}
      </div>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicRadioGroup({ fieldConfig, field }: DynamicFieldProps) {
  const radioGroupFieldConfig = fieldConfig as FormField & {
    options: FormFieldOption[]
  }
  return (
    <FormItem className="space-y-3">
      <FormLabel>{radioGroupFieldConfig.label}</FormLabel>
      <FormControl>
        <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex flex-col space-y-1">
          {radioGroupFieldConfig.options?.map((option) => (
            <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <RadioGroupItem value={option.value} />
              </FormControl>
              <FormLabel className="font-normal">{option.label}</FormLabel>
            </FormItem>
          ))}
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicEmail({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem>
      <FormLabel>{fieldConfig.label}</FormLabel>
      <FormControl>
        <Input placeholder={fieldConfig.placeholder || ""} {...field} type="email" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicNumber({ fieldConfig, field }: DynamicFieldProps) {
  const numberFieldConfig = fieldConfig as FormField & {
    min?: number
    max?: number
    step?: number
  }
  return (
    <FormItem>
      <FormLabel>{numberFieldConfig.label}</FormLabel>
      <FormControl>
        <Input
          placeholder={numberFieldConfig.placeholder || ""}
          {...field}
          type="number"
          min={numberFieldConfig.min}
          max={numberFieldConfig.max}
          step={numberFieldConfig.step}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicPhone({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem>
      <FormLabel>{fieldConfig.label}</FormLabel>
      <FormControl>
        <Input placeholder={fieldConfig.placeholder || ""} {...field} type="tel" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicDate({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem>
      <FormLabel>{fieldConfig.label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={field.value ? new Date(field.value) : undefined}
            onSelect={field.onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicTime({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem>
      <FormLabel>{fieldConfig.label}</FormLabel>
      <FormControl>
        <div className="flex items-center">
          <Input placeholder={fieldConfig.placeholder || ""} {...field} type="time" />
          <ClockIcon className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicFile({ fieldConfig, field }: DynamicFieldProps) {
  const fileFieldConfig = fieldConfig as FormField & {
    accept?: string
    multiple?: boolean
  }
  const [fileInfo, setFileInfo] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileNames = Array.from(files)
        .map((file) => file.name)
        .join(", ")
      setFileInfo(fileNames)

      // Convert files to base64 for storage
      const filePromises = Array.from(files).map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: e.target?.result,
            })
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(filePromises).then((fileData) => {
        field.onChange(fileFieldConfig.multiple ? fileData : fileData[0])
      })
    } else {
      setFileInfo("")
      field.onChange(null)
    }
  }

  return (
    <FormItem>
      <FormLabel>{fileFieldConfig.label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept={fileFieldConfig.accept}
            multiple={fileFieldConfig.multiple}
            className="cursor-pointer"
          />
          {fileInfo && <p className="text-sm text-muted-foreground">Selected: {fileInfo}</p>}
          {field.value && <p className="text-sm text-green-600">✓ File(s) saved with form</p>}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function DynamicToggle({ fieldConfig, field }: DynamicFieldProps) {
  return (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel>{fieldConfig.label}</FormLabel>
        {fieldConfig.placeholder && <FormDescription>{fieldConfig.placeholder}</FormDescription>}
      </div>
      <FormControl>
        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
      </FormControl>
    </FormItem>
  )
}

export function DynamicSection({ fieldConfig }: DynamicFieldProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">{fieldConfig.label}</h3>
      {fieldConfig.placeholder && <p className="text-sm text-muted-foreground">{fieldConfig.placeholder}</p>}
    </div>
  )
}

export function DynamicDivider() {
  return <div className="border-t my-4" />
}
