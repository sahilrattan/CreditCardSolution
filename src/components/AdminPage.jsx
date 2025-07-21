"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type FormField,
  type FormFieldOption,
  FormFieldType,
  type SelectField,
  type RadioGroupField,
} from "./types";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

interface FieldEditorProps {
  field: FormField | null;
  onUpdateField: (field: FormField) => void;
  onDeleteField: (id: string) => void;
}

export function FieldEditor({
  field,
  onUpdateField,
  onDeleteField,
}: FieldEditorProps) {
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  if (!field) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Field Properties</CardTitle>
          <CardDescription>
            Select a field on the form to edit its properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-100px)] items-center justify-center text-muted-foreground">
          No field selected.
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onUpdateField({ ...field, [e.target.name]: e.target.value } as FormField);
  };

  const handleSwitchChange = (checked: boolean) => {
    onUpdateField({ ...field, required: checked } as FormField);
  };

  const handleAddOption = () => {
    if (newOptionLabel.trim() && newOptionValue.trim()) {
      const newOption: FormFieldOption = {
        label: newOptionLabel.trim(),
        value: newOptionValue.trim(),
      };
      const currentOptions =
        (field as SelectField | RadioGroupField).options || [];
      onUpdateField({
        ...field,
        options: [...currentOptions, newOption],
      } as FormField);
      setNewOptionLabel("");
      setNewOptionValue("");
    }
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions =
      (field as SelectField | RadioGroupField).options || [];
    const updatedOptions = currentOptions.filter((_, i) => i !== index);
    onUpdateField({
      ...field,
      options: updatedOptions,
    } as FormField);
  };

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Edit Field: {field.label}</CardTitle>
        <CardDescription>
          Modify the properties of the selected form field.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            name="label"
            value={field.label}
            onChange={handleInputChange}
            placeholder="Enter field label"
          />
        </div>
        <div>
          <Label htmlFor="placeholder">Placeholder</Label>
          {field.type === FormFieldType.Textarea ? (
            <Textarea
              id="placeholder"
              name="placeholder"
              value={field.placeholder || ""}
              onChange={handleInputChange}
              placeholder="Enter placeholder text"
            />
          ) : (
            <Input
              id="placeholder"
              name="placeholder"
              value={field.placeholder || ""}
              onChange={handleInputChange}
              placeholder="Enter placeholder text"
            />
          )}
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="required">Required</Label>
          <Switch
            id="required"
            checked={field.required || false}
            onCheckedChange={handleSwitchChange}
          />
        </div>

        {(field.type === FormFieldType.Select ||
          field.type === FormFieldType.RadioGroup) && (
          <>
            <Separator />
            <h3 className="text-md font-semibold">Options</h3>
            <div className="space-y-2">
              {(field as SelectField | RadioGroupField).options?.map(
                (option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => {
                        const updatedOptions = [
                          ...((field as SelectField | RadioGroupField)
                            .options || []),
                        ];
                        updatedOptions[index] = {
                          ...updatedOptions[index],
                          label: e.target.value,
                        };
                        onUpdateField({
                          ...field,
                          options: updatedOptions,
                        } as FormField);
                      }}
                      placeholder="Option Label"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) => {
                        const updatedOptions = [
                          ...((field as SelectField | RadioGroupField)
                            .options || []),
                        ];
                        updatedOptions[index] = {
                          ...updatedOptions[index],
                          value: e.target.value,
                        };
                        onUpdateField({
                          ...field,
                          options: updatedOptions,
                        } as FormField);
                      }}
                      placeholder="Option Value"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOption(index)}
                    >
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )
              )}
              <div className="flex items-center gap-2">
                <Input
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  placeholder="New Option Label"
                />
                <Input
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  placeholder="New Option Value"
                />
                <Button variant="outline" size="icon" onClick={handleAddOption}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator />
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDeleteField(field.id)}
        >
          Delete Field
        </Button>
      </CardContent>
    </Card>
  );
}
