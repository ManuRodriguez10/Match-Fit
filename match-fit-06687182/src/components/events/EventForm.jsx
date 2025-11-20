import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EventForm({ event, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    type: event?.type || "practice",
    date: event?.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : "",
    location: event?.location || "",
    description: event?.description || "",
    opponent: event?.opponent || "",
    required: event?.required ?? true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
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
    } catch (error) {
      const message = error?.message || "Unable to save event. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{event ? "Edit Event" : "Create New Event"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Weekly Practice"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500">
                {formData.title.length}/20 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., City Park, Field 4"
                required
              />
            </div>

            {formData.type === "game" && (
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  value={formData.opponent}
                  onChange={(e) => handleInputChange("opponent", e.target.value)}
                  placeholder="e.g., Northside United"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch 
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) => handleInputChange("required", checked)}
              />
              <Label htmlFor="required">Attendance Required</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="e.g., Bring white and green jerseys."
              maxLength={50}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/50 characters
            </p>
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
            >
              {isSubmitting ? "Saving..." : event ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}