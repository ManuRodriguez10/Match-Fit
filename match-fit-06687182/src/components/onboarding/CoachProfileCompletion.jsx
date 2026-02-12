import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { code: "+54", country: "Argentina" },
  { code: "+57", country: "Colombia" },
  { code: "+51", country: "Peru" },
  { code: "+56", country: "Chile" },
  { code: "+58", country: "Venezuela" },
  { code: "+593", country: "Ecuador" },
  { code: "+598", country: "Uruguay" },
  { code: "+506", country: "Costa Rica" },
  { code: "+7", country: "Russia/Kazakhstan" },
  { code: "+90", country: "Turkey" },
  { code: "+48", country: "Poland" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+358", country: "Finland" },
  { code: "+351", country: "Portugal" },
  { code: "+30", country: "Greece" },
  { code: "+420", country: "Czech Republic" },
  { code: "+36", country: "Hungary" },
  { code: "+40", country: "Romania" },
  { code: "+353", country: "Ireland" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
  { code: "+82", country: "South Korea" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+972", country: "Israel" },
  { code: "+64", country: "New Zealand" },
  { code: "+213", country: "Algeria" },
  { code: "+212", country: "Morocco" },
  { code: "+216", country: "Tunisia" },
  { code: "+233", country: "Ghana" },
  { code: "+256", country: "Uganda" },
  { code: "+255", country: "Tanzania" },
];

const parsePhoneNumber = (phone) => {
  if (!phone) return { countryCode: "+1", localNumber: "" };
  for (const { code } of COUNTRY_CODES) {
    if (phone.startsWith(code)) {
      return {
        countryCode: code,
        localNumber: phone.slice(code.length).trim()
      };
    }
  }
  return { countryCode: "+1", localNumber: phone };
};

export default function CoachProfileCompletion({ user, onComplete, onBack }) {
  const { countryCode: initialCountryCode, localNumber: initialLocalNumber } = parsePhoneNumber(user.phone);
  
  const [coachData, setCoachData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    years_experience: user.years_experience || "",
    country_code: initialCountryCode,
    local_phone_number: initialLocalNumber
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [yearsExperienceError, setYearsExperienceError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validateFirstName = (value) => {
    if (!value || !value.trim()) return "First name is required";
    return "";
  };

  const validateLastName = (value) => {
    if (!value || !value.trim()) return "Last name is required";
    return "";
  };

  const validateYearsExperience = (value) => {
    if (!value || value === "") return "Years of experience is required";
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 99) return "Please enter a valid number between 0 and 99";
    return "";
  };

  const validatePhoneNumber = (countryCode, localNumber) => {
    if (!localNumber.trim()) return "Phone number is required";
    const digitsOnly = localNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7) return "Phone number must contain at least 7 digits";
    if (digitsOnly.length > 15) return "Phone number is too long";
    return "";
  };

  const handleCoachDataChange = (field, value) => {
    setCoachData(prev => ({ ...prev, [field]: value }));
    if (field === "first_name") setFirstNameError(validateFirstName(value));
    if (field === "last_name") setLastNameError(validateLastName(value));
    if (field === "years_experience") setYearsExperienceError(validateYearsExperience(value));
    if (field === "country_code" || field === "local_phone_number") {
      const countryCode = field === "country_code" ? value : coachData.country_code;
      const localNumber = field === "local_phone_number" ? value : coachData.local_phone_number;
      setPhoneError(validatePhoneNumber(countryCode, localNumber));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstNameValidation = validateFirstName(coachData.first_name);
    const lastNameValidation = validateLastName(coachData.last_name);
    const yearsExperienceValidation = validateYearsExperience(coachData.years_experience);
    const phoneValidation = validatePhoneNumber(coachData.country_code, coachData.local_phone_number);
    
    setFirstNameError(firstNameValidation);
    setLastNameError(lastNameValidation);
    setYearsExperienceError(yearsExperienceValidation);
    setPhoneError(phoneValidation);
    
    if (firstNameValidation || lastNameValidation || yearsExperienceValidation || phoneValidation) {
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
        phone: fullPhoneNumber,
        profile_completed_for_team_id: user.team_id
      };

      if (coachData.first_name && coachData.last_name) {
        updateData.full_name = `${coachData.first_name} ${coachData.last_name}`;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      onComplete();
    } catch (error) {
      console.error("Error updating coach profile:", error);
      toast.error(error?.message || "There was an error saving your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = firstNameError || lastNameError || yearsExperienceError || phoneError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]"></div>
          
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#118ff3] to-[#0c5798] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent text-center">
                Complete Your Profile
              </h1>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Now that you've joined a team, let's finish setting up your coach profile.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-700 font-medium">First Name *</Label>
                  <Input
                    id="first_name"
                    value={coachData.first_name}
                    onChange={(e) => handleCoachDataChange("first_name", e.target.value)}
                    placeholder="John"
                    className={`rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${firstNameError ? "border-red-500" : ""}`}
                    required
                  />
                  {firstNameError && <p className="text-xs text-red-500">{firstNameError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-700 font-medium">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={coachData.last_name}
                    onChange={(e) => handleCoachDataChange("last_name", e.target.value)}
                    placeholder="Doe"
                    className={`rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${lastNameError ? "border-red-500" : ""}`}
                    required
                  />
                  {lastNameError && <p className="text-xs text-red-500">{lastNameError}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="years_experience" className="text-gray-700 font-medium">Years of Coaching Experience *</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    max="99"
                    value={coachData.years_experience}
                    onChange={(e) => handleCoachDataChange("years_experience", parseInt(e.target.value) || "")}
                    placeholder="e.g., 5"
                    className={`rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${yearsExperienceError ? "border-red-500" : ""}`}
                    required
                  />
                  {yearsExperienceError ? (
                    <p className="text-xs text-red-500">{yearsExperienceError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Enter your years of coaching experience</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-700 font-medium">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={coachData.country_code} 
                      onValueChange={(value) => handleCoachDataChange("country_code", value)}
                    >
                      <SelectTrigger className={`w-[140px] rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${phoneError ? "border-red-500" : ""}`}>
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
                      className={`rounded-lg flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${phoneError ? "border-red-500" : ""}`}
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

              <div className="flex gap-3 pt-2">
                {onBack && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onBack} 
                    className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || hasErrors}
                  className="flex-1 bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? "Completing..." : "Complete Profile"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
