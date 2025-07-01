"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { format } from "date-fns";
import { SearchIcon, X } from "lucide-react";
// import { CalendarIcon } from "lucide-react";

import { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import CalendarInput from "@/modules/form/formInputs/CalendarInput";

export const InvoiceForm = () => {
  // const [open, setOpen] = useState(false);
  // const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  // const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [items, setItems] = useState([
    { description: "", quantity: 1, rate: 1, amount: 1 },
  ]);

  const [discountType, setDiscountType] = useState<"percent" | "amount">(
    "percent"
  );
  const [discountValue, setDiscountValue] = useState(0);

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...items];
    if (field === "quantity" || field === "rate") {
      updated[index][field] = Number(value);
      updated[index].amount = updated[index].quantity * updated[index].rate;
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount =
    discountType === "percent" ? (total * discountValue) / 100 : discountValue;
  const grandTotal = total - discountAmount;

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto  rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">New Invoice</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-medium ">
            Customer Name<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <Input placeholder="Select or add a customer" />
            <Button
              variant="outline"
              size="icon"
              className="bg-primary dark:bg-primary"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>

          <label className="text-sm font-medium">Invoice#</label>
          <Input defaultValue="INV-000001" />

          {/* <label className="text-sm font-medium">Invoice Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoiceDate
                  ? format(invoiceDate, "dd/MM/yyyy")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={invoiceDate}
                onSelect={(date) => {
                  setInvoiceDate(date);
                }}
              />
            </PopoverContent>
          </Popover> */}

          {/* calendar invioce input */}

          <label className="text-sm font-medium">Invoice Date</label>
          <CalendarInput />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">Terms</label>
          <Select defaultValue="due">
            <SelectTrigger>
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Due on Receipt</SelectItem>
              <SelectItem value="net15">Net 15</SelectItem>
              <SelectItem value="net30">Net 30</SelectItem>
              <SelectItem value="net45">Net 45</SelectItem>
              <SelectItem value="net60">Net 60</SelectItem>
            </SelectContent>
          </Select>
          {/* <label className="text-sm font-medium">Due Date</label>
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "dd/MM/yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover> */}

          {/* calendar due input */}
          <label className="text-sm font-medium">Due Date</label>
          <CalendarInput />
        </div>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold text-lg border-b h-12 pt-2 p-4  rounded border-1">
          Item Table
        </h2>
        <div className="grid grid-cols-6 gap-2 mt-4 text-sm font-medium">
          <span className="col-span-2">Item Details</span>
          <span>Quantity</span>
          <span>Rate</span>
          <span>Amount</span>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-6 gap-2 mt-2 items-center">
            <Input
              placeholder="Type or click to select an item"
              className="col-span-2"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
            />
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
            />
            <Input
              type="number"
              value={item.rate}
              onChange={(e) => handleItemChange(index, "rate", e.target.value)}
            />
            <span>{item.amount.toFixed(2)}</span>
            <AlertDialog>
              <AlertDialogTrigger>
                <X className="text-red-500 cursor-pointer" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the row.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRemoveRow(index)}
                    className="bg-red-500 cursor-pointer hover:bg-red-400"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="bg-primary dark:bg-primary  hover:bg-green-300 cursor-pointer"
            onClick={handleAddRow}
          >
            <IoIosAddCircleOutline />
            Add New Row
          </Button>
          <Button variant="secondary" className="cursor-pointer">
            Add Items in Bulk
          </Button>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <div className="space-y-2 w-full max-w-md">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Discount</label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="w-24"
            />
            <Select
              value={discountType}
              onValueChange={(val) =>
                setDiscountType(val as "percent" | "amount")
              }
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="amount">₹</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between text-sm">
            <span>Sub Total</span>
            <span>
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Discount</span>
            <span className="text-red-600">
              - ₹
              {discountAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total (₹)</span>
            <span>
              ₹
              {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium ">Customer Notes</label>
        <Textarea defaultValue="Thanks for your business." />
        <p className="text-gray-500 text-sm ml-2">
          Will be displayed on the invoice
        </p>
      </div>
    </div>
  );
};

export default InvoiceForm;
