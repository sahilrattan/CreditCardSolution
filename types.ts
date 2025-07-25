export const FormFieldType = {
  Text: "text",
  Textarea: "textarea",
  Select: "select",
  Checkbox: "checkbox",
  RadioGroup: "radio",
  Email: "email",
  Number: "number",
  Phone: "phone",
  Date: "date",
  Time: "time",
  DateTime: "datetime",
  File: "file",
  Image: "image",
  Toggle: "toggle",
  MultiSelect: "multiselect",
  Section: "section",
  Divider: "divider",
} as const;

export type FormFieldTypeEnum =
  (typeof FormFieldType)[keyof typeof FormFieldType];

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface BaseFormField {
  id: string;
  type: FormFieldTypeEnum;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}

export interface TextField extends BaseFormField {
  type: typeof FormFieldType.Text;
}

export interface TextareaField extends BaseFormField {
  type: typeof FormFieldType.Textarea;
  rows?: number;
}

export interface SelectField extends BaseFormField {
  type: typeof FormFieldType.Select;
  options: FormFieldOption[];
}

export interface CheckboxField extends BaseFormField {
  type: typeof FormFieldType.Checkbox;
}

export interface RadioGroupField extends BaseFormField {
  type: typeof FormFieldType.RadioGroup;
  options: FormFieldOption[];
}

export interface EmailField extends BaseFormField {
  type: typeof FormFieldType.Email;
}

export interface NumberField extends BaseFormField {
  type: typeof FormFieldType.Number;
  min?: number;
  max?: number;
  step?: number;
}

export interface PhoneField extends BaseFormField {
  type: typeof FormFieldType.Phone;
}

export interface DateField extends BaseFormField {
  type: typeof FormFieldType.Date;
}

export interface TimeField extends BaseFormField {
  type: typeof FormFieldType.Time;
}

export interface DateTimeField extends BaseFormField {
  type: typeof FormFieldType.DateTime;
}

export interface FileField extends BaseFormField {
  type: typeof FormFieldType.File;
  accept?: string;
  multiple?: boolean;
}

export interface ImageField extends BaseFormField {
  type: typeof FormFieldType.Image;
}

export interface ToggleField extends BaseFormField {
  type: typeof FormFieldType.Toggle;
}

export interface MultiSelectField extends BaseFormField {
  type: typeof FormFieldType.MultiSelect;
  options: FormFieldOption[];
}

export interface SectionField extends BaseFormField {
  type: typeof FormFieldType.Section;
}

export interface DividerField
  extends Omit<BaseFormField, "label" | "placeholder"> {
  type: typeof FormFieldType.Divider;
}

export type FormField =
  | TextField
  | TextareaField
  | SelectField
  | CheckboxField
  | RadioGroupField
  | EmailField
  | NumberField
  | PhoneField
  | DateField
  | TimeField
  | DateTimeField
  | FileField
  | ImageField
  | ToggleField
  | MultiSelectField
  | SectionField
  | DividerField;
