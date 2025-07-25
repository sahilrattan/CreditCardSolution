"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { FieldPalette } from "@/components/form/fields-palette";
import { FormPreview } from "@/components/form/FormPreviewPage";
import { FieldEditor } from "@/components/form/field-editor";
import { FormFieldType, type FormField } from "./types";
import { toast } from "sonner";

// Local storage helpers
const saveFormToLocal = (formData: any) => {
  try {
    const existingForms = JSON.parse(localStorage.getItem("forms") || "[]");
    const existingIndex = existingForms.findIndex(
      (f: any) => f.id === formData.id
    );

    if (existingIndex >= 0) {
      existingForms[existingIndex] = formData;
    } else {
      existingForms.push(formData);
    }

    localStorage.setItem("forms", JSON.stringify(existingForms));
    return true;
  } catch (error) {
    console.error("Error saving form:", error);
    return false;
  }
};

const loadFormFromLocal = (id: string) => {
  try {
    const forms = JSON.parse(localStorage.getItem("forms") || "[]");
    return forms.find((f: any) => f.id === id) || null;
  } catch (error) {
    console.error("Error loading form:", error);
    return null;
  }
};

// Mobile detection hook
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMobile();

  const [formId, setFormId] = useState<string>(
    id === "new" ? uuidv4() : id || uuidv4()
  );
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [formName, setFormName] = useState("Untitled Form");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const loadForm = async () => {
      try {
        if (id === "new") {
          setFormId(uuidv4());
          setFormName("Untitled Form");
          setFormFields([]);
          setSelectedFieldId(null);
          setIsInitialized(true);
          return;
        }

        if (id) {
          const formData = await loadFormFromLocal(id);
          if (formData) {
            setFormId(formData.id);
            setFormName(formData.name || "Untitled Form");
            setFormFields(formData.fields || []);
            setIsInitialized(true);
          } else {
            toast.error("Form not found - creating new one");
            navigate("/formbuilder/new", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error loading form:", error);
        toast.error("Failed to load form");
        navigate("/forms");
      }
    };

    if (!isInitialized) {
      loadForm();
    }
  }, [id, navigate, isInitialized]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id === "form-drop-area") {
      const fieldType = active.data.current?.type as FormFieldType;
      const fieldLabel = active.data.current?.label as string;

      const newField: FormField = {
        id: uuidv4(),
        type: fieldType,
        label: fieldLabel,
        placeholder: `Enter ${fieldLabel.toLowerCase()}`,
        required: false,
      };

      if (
        [FormFieldType.Select, FormFieldType.RadioGroup].includes(fieldType)
      ) {
        newField.options = [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ];
      }

      setFormFields((prev) => [...prev, newField]);
      setSelectedFieldId(newField.id);
    }
  };

  const handleUpdateField = (updated: FormField) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === updated.id ? updated : field))
    );
  };

  const handleDeleteField = (deleteId: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== deleteId));
    if (selectedFieldId === deleteId) {
      setSelectedFieldId(null);
    }
  };

  const handleSaveForm = async () => {
    if (formName.trim() === "") {
      toast.error("Form name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: formId,
        name: formName.trim(),
        fields: formFields,
        updatedAt: new Date().toISOString(),
      };

      const success = saveFormToLocal(payload);
      if (success) {
        toast.success("Form saved successfully");
        // Navigate to /event after successful save
        navigate("/event");
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    } finally {
      setIsSaving(false);
    }
  };

  // const handlePreview = async () => {
  //   if (formFields.length === 0) {
  //     toast.error("Add at least one field to preview");

  //     return;
  //   }

  //   await handleSaveForm();
  //   navigate(`/preview/${formId}`);
  // };

  const selectedField = formFields.find((f) => f.id === selectedFieldId);
  const FieldEditorComponent = selectedField ? (
    <FieldEditor
      field={selectedField}
      onUpdateField={handleUpdateField}
      onDeleteField={handleDeleteField}
    />
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Select a field to edit
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/forms")}>
            Back
          </Button>
          <Label htmlFor="formName">Form Name:</Label>
          <Input
            id="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-48"
            placeholder="Enter form name"
          />
        </div>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            onClick={handlePreview}
            disabled={formFields.length === 0}
          >
            Preview
          </Button> */}
          <Button onClick={handleSaveForm} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Left Sidebar */}
          <aside className="w-full md:w-64 p-4 border-b md:border-r md:border-b-0 shrink-0 overflow-y-auto">
            <FieldPalette />
          </aside>

          {/* Center: Form Preview */}
          <main className="flex-1 p-4 overflow-y-auto">
            <FormPreview
              formId={formId}
              formFields={formFields}
              onFieldClick={setSelectedFieldId}
              selectedFieldId={selectedFieldId}
            />
          </main>

          {/* Right Sidebar: Field Editor */}
          {isMobile ? (
            <Drawer
              open={!!selectedFieldId}
              onOpenChange={(open) => !open && setSelectedFieldId(null)}
            >
              <DrawerContent className="h-[80vh]">
                {FieldEditorComponent}
              </DrawerContent>
            </Drawer>
          ) : (
            <aside className="w-full md:w-80 p-4 border-t md:border-l md:border-t-0 shrink-0 overflow-y-auto">
              {FieldEditorComponent}
            </aside>
          )}
        </DndContext>
      </div>
    </div>
  );
}
