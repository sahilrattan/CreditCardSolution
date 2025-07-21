"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldType, type FormFieldTypeEnum } from "./types";
import {
  FileInputIcon,
  TextIcon,
  CheckIcon,
  ListIcon,
  RadioIcon,
  CalendarIcon,
  ToggleRightIcon,
  ImageIcon,
  HashIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  ListOrderedIcon,
} from "lucide-react";

interface FieldPaletteItemProps {
  type: FormFieldTypeEnum;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const fieldCategories = [
  "Basic Inputs",
  "Selection Controls",
  "Date & Time",
  "Media",
  "Advanced",
];

const fieldPaletteItems: FieldPaletteItemProps[] = [
  // Basic Inputs
  {
    type: FormFieldType.Text,
    label: "Text Input",
    icon: <FileInputIcon className="h-4 w-4" />,
    category: "Basic Inputs",
  },
  {
    type: FormFieldType.Textarea,
    label: "Textarea",
    icon: <TextIcon className="h-4 w-4" />,
    category: "Basic Inputs",
  },
  {
    type: "email",
    label: "Email Input",
    icon: <MailIcon className="h-4 w-4" />,
    category: "Basic Inputs",
  },
  {
    type: "number",
    label: "Number Input",
    icon: <HashIcon className="h-4 w-4" />,
    category: "Basic Inputs",
  },
  {
    type: "phone",
    label: "Phone Input",
    icon: <PhoneIcon className="h-4 w-4" />,
    category: "Basic Inputs",
  },

  // Selection Controls
  {
    type: FormFieldType.Select,
    label: "Dropdown",
    icon: <ListIcon className="h-4 w-4" />,
    category: "Selection Controls",
  },
  {
    type: FormFieldType.Checkbox,
    label: "Checkbox",
    icon: <CheckIcon className="h-4 w-4" />,
    category: "Selection Controls",
  },
  {
    type: FormFieldType.RadioGroup,
    label: "Radio Group",
    icon: <RadioIcon className="h-4 w-4" />,
    category: "Selection Controls",
  },
  {
    type: "toggle",
    label: "Toggle Switch",
    icon: <ToggleRightIcon className="h-4 w-4" />,
    category: "Selection Controls",
  },
  {
    type: "multiselect",
    label: "Multi-Select",
    icon: <ListOrderedIcon className="h-4 w-4" />,
    category: "Selection Controls",
  },

  // Date & Time
  {
    type: "date",
    label: "Date Picker",
    icon: <CalendarIcon className="h-4 w-4" />,
    category: "Date & Time",
  },
  {
    type: "time",
    label: "Time Picker",
    icon: <ClockIcon className="h-4 w-4" />,
    category: "Date & Time",
  },
  {
    type: "datetime",
    label: "Date & Time",
    icon: <CalendarIcon className="h-4 w-4" />,
    category: "Date & Time",
  },

  // Media
  {
    type: "file",
    label: "File Upload",
    icon: <FileInputIcon className="h-4 w-4" />,
    category: "Media",
  },
  {
    type: "image",
    label: "Image Upload",
    icon: <ImageIcon className="h-4 w-4" />,
    category: "Media",
  },

  // Advanced
  {
    type: "section",
    label: "Section Header",
    icon: <TextIcon className="h-4 w-4" />,
    category: "Advanced",
  },
  {
    type: "divider",
    label: "Divider",
    icon: <div className="h-4 w-4 border-t-2 border-gray-400" />,
    category: "Advanced",
  },
];

export function FieldPalette() {
  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Form Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fieldCategories.map((category) => {
          const categoryFields = fieldPaletteItems.filter(
            (field) => field.category === category
          );
          
          if (categoryFields.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {categoryFields.map((item) => (
                  <DraggableFieldItem
                    key={item.type}
                    type={item.type}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function DraggableFieldItem({ type, label, icon }: Omit<FieldPaletteItemProps, 'category'>) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${type}`,
    data: { type, label },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex cursor-grab items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <span className="flex-shrink-0 text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
