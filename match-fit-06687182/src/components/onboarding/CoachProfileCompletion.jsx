import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

export default function CoachProfileCompletion({ user, onComplete }) {
  const { countryCode: initialCountryCode, localNumber: initialLocalNumber } = parsePhoneNumber(user.phone);
  
  const [coachData, setCoachData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    years_experience: user.years_experience || "",
    country_code: initialCountryCode,
    local_phone_number: initialLocalNumber
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error states
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [yearsExperienceError, setYearsExperienceError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validateFirstName = (value) => {
    if (!value || !value.trim()) {
      return "First name is required";
    }
    return "";
  };

  const validateLastName = (value) => {
    if (!value || !value.trim()) {
      return "Last name is required";
    }
    return "";
  };

  const validateYearsExperience = (value) => {
    if (!value || value === "") {
      return "Years of experience is required";
    }
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 99) {
      return "Please enter a valid number between 0 and 99";
    }
    return "";
  };

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

  const handleCoachDataChange = (field, value) => {
    setCoachData(prev => ({ ...prev, [field]: value }));
    
    // Validate each field as it changes
    if (field === "first_name") {
      setFirstNameError(validateFirstName(value));
    }
    
    if (field === "last_name") {
      setLastNameError(validateLastName(value));
    }
    
    if (field === "years_experience") {
      setYearsExperienceError(validateYearsExperience(value));
    }

    if (field === "country_code" || field === "local_phone_number") {
      const countryCode = field === "country_code" ? value : coachData.country_code;
      const localNumber = field === "local_phone_number" ? value : coachData.local_phone_number;
      const error = validatePhoneNumber(countryCode, localNumber);
      setPhoneError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const firstNameValidation = validateFirstName(coachData.first_name);
    const lastNameValidation = validateLastName(coachData.last_name);
    const yearsExperienceValidation = validateYearsExperience(coachData.years_experience);
    const phoneValidation = validatePhoneNumber(coachData.country_code, coachData.local_phone_number);
    
    // Set all error states
    setFirstNameError(firstNameValidation);
    setLastNameError(lastNameValidation);
    setYearsExperienceError(yearsExperienceValidation);
    setPhoneError(phoneValidation);
    
    // Check if any validation failed
    if (
      firstNameValidation ||
      lastNameValidation ||
      yearsExperienceValidation ||
      phoneValidation
    ) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const fullPhoneNumber = `${coachData.country_code}${coachData.local_phone_number.replace(/\D/g, '')}`;
      
      const updateData = {
        first_name: coachData.first_name,
        last_name: coachData.last_name,
        years_experience: parseInt(coachData.years_experience),
        phone: fullPhoneNumber
      };

      if (coachData.first_name && coachData.last_name) {
        updateData.full_name = `${coachData.first_name} ${coachData.last_name}`;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      toast.success("Profile updated successfully!");
      onComplete();
    } catch (error) {
      console.error("Error updating coach profile:", error);
      const errorMessage = error?.message || error?.details || error?.hint || "There was an error saving your information. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = firstNameError || lastNameError || yearsExperienceError || phoneError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png" alt="MatchFit Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent mb-2">
            Complete Your Coach Profile
          </h1>
          <p className="text-gray-600">
            Now that you've joined a team, let's finish setting up your coach profile.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-gray-700 font-medium">First Name *</Label>
                    <Input
                      id="first_name"
                      value={coachData.first_name}
                      onChange={(e) => handleCoachDataChange("first_name", e.target.value)}
                      placeholder="John"
                      className={`rounded-lg ${firstNameError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                    {firstNameError && (
                      <p className="text-xs text-red-500">{firstNameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-gray-700 font-medium">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={coachData.last_name}
                      onChange={(e) => handleCoachDataChange("last_name", e.target.value)}
                      placeholder="Doe"
                      className={`rounded-lg ${lastNameError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                    {lastNameError && (
                      <p className="text-xs text-red-500">{lastNameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience" className="text-gray-700 font-medium">Years of Coaching Experience *</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      max="99"
                      value={coachData.years_experience}
                      onChange={(e) => handleCoachDataChange("years_experience", parseInt(e.target.value) || "")}
                      placeholder="e.g., 5"
                      className={`rounded-lg ${yearsExperienceError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                    {yearsExperienceError ? (
                      <p className="text-xs text-red-500">{yearsExperienceError}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Enter your years of coaching experience</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Coach Role</Label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{getCoachRoleDisplay(user.coach_role)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Your role is set by your team's head coach</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-700 font-medium">Phone Number *</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={coachData.country_code} 
                        onValueChange={(value) => handleCoachDataChange("country_code", value)}
                      >
                        <SelectTrigger className="w-[140px] rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                        value={coachData.local_phone_number}
                        onChange={(e) => handleCoachDataChange("local_phone_number", e.target.value)}
                        placeholder="5551234567"
                        className={`rounded-lg flex-1 ${phoneError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
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

                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-3 h-10 text-sm"
                    disabled={isSubmitting || hasErrors}
                  >
                    {isSubmitting ? "Completing Profile..." : "Complete Profile"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
