import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Users } from "lucide-react";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "United Kingdom" },
  { code: "+61", country: "Australia" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+52", country: "Mexico" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
  { code: "+20", country: "Egypt" },
  { code: "+234", country: "Nigeria" },
  { code: "+254", country: "Kenya" },
];

// Helper function to parse existing phone number into country code and local number
const parsePhoneNumber = (phone) => {
  if (!phone) return { countryCode: "+1", localNumber: "" };
  
  // Find matching country code
  for (const { code } of COUNTRY_CODES) {
    if (phone.startsWith(code)) {
      return {
        countryCode: code,
        localNumber: phone.slice(code.length).trim()
      };
    }
  }
  
  // Default if no match found
  return { countryCode: "+1", localNumber: phone };
};

export default function CoachProfileForm({ user, onUpdate }) {
  const { countryCode: initialCountryCode, localNumber: initialLocalNumber } = parsePhoneNumber(user.phone);
  
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    country_code: initialCountryCode,
    local_phone_number: initialLocalNumber,
    coach_role: user.coach_role || "",
    years_experience: user.years_experience || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const validatePhoneNumber = (countryCode, localNumber) => {
    if (!localNumber.trim()) {
      return "Phone number is required";
    }

    const digitsOnly = localNumber.replace(/\D/g, '');

    if (digitsOnly.length < 7) {
      return "Phone number must contain at least 7 digits";
    }

    if (digitsOnly.length > 15) {
      return "Phone number is too long";
    }

    return "";
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "country_code" || field === "local_phone_number") {
      const countryCode = field === "country_code" ? value : formData.country_code;
      const localNumber = field === "local_phone_number" ? value : formData.local_phone_number;
      const error = validatePhoneNumber(countryCode, localNumber);
      setPhoneError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submitting
    const error = validatePhoneNumber(formData.country_code, formData.local_phone_number);
    if (error) {
      setPhoneError(error);
      toast.error(error);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: `${formData.country_code}${formData.local_phone_number.replace(/\D/g, '')}`,
        coach_role: formData.coach_role,
        years_experience: formData.years_experience
      };
      
      // Update full_name if first or last name changed
      if (formData.first_name && formData.last_name) {
        updateData.full_name = `${formData.first_name} ${formData.last_name}`;
      }
      
      await base44.auth.updateMe(updateData);
      toast.success("Profile updated successfully!");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
    setIsSubmitting(false);
  };

  const getCoachRoleDisplay = (role) => {
    switch (role) {
      case "head_coach":
        return "Head Coach";
      case "assistant_coach":
        return "Assistant Coach";
      default:
        return "Coach";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Update your coaching information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {formData.first_name && formData.last_name 
                  ? `${formData.first_name} ${formData.last_name}` 
                  : user.email}
              </CardTitle>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">{getCoachRoleDisplay(formData.coach_role)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.country_code} 
                    onValueChange={(value) => handleInputChange("country_code", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map(({ code, country }) => (
                        <SelectItem key={code} value={code}>
                          {code} ({country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="local_phone_number"
                    type="tel"
                    value={formData.local_phone_number}
                    onChange={(e) => handleInputChange("local_phone_number", e.target.value)}
                    placeholder="5551234567"
                    className={phoneError ? "border-red-500 flex-1" : "flex-1"}
                    required
                  />
                </div>
                {phoneError ? (
                  <p className="text-xs text-red-500">{phoneError}</p>
                ) : (
                  <p className="text-xs text-gray-500">Select your country code and enter your phone number</p>
                )}
              </div>
            </div>

            {/* Coaching Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coaching Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coach_role">Coach Role *</Label>
                  <Select 
                    value={formData.coach_role} 
                    onValueChange={(value) => handleInputChange("coach_role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head_coach">Head Coach</SelectItem>
                      <SelectItem value="assistant_coach">Assistant Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Coaching Experience *</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    max="99"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange("years_experience", parseInt(e.target.value) || "")}
                    placeholder="e.g., 5"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || phoneError !== ""}
                className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)]"
              >
                {isSubmitting ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}