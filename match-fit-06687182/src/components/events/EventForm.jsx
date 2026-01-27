import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Calendar, MapPin, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatOperationError, isNetworkError } from "@/utils/errorHandling";
import { preventRapidSubmit } from "@/utils/formUtils";

export default function EventForm({ event, onSubmit, onCancel, initialDate }) {
  // Format initial date if provided
  const getInitialDate = () => {
    if (event?.date) {
      return format(new Date(event.date), "yyyy-MM-dd'T'HH:mm");
    }
    if (initialDate) {
      // Set to 9 AM by default if only date is provided
      const date = new Date(initialDate);
      date.setHours(9, 0, 0, 0);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    }
    return "";
  };

  const initialFormData = {
    title: event?.title || "",
    type: event?.type || "practice",
    date: getInitialDate(),
    location: event?.location || "",
    description: event?.description || "",
    opponent: event?.opponent || "",
    required: event?.required ?? true
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const hasUnsavedChangesRef = useRef(false);

  // Check if form has been modified
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

  // Update ref when form data changes
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Warn about unsaved changes on browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChangesRef.current && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting]);

  const submitEvent = async () => {
    setFormError("");
    
    // Check if the event date is in the past
    const eventDateTime = new Date(formData.date);
    const now = new Date();

    if (Number.isNaN(eventDateTime.getTime())) {
      const message = "Please select a valid date and time.";
      setFormError(message);
      toast.error(message);
      return;
    }
    
    if (eventDateTime < now) {
      const message = "Event date and time cannot be in the past.";
      setFormError(message);
      toast.error(message);
      return;
    }
    
    const eventData = {
      ...formData,
      date: eventDateTime.toISOString()
    };
    setIsSubmitting(true);
    try {
      await onSubmit(eventData);
      // Reset unsaved changes flag after successful submit
      hasUnsavedChangesRef.current = false;
    } catch (error) {
      const isNetwork = isNetworkError(error);
      const message = formatOperationError(error, "save event", isNetwork);
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Protect against rapid submissions
  const protectedSubmit = preventRapidSubmit(submitEvent, 2000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    await protectedSubmit();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges && !isSubmitting) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!confirmed) {
        return;
      }
    }
    onCancel();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-900/5 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {event ? "Edit Event" : "Create New Event"}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCancel}
            className="rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Weekly Practice"
              maxLength={20}
              required
              className="rounded-xl border-slate-200 focus:border-[#118ff3] focus:ring-[#118ff3]/20"
            />
            <p className="text-xs text-slate-500">
              {formData.title.length}/20 characters
            </p>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-semibold text-slate-700">Event Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger className="rounded-xl border-slate-200 focus:border-[#118ff3] focus:ring-[#118ff3]/20">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="game">Game</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#118ff3]" />
              Date & Time
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
              className="rounded-xl border-slate-200 focus:border-[#118ff3] focus:ring-[#118ff3]/20"
            />
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#118ff3]" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., City Park, Field 4"
              required
              className="rounded-xl border-slate-200 focus:border-[#118ff3] focus:ring-[#118ff3]/20"
            />
          </div>

          {/* Opponent (only for games) */}
          {formData.type === "game" && (
            <div className="space-y-2">
              <Label htmlFor="opponent" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#118ff3]" />
                Opponent
              </Label>
              <Input
                id="opponent"
                value={formData.opponent}
                onChange={(e) => handleInputChange("opponent", e.target.value)}
                placeholder="e.g., Northside United"
                className="rounded-xl border-slate-200 focus:border-[#118ff3] focus:ring-[#118ff3]/20"
              />
            </div>
          )}
          
          {/* Attendance Required Toggle */}
          <div className="flex items-center space-x-3 pt-8">
            <Switch 
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => handleInputChange("required", checked)}
            />
            <Label htmlFor="required" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Attendance Required
            </Label>
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#118ff3]" />
            Description / Notes
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="e.g., Bring white and green jerseys."
            maxLength={50}
            className="rounded-xl border-slate-200 focus:border-[#118ff3] focus:ring-[#118ff3]/20 min-h-[100px]"
          />
          <p className="text-xs text-slate-500">
            {formData.description.length}/50 characters
          </p>
        </div>

        {/* Error Message */}
        {formError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{formError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="rounded-xl border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl shadow-lg shadow-[#118ff3]/30 px-6"
          >
            {isSubmitting ? "Saving..." : event ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}