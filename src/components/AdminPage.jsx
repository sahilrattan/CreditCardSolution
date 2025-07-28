"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Hash,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LocationCombobox } from "./Location";
import { companySchema, type CompanyFormData } from "./Validation";
import type { Company, Country, State } from "./types";

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSave: (data: CompanyFormData) => void;
}

const mockCountries: Country[] = [
  { id: "US", name: "United States" },
  { id: "CA", name: "Canada" },
  { id: "GB", name: "United Kingdom" },
  { id: "AU", name: "Australia" },
  { id: "DE", name: "Germany" },
];

const mockStates: State[] = [
  { id: "NY", name: "New York", countryId: "US" },
  { id: "CA", name: "California", countryId: "US" },
  { id: "TX", name: "Texas", countryId: "US" },
  { id: "ON", name: "Ontario", countryId: "CA" },
  { id: "QC", name: "Quebec", countryId: "CA" },
  { id: "ENG", name: "England", countryId: "GB" },
  { id: "NSW", name: "New South Wales", countryId: "AU" },
  { id: "BY", name: "Bavaria", countryId: "DE" },
];

export function CompanyFormDialog({
  open,
  onOpenChange,
  company,
  onSave,
}: CompanyFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CompanyFormData>({
    resolver: yupResolver(companySchema),
    mode: "onChange",
  });

  const selectedCountryId = watch("countryId");
  const filteredStates = mockStates.filter(
    (state) => state.countryId === selectedCountryId
  );

  useEffect(() => {
    if (company) {
      reset(company);
    } else {
      reset({
        companySiteId: "",
        companyId: "",
        name: "",
        description: "",
        email: "",
        phone: "",
        website: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        stateId: "",
        countryId: "",
        zipCode: "",
      });
    }
  }, [company, reset]);

 // Update in onSubmit Function
const onSubmit = async (data: CompanyFormData) => {
  onSave(data); // Save company logic (existing)
  onOpenChange(false);

  // Call Backend API to send WhatsApp message
  if (data.phone && data.name) {
    const payload = {
      phone: data.phone,
      name: data.name,
      email: data.email,
      siteId: data.companySiteId,
      address: data.addressLine1,
    };

    try {
      const response = await fetch("http://localhost:3001/api/send-whatsapp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

      const result = await response.json();
      console.log("WhatsApp API Response:", result);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  }
};


  // const sendWhatsAppMessage = async (
  //   phoneNumber: string,
  //   companyName: string
  // ) => {
  //   const accessToken =
  //     "EAAecAjDNyVQBPOmLqJjYjc4RXTQ1JEKaDsMbwsftRQkG3553ta9oTYHKZBObbZCUA13ZAXS36LdNXGKP2ZCEpR9QWZANlHbHyDF6j3ryjjSFdB7avromEgtjqZAmzqdQ0ZB9LOvPB7xZB4MAuE2yKN8zZA5ienTwHuCtIcSZCATQVgBX5TuZBLXxcx2nAGqZCeNA69PfZAx9dN6rqeZCGtDKUjZCqh1iOS7EIYpajG3ZAhX5YFKYPgZDZD";
  //   const phoneNumberId = "705049146032161";

  //   const payload = {
  //     messaging_product: "whatsapp",
  //     to: phoneNumber,
  //     type: "template",
  //     template: {
  //       name: "trigbit",
  //       language: {
  //         code: "en",
  //       },
  //       components: [
  //         {
  //           type: "body",
  //           parameters: [
  //             { type: "text", text: "Sir/Madam" },
  //             { type: "text", text: companyName },
  //           ],
  //         },
  //       ],
  //     },
  //   };

  //   try {
  //     const response = await fetch(
  //       `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );
  //     const result = await response.json();
  //     console.log("WhatsApp API Response:", result);
  //   } catch (error) {
  //     console.error("Error sending WhatsApp message:", error);
  //   }
  // };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-50">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            {company ? "Edit Company" : "Add New Company"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {company
              ? "Update the details for this company."
              : "Fill in the details below to add a new company."}
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label
                htmlFor="companySiteId"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Company Site ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companySiteId"
                placeholder="Enter company site ID..."
                {...register("companySiteId")}
                className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {errors.companySiteId && (
                <p className="text-red-500 text-sm">
                  {errors.companySiteId.message}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="companyId"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Company ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyId"
                placeholder="Enter company ID..."
                {...register("companyId")}
                className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {errors.companyId && (
                <p className="text-red-500 text-sm">
                  {errors.companyId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="name"
              className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter company name..."
              {...register("name")}
              className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="description"
              className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter company description..."
              {...register("description")}
              className="min-h-[80px] rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label
                htmlFor="email"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email..."
                {...register("email")}
                className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="phone"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="Enter phone number..."
                {...register("phone")}
                className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="website"
              className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Website <span className="text-red-500">*</span>
            </Label>
            <Input
              id="website"
              placeholder="Enter website URL..."
              {...register("website")}
              className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            {errors.website && (
              <p className="text-red-500 text-sm">{errors.website.message}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="addressLine1"
              className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Address Line 1
            </Label>
            <Input
              id="addressLine1"
              placeholder="Enter address line 1..."
              {...register("addressLine1")}
              className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            {errors.addressLine1 && (
              <p className="text-red-500 text-sm">
                {errors.addressLine1.message}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <Label
              htmlFor="addressLine2"
              className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Address Line 2 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="addressLine2"
              placeholder="Enter address line 2..."
              {...register("addressLine2")}
              className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            {errors.addressLine2 && (
              <p className="text-red-500 text-sm">
                {errors.addressLine2.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label
                htmlFor="city"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Enter city..."
                {...register("city")}
                className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city.message}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="countryId"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Country <span className="text-red-500">*</span>
              </Label>
              <LocationCombobox
                value={watch("countryId")}
                onChange={(val) => {
                  setValue("countryId", val, { shouldValidate: true });
                  setValue("stateId", ""); // Reset state when country changes
                }}
                items={mockCountries}
                placeholder="Select country..."
                searchPlaceholder="Search countries..."
                icon={Globe}
              />
              {errors.countryId && (
                <p className="text-red-500 text-sm">
                  {errors.countryId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label
                htmlFor="stateId"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                State <span className="text-red-500">*</span>
              </Label>
              <LocationCombobox
                value={watch("stateId")}
                onChange={(val) =>
                  setValue("stateId", val, { shouldValidate: true })
                }
                items={filteredStates}
                placeholder="Select state..."
                searchPlaceholder="Search states..."
                icon={MapPin}
              />
              {errors.stateId && (
                <p className="text-red-500 text-sm">{errors.stateId.message}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="zipCode"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Zip Code
              </Label>
              <Input
                id="zipCode"
                placeholder="Enter zip code..."
                {...register("zipCode")}
                className="h-11 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="lg"
              className="bg-transparent border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-200"
            >
              {company ? "Update Company" : "Add Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
