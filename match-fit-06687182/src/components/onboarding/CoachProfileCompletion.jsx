import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Copy, Calendar, Sparkles } from "lucide-react";
import { format } from "date-fns";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardNav from "@/components/dashboard/DashboardNav";

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
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [teamCode, setTeamCode] = useState(null);
  const [currentDate] = useState(() => new Date());

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
        phone: fullPhoneNumber,
        profile_completed_for_team_id: user.team_id
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

  const fetchTeamCode = async () => {
    if (!user?.team_id) return;
    const { data } = await supabase
      .from("teams")
      .select("join_code, name")
      .eq("id", user.team_id)
      .single();
    setTeamCode(data);
  };

  const handleCopyCode = async () => {
    if (!teamCode?.join_code) return;
    try {
      await navigator.clipboard.writeText(teamCode.join_code);
      toast.success("Team code copied to clipboard!");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3fe] via-white to-[#e7f3fe] relative overflow-hidden">
      <DashboardBackground />
      <DashboardNav user={user} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-slate-600 font-medium text-lg">Setup</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#118ff3]/10 border border-[#118ff3]/20 text-[#0c5798] text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Coach
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                Complete Your Profile
              </span>
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Now that you've joined a team, let's finish setting up your coach profile.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60">
            <Calendar className="w-4 h-4 text-[#118ff3]" />
            <span className="font-medium">{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-900/5 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300/50 transition-all duration-300">
            <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]" />
            <div className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-slate-700 font-medium">First Name *</Label>
                    <Input
                      id="first_name"
                      value={coachData.first_name}
                      onChange={(e) => handleCoachDataChange("first_name", e.target.value)}
                      placeholder="John"
                      className={`rounded-xl bg-white border-slate-200/50 focus:border-[#118ff3] focus:ring-[#118ff3] ${firstNameError ? "border-red-500" : ""}`}
                      required
                    />
                    {firstNameError && (
                      <p className="text-xs text-red-500">{firstNameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-slate-700 font-medium">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={coachData.last_name}
                      onChange={(e) => handleCoachDataChange("last_name", e.target.value)}
                      placeholder="Doe"
                      className={`rounded-xl bg-white border-slate-200/50 focus:border-[#118ff3] focus:ring-[#118ff3] ${lastNameError ? "border-red-500" : ""}`}
                      required
                    />
                    {lastNameError && (
                      <p className="text-xs text-red-500">{lastNameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience" className="text-slate-700 font-medium">Years of Coaching Experience *</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      max="99"
                      value={coachData.years_experience}
                      onChange={(e) => handleCoachDataChange("years_experience", parseInt(e.target.value) || "")}
                      placeholder="e.g., 5"
                      className={`rounded-xl bg-white border-slate-200/50 focus:border-[#118ff3] focus:ring-[#118ff3] ${yearsExperienceError ? "border-red-500" : ""}`}
                      required
                    />
                    {yearsExperienceError ? (
                      <p className="text-xs text-red-500">{yearsExperienceError}</p>
                    ) : (
                      <p className="text-xs text-slate-500">Enter your years of coaching experience</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700 font-medium">Phone Number *</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={coachData.country_code} 
                        onValueChange={(value) => handleCoachDataChange("country_code", value)}
                      >
                        <SelectTrigger className={`w-[140px] rounded-xl bg-white border-slate-200/50 focus:border-[#118ff3] focus:ring-[#118ff3] ${phoneError ? "border-red-500" : ""}`}>
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
                        className={`rounded-xl flex-1 bg-white border-slate-200/50 focus:border-[#118ff3] focus:ring-[#118ff3] ${phoneError ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {phoneError ? (
                      <p className="text-xs text-red-500">{phoneError}</p>
                    ) : (
                      <p className="text-xs text-slate-500">Select your country code and enter your phone number</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Dialog open={codeDialogOpen} onOpenChange={(open) => {
                    setCodeDialogOpen(open);
                    if (open) fetchTeamCode();
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-xl border-slate-200/50 hover:bg-slate-50 bg-white"
                      >
                        View Team Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-900/10 backdrop-blur-xl bg-white/95">
                      <div className="h-1.5 bg-gradient-to-r from-[#118ff3] to-[#0c5798]" />
                      <div className="p-6 pt-4 pr-12 space-y-6">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent">
                            Your Team Join Code
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {teamCode ? (
                            <>
                              <p className="text-sm text-gray-600">
                                Share this code with your players so they can join <strong>{teamCode.name}</strong>:
                              </p>
                              <div className="bg-[#e7f3fe] rounded-xl p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#118ff3] to-[#0c5798] bg-clip-text text-transparent tracking-wider break-all">
                                    {teamCode.join_code}
                                  </p>
                                  <Button
                                    variant="outline"
                                    onClick={handleCopyCode}
                                    className="w-full sm:w-auto flex-shrink-0 bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl shadow-lg"
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Code
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Loading...</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#118ff3] to-[#0c5798] hover:from-[#0c5798] hover:to-[#118ff3] text-white rounded-xl shadow-lg shadow-[#118ff3]/30 hover:shadow-xl transition-all duration-200 px-4 py-3 h-10 text-sm"
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
