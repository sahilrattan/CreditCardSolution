"use client";

import { useState, useEffect } from "react";
import { TicketService } from "@/api/services/TicketService";
import { TicketPriorityService } from "@/api/services/TicketPriorityService";
import { TicketStatusService } from "@/api/services/TicketStatusService";
import { TicketTypeService } from "@/api/services/TicketTypeService";
import { ContractService } from "@/api/services/ContractService";
import { ContractMediaUnitService } from "@/api/services/ContractMediaUnitService";
import { UserService } from "@/api/services/UserService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpdateTicketStatusCommand } from "@/api/models/UpdateTicketStatusCommand";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Filter,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Pencil,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Ticket } from "./types/ticket";
import { TicketForm } from "@/components/ticket/TicketForm";
import TicketDetail from "@/components/ticket/TicketDetail";
import { toast } from "sonner";
import type { CreateDocumentUrlCommand } from "@/api/models/CreateDocumentUrlCommand";
import { DocumentsService } from "@/api/services/DocumentsService";
import type { UpdateTicketCommand } from "@/api/models/UpdateTicketCommand";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import type { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react"; // Import a spinner icon for the loader

const API_VERSION = "1";

interface UserLookup {
  id: string;
  email: string;
}

export default function TicketManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingDialogTitle, setIsEditingDialogTitle] = useState(false);
  const [editedDialogTitle, setEditedDialogTitle] = useState("");
  const [selectedTicketDocuments, setSelectedTicketDocuments] = useState<
    Array<{ name: string; url: string; type?: string; size?: number }>
  >([]);
  const [ticketPrioritiesLookup, setTicketPrioritiesLookup] = useState<
    Array<{ ticketPriorityId: string; name: string }>
  >([]);
  const [ticketStatusesLookup, setTicketStatusesLookup] = useState<
    Array<{ ticketStatusId: string; name: string }>
  >([]);
  const [ticketTypesLookup, setTicketTypesLookup] = useState<
    Array<{ ticketTypeId: string; name: string }>
  >([]);
  const [contractsLookup, setContractsLookup] = useState<
    Array<{ contractId: string; name: string }>
  >([]);
  const [mediaUnitsLookup, setMediaUnitsLookup] = useState<
    Array<{ contractMediaUnitId: string; name: string }>
  >([]);
  const [usersLookup, setUsersLookup] = useState<UserLookup[]>([]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Step 1: Fetch the logged-in user's details
      const loggedInUserRes = await UserService.getLoggedInUser(API_VERSION);
      const loggedInUser = loggedInUserRes.data;

      if (!loggedInUser || !loggedInUser.id) {
        throw new Error("Failed to fetch logged-in user ID");
      }

      const userId = loggedInUser.id;

      console.log("Fetching roles for user ID:", userId);

      // Step 2: Fetch user roles using getUserRoles API
      const rolesRes = await UserService.getUserRoles(API_VERSION, userId);
      const assignedRoles = rolesRes?.data || [];
      const isOperationHead = assignedRoles.includes("OperationHead");

      console.log("Assigned Roles:", assignedRoles);
      console.log("Is Operation Head?", isOperationHead);

      // Step 3: Fetch tickets based on role
      let ticketsRes;
      if (isOperationHead) {
        // Fetch all tickets if OperationHead
        ticketsRes = await TicketService.getApiVTicket(API_VERSION);
      } else {
        // Fetch tickets assigned to the current user otherwise
        ticketsRes = await TicketService.getTicketListByUser(API_VERSION, {
          userId: userId,
        });
        if (!ticketsRes.data || ticketsRes.data.length === 0) {
          toast.error("No tickets found for the user.");
          setTickets([]);
          return;
        }
      }

      setTickets(
        (ticketsRes.data || []).map((t) => ({ ...t, id: t.ticketId }))
      );

      // Step 4: Fetch lookup data in parallel
      const [prioritiesRes, statusesRes, typesRes, usersRes] =
        await Promise.all([
          TicketPriorityService.getApiVTicketPriority(API_VERSION),
          TicketStatusService.getApiVTicketStatus(API_VERSION),
          TicketTypeService.getApiVTicketType(API_VERSION),
          UserService.getApiVUser(API_VERSION),
        ]);

      setTicketPrioritiesLookup(prioritiesRes.data || []);
      setTicketStatusesLookup(statusesRes.data || []);
      setTicketTypesLookup(typesRes.data || []);
      setUsersLookup(
        (usersRes.data || []).map((user: any) => ({
          id: user.id,
          email: user.email,
        }))
      );

      // Step 5: Fetch contracts with error handling
      try {
        const contractsRes = await ContractService.getApiVContract(API_VERSION);
        const mappedContracts = (contractsRes.data || []).map(
          (contract: any) => ({
            contractId: contract.contractID,
            name: contract.name,
          })
        );
        setContractsLookup(mappedContracts);
      } catch (contractError) {
        console.error("Failed to fetch contracts:", contractError);
        toast.error(
          "Failed to fetch contracts. Contract dropdown will be empty."
        );
        setContractsLookup([]);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error("Failed to fetch initial data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMediaUnits = async (contractId?: string) => {
    if (!contractId) {
      setMediaUnitsLookup([]);
      return;
    }
    try {
      const mediaRes = await ContractMediaUnitService.getApiVContractMediaUnit(
        API_VERSION,
        contractId
      );
      const mappedMediaUnits = (mediaRes.data || []).map((mediaUnit: any) => ({
        contractMediaUnitId: mediaUnit.contractMediaUnitID || mediaUnit.id,
        name:
          mediaUnit.name ||
          mediaUnit.mediaUnitName ||
          `Media Unit ${mediaUnit.id}`,
      }));
      setMediaUnitsLookup(mappedMediaUnits);
    } catch (error) {
      console.error("Failed to fetch media units:", error);
      toast.error("Failed to fetch media units.");
      setMediaUnitsLookup([]);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setEditedDialogTitle(selectedTicket.title || "");
    }
  }, [selectedTicket]);

  useEffect(() => {
    const fetchDocumentsForSelectedTicket = async () => {
      if (selectedTicket?.id) {
        try {
          const response = await DocumentsService.getApiVDocuments(
            API_VERSION,
            "Ticket",
            selectedTicket.id
          );
          const mappedDocuments = (response.data || []).map((doc) => ({
            name: doc.name || "Untitled Document",
            url: doc.blobUrl || doc.url || "#",
            type: doc.contentType || "",
            size: 0,
          }));
          setSelectedTicketDocuments(mappedDocuments);
        } catch (error) {
          console.error(
            "Failed to fetch documents for selected ticket:",
            error
          );
          toast.error("Failed to load documents for this ticket.");
          setSelectedTicketDocuments([]);
        }
      } else {
        setSelectedTicketDocuments([]);
      }
    };

    fetchDocumentsForSelectedTicket();
  }, [selectedTicket]);

  const getPriorityName = (priorityId: string) => {
    const priority = ticketPrioritiesLookup.find(
      (p) => p.ticketPriorityId === priorityId
    );
    return priority?.name || priorityId;
  };

  const getStatusName = (statusId: string) => {
    const status = ticketStatusesLookup.find(
      (s) => s.ticketStatusId === statusId
    );
    return status?.name || statusId;
  };

  const getTypeName = (typeId: string) => {
    const type = ticketTypesLookup.find((t) => t.ticketTypeId === typeId);
    return type?.name || typeId;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusName = getStatusName(ticket.ticketStatusId).toLowerCase();
    const matchesStatus = statusFilter === "all" || statusName === statusFilter;

    const priorityName = getPriorityName(ticket.ticketPriorityId).toLowerCase();
    const matchesPriority =
      priorityFilter === "all" || priorityName === priorityFilter;

    let matchesDate = true;
    if (dateRange?.from && dateRange?.to && ticket.createdDate) {
      const created = new Date(ticket.createdDate);
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999); // Include end of day
      matchesDate = created >= from && created <= to;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  const handleClearDateRange = () => {
    setDateRange(undefined);
  };

  const handleCreateTicket = async (
    ticketData: Partial<Ticket> & {
      contractId?: string;
      mediaUnitIds?: string[];
      documents?: File[];
      requestedBy?: string;
    }
  ) => {
    setIsSubmitting(true);
    try {
      const priorityLookup = ticketPrioritiesLookup.find(
        (p) =>
          p.name.toLowerCase() === ticketData.ticketPriorityId?.toLowerCase()
      );
      const typeLookup = ticketTypesLookup.find(
        (t) => t.name.toLowerCase() === ticketData.category?.toLowerCase()
      );
      const statusLookup = ticketStatusesLookup.find(
        (s) => s.ticketStatusId === ticketData.ticketStatusId
      );

      if (!priorityLookup || !typeLookup || !statusLookup) {
        toast.error(
          "Could not find matching priority, type, or status ID for creation."
        );
        setIsSubmitting(false);
        return { id: "", ticketNo: "" };
      }

      const ticketResponse = await TicketService.postApiVTicket(API_VERSION, {
        title: ticketData.title!,
        description: ticketData.description!,
        ticketPriorityId: priorityLookup.ticketPriorityId,
        ticketTypeId: typeLookup.ticketTypeId,
        assignee: ticketData.assignee!,
        ticketStatusID: statusLookup.ticketStatusId,
        ticketNo: ticketData.ticketNo!,
        customerName: ticketData.customer?.name!,
        customerEmail: ticketData.customer?.email!,
        customerPhone: ticketData.customer?.phone!,
        requestedBy: ticketData.requestedBy!,
        createdAt: new Date().toISOString(),
        notes: ticketData.notes || "",
      });

      if (ticketData.contractId) {
        try {
          console.log("Contract ID to be linked:", ticketData.contractId);
        } catch (error) {
          console.error("Failed to link contract:", error);
        }
      }

      if (ticketData.mediaUnitIds && ticketData.mediaUnitIds.length > 0) {
        try {
          console.log("Media Unit IDs to be linked:", ticketData.mediaUnitIds);
        } catch (error) {
          console.error("Failed to link media units:", error);
        }
      }

      if (ticketData.documents && ticketData.documents.length > 0) {
        try {
          const uploadPromises = ticketData.documents.map(async (file) => {
            const fileContent = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(",")[1]);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            const extension = `.${
              file.name.split(".").pop() || ""
            }`.toLowerCase();

            const documentData: CreateDocumentUrlCommand = {
              name: file.name,
              description: `Attachment for ticket ${ticketResponse.data.ticketNo}`,
              content: fileContent,
              contentType: file.type || getMimeType(file.name),
              documentFileName: file.name,
              extension: extension,
              category: "Ticket",
              categoryId: ticketResponse.data.ticketId,
            };

            return DocumentsService.postApiVDocuments(
              API_VERSION,
              documentData
            );
          });

          await Promise.all(uploadPromises);
          toast.success("Documents uploaded successfully");
        } catch (error) {
          console.error("Failed to upload documents:", error);
          toast.error("Failed to upload some documents");
        }
      }

      setTickets((prev) => [
        ...prev,
        { ...ticketResponse.data, id: ticketResponse.data.ticketId },
      ]);
      setIsCreateDialogOpen(false);
      toast.success("Ticket created successfully");

      return {
        id: ticketResponse.data.ticketId,
        ticketNo: ticketResponse.data.ticketNo,
      };
    } catch (error) {
      console.error("Failed to create ticket:", error);
      toast.error("Failed to create ticket");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMimeType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "xls":
        return "application/vnd.ms-excel";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "ppt":
        return "application/vnd.ms-powerpoint";
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  };

  const handleUpdateTicketDetails = async (
    ticketIdFromComponent: string,
    newStatusId: string,
    newAssigneeEmail: string | null,
    newPriorityId: string,
    newDescription?: string,
    newContractId?: string,
    newMediaUnitIds?: string[]
  ) => {
    try {
      const currentTicketResponse = await TicketService.getTicketById(
        ticketIdFromComponent,
        API_VERSION
      );
      const currentTicket = currentTicketResponse.data;
      if (!currentTicket) {
        toast.error("Ticket not found for update.");
        return;
      }

      // Check if status is being updated
      if (newStatusId !== currentTicket.ticketStatusId) {
        // Call putApiVTicketStatus for status update
        const statusUpdateData: UpdateTicketStatusCommand = {
          ticketId: ticketIdFromComponent,
          ticketStatusId: newStatusId,
          name: getStatusName(newStatusId),
        };
        await TicketService.updateStatus(API_VERSION, statusUpdateData);
        toast.success("Ticket status updated successfully");
      }

      // Update other ticket details using putApiVTicket (existing logic)
      const updatedTicketData: UpdateTicketCommand = {
        ...currentTicket,
        id: currentTicket.ticketId,
        ticketId: currentTicket.ticketId,
        ticketStatusID: newStatusId,
        ticketPriorityId: newPriorityId,
        assignedTo: newAssigneeEmail,
        assignedDate: newAssigneeEmail ? new Date().toISOString() : null,
        lastModifiedDate: new Date().toISOString(),
        notes: currentTicket.notes || "",
        ...(newDescription !== undefined && { description: newDescription }),
        ...(newContractId !== undefined && { contractId: newContractId }),
        ...(newMediaUnitIds !== undefined && { mediaUnitIds: newMediaUnitIds }),
      };

      const response = await TicketService.putApiVTicket(
        API_VERSION,
        updatedTicketData
      );

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketIdFromComponent
            ? { ...response.data, id: response.data.ticketId }
            : ticket
        )
      );
      setSelectedTicket({ ...response.data, id: response.data.ticketId });
      toast.success("Ticket details updated successfully");
    } catch (error) {
      console.error("Failed to update ticket details:", error);
      toast.error("Failed to update ticket details");
    }
  };

  const handleUpdateTicketTitle = async (
    ticketId: string,
    newTitle: string
  ) => {
    try {
      const currentTicketResponse = await TicketService.getTicketById(
        ticketId,
        API_VERSION
      );
      const currentTicket = currentTicketResponse.data;
      if (!currentTicket) {
        toast.error("Ticket not found for title update.");
        return;
      }

      const updatedTicketData: UpdateTicketCommand = {
        ...currentTicket,
        id: currentTicket.ticketId,
        ticketId: currentTicket.ticketId,
        title: newTitle,
        lastModifiedDate: new Date().toISOString(),
        notes: currentTicket.notes || "",
      };

      const response = await TicketService.putApiVTicket(
        API_VERSION,
        updatedTicketData
      );

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...response.data, id: response.data.ticketId }
            : ticket
        )
      );
      setSelectedTicket({ ...response.data, id: response.data.ticketId });
      toast.success("Ticket title updated successfully");
    } catch (error) {
      console.error("Failed to update ticket title:", error);
      toast.error("Failed to update ticket title");
    }
  };

  const handleDeleteTicket = async (ticketIdToDelete: string) => {
    try {
      await TicketService.deleteTicket(ticketIdToDelete, API_VERSION);
      setTickets((prev) =>
        prev.filter((ticket) => ticket.id !== ticketIdToDelete)
      );
      toast.success("Ticket deleted successfully");
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  const handleSendMessage = async (ticketIdForMessage: string) => {
    try {
      const updatedTicketResponse = await TicketService.getTicketById(
        ticketIdForMessage,
        API_VERSION
      );
      setSelectedTicket(updatedTicketResponse.data);
      const documentsResponse = await DocumentsService.getApiVDocuments(
        API_VERSION,
        "Ticket",
        ticketIdForMessage
      );
      const mappedDocuments = (documentsResponse.data || []).map((doc) => ({
        name: doc.name || "Untitled Document",
        url: doc.blobUrl || doc.url || "#",
        type: doc.contentType || "",
        size: 0,
      }));
      setSelectedTicketDocuments(mappedDocuments);
    } catch (error) {
      console.error(
        "Failed to refresh ticket or documents after message:",
        error
      );
      toast.error("Failed to refresh ticket details.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Invalid Date") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusIcon = (statusId: string) => {
    const statusName = getStatusName(statusId).toLowerCase();
    switch (statusName) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in-progress":
      case "in progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (statusId: string) => {
    const statusName = getStatusName(statusId).toLowerCase();
    switch (statusName) {
      case "open":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "in-progress":
      case "in progress":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "resolved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };

  const getPriorityColor = (priorityId: string) => {
    const priorityName = getPriorityName(priorityId).toLowerCase();
    switch (priorityName) {
      case "low":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "medium":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "urgent":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track customer support requests
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tickets, customers, or ticket IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] text-center sm:text-left">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {ticketStatusesLookup.map((status) => (
                    <SelectItem
                      key={status.ticketStatusId}
                      value={status.name.toLowerCase()}
                    >
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[140px] text-center sm:text-left">
                                    <Filter className="h-4 w-4 mr-2" />

                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {ticketPrioritiesLookup.map((priority) => (
                    <SelectItem
                      key={priority.ticketPriorityId}
                      value={priority.name.toLowerCase()}
                    >
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex justify-end p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearDateRange}
                        disabled={!dateRange}
                      >
                        Clear
                      </Button>
                    </div>
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Open Tickets
                </p>
                <p className="text-2xl font-bold">
                  {
                    filteredTickets.filter(
                      (t) =>
                        getStatusName(t.ticketStatusId).toLowerCase() === "open"
                    ).length
                  }
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-bold">
                  {
                    filteredTickets.filter((t) =>
                      getStatusName(t.ticketStatusId)
                        .toLowerCase()
                        .includes("progress")
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resolved
                </p>
                <p className="text-2xl font-bold">
                  {
                    filteredTickets.filter(
                      (t) =>
                        getStatusName(t.ticketStatusId).toLowerCase() ===
                        "resolved"
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tickets
                </p>
                <p className="text-2xl font-bold">{filteredTickets.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-2 text-lg font-semibold text-muted-foreground">
                Loading tickets...
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Ticket No</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell onClick={() => setSelectedTicket(ticket)}>
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate">
                          {ticket.title || "Untitled"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {getTypeName(ticket.ticketTypeId)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {ticket.customer?.name || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {ticket.customer?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(ticket.ticketStatusId)}
                      >
                        {getStatusIcon(ticket.ticketStatusId)}
                        <span className="ml-1 capitalize">
                          {getStatusName(ticket.ticketStatusId)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(ticket.ticketPriorityId)}
                      >
                        {getPriorityName(ticket.ticketPriorityId)}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.ticketNo || "N/A"}</TableCell>
                    <TableCell>{formatDate(ticket.createdDate)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            View Details
                          </DropdownMenuItem>
                          {ticketStatusesLookup.map((status) => (
                            <DropdownMenuItem
                              key={status.ticketStatusId}
                              onClick={() =>
                                handleUpdateTicketDetails(
                                  ticket.id,
                                  status.ticketStatusId,
                                  ticket.assignedTo,
                                  ticket.ticketPriorityId
                                )
                              }
                            >
                              Mark as {status.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="text-red-600"
                          >
                            Delete Ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
            <TicketForm
              onSubmit={handleCreateTicket}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
              priorities={ticketPrioritiesLookup}
              types={ticketTypesLookup}
              statuses={ticketStatusesLookup}
              contracts={contractsLookup}
              mediaUnits={mediaUnitsLookup}
              onContractChange={fetchMediaUnits}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicket(null);
            setIsEditingDialogTitle(false);
            setEditedDialogTitle("");
          }
        }}
      >
        {selectedTicket && (
          <DialogContent className="overflow-x-hidden sm:max-w-3xl lg:max-w-5xl h-full sm:h-[calc(100vh-8rem)] sm:max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEditingDialogTitle ? (
                    <Input
                      value={editedDialogTitle}
                      onChange={(e) => setEditedDialogTitle(e.target.value)}
                      onBlur={() => {
                        if (
                          editedDialogTitle.trim() !==
                          selectedTicket.title.trim()
                        ) {
                          handleUpdateTicketTitle(
                            selectedTicket.id,
                            editedDialogTitle.trim()
                          );
                        }
                        setIsEditingDialogTitle(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (
                            editedDialogTitle.trim() !==
                            selectedTicket.title.trim()
                          ) {
                            handleUpdateTicketTitle(
                              selectedTicket.id,
                              editedDialogTitle.trim()
                            );
                          }
                          setIsEditingDialogTitle(false);
                        }
                      }}
                      className="text-xl font-bold"
                      autoFocus
                    />
                  ) : (
                    <DialogTitle className="text-xl">
                      {selectedTicket.title}
                    </DialogTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setIsEditingDialogTitle(!isEditingDialogTitle)
                    }
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Title</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(selectedTicket.ticketStatusId)}
                  >
                    {getStatusIcon(selectedTicket.ticketStatusId)}
                    <span className="ml-1 capitalize">
                      {getStatusName(selectedTicket.ticketStatusId)}
                    </span>
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={getPriorityColor(
                      selectedTicket.ticketPriorityId
                    )}
                  >
                    {getPriorityName(selectedTicket.ticketPriorityId)}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground">{selectedTicket.id}</p>
            </DialogHeader>
            <TicketDetail
              ticket={selectedTicket}
              onUpdateTicketDetails={(
                ticketId,
                statusId,
                assigneeEmail,
                priorityId,
                description,
                contractId,
                mediaUnitIds
              ) =>
                handleUpdateTicketDetails(
                  ticketId,
                  statusId,
                  assigneeEmail,
                  priorityId,
                  description,
                  contractId,
                  mediaUnitIds
                )
              }
              onMessageSend={() => handleSendMessage(selectedTicket.id)}
              statuses={ticketStatusesLookup}
              priorities={ticketPrioritiesLookup}
              types={ticketTypesLookup}
              users={usersLookup}
              contracts={contractsLookup}
              mediaUnits={mediaUnitsLookup}
              onContractChange={fetchMediaUnits}
              documents={selectedTicketDocuments}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
