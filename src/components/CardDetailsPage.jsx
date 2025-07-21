"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NewFormDialog from "@/components/form/NewFormDialog";

interface FormTemplate {
  id: string;
  name: string;
  createdAt: string;
  fields?: any[];
}

const LOCAL_STORAGE_KEY = "forms";

export default function FormTemplatesPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load templates from localStorage on mount
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        // Initialize with empty array if nothing exists in localStorage
        const parsedTemplates = stored ? JSON.parse(stored) : [];
        // Ensure we always have an array
        setTemplates(Array.isArray(parsedTemplates) ? parsedTemplates : []);
      } catch (error) {
        console.error("Error loading templates:", error);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleCreateForm = (formName: string, isBlank = false) => {
    const newForm: FormTemplate = {
      id: Date.now().toString(),
      name: formName,
      createdAt: new Date().toISOString(),
      fields: isBlank ? [] : undefined
    };

    // Update local storage and state
    const updatedForms = [...templates, newForm];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedForms));
    setTemplates(updatedForms);
    setShowDialog(false);

    // Navigate to form builder
    navigate(`/formbuilder/${newForm.id}`);
  };

  const handleBlankFormClick = () => {
    handleCreateForm("Untitled Form", true);
  };

  const handleNewFormClick = () => {
    setShowDialog(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Form Templates</h1>
        <Button onClick={handleNewFormClick}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Form
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Blank Form Card */}
        <Card 
          className="cursor-pointer hover:bg-muted/50" 
          onClick={handleBlankFormClick}
        >
          <CardHeader>
            <CardTitle className="text-center">Blank Form</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PlusIcon className="h-12 w-12 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Template Cards */}
        {templates.length > 0 ? (
          templates.map((template) => (
            <Card 
              key={template.id} 
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
                <p className="text-sm text-muted-foreground">
                  Fields: {template.fields?.length || 0}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No forms found. Create your first form!
          </div>
        )}
      </div>

      {/* New Form Dialog */}
      <NewFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onCreate={(name) => handleCreateForm(name, false)}
      />
    </div>
  );
}
