import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", 
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", 
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", 
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", 
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", 
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", 
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", 
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", 
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", 
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", 
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", 
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

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

export default function PlayerProfileCompletion({ user, onComplete }) {
  const { countryCode: initialCountryCode, localNumber: initialLocalNumber } = parsePhoneNumber(user.phone);
  
  const [playerData, setPlayerData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    position: "",
    jersey_number: "",
    date_of_birth: "",
    height_feet: "",
    height_inches: "",
    weight: "",
    nationality: "",
    country_code: initialCountryCode,
    local_phone_number: initialLocalNumber
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [takenJerseyNumbers, setTakenJerseyNumbers] = useState([]);
  
  // Error states for all fields
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [jerseyError, setJerseyError] = useState("");
  const [dateOfBirthError, setDateOfBirthError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [nationalityError, setNationalityError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    loadTeamJerseyNumbers();
  }, []);

  const loadTeamJerseyNumbers = async () => {
    try {
      if (!user?.team_id) {
        setTakenJerseyNumbers([]);
        return;
      }

      // Fetch team members from Supabase profiles table
      const { data: members, error } = await supabase
        .from('profiles')
        .select('id, jersey_number, team_role')
        .eq('team_id', user.team_id);

      if (error) {
        console.error("Error loading team jersey numbers:", error);
        setTakenJerseyNumbers([]);
        return;
      }

      const taken = (members || [])
        .filter(member => member.team_role === "player" && member.jersey_number && member.id !== user.id)
        .map(member => parseInt(member.jersey_number))
        .filter(num => !isNaN(num));
      
      setTakenJerseyNumbers(taken);
    } catch (error) {
      console.error("Error loading team jersey numbers:", error);
      setTakenJerseyNumbers([]);
    }
  };

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

  const validatePosition = (value) => {
    if (!value) {
      return "Position is required";
    }
    return "";
  };

  const validateJerseyNumber = (value) => {
    if (!value) {
      return "Jersey number is required";
    }
    if (takenJerseyNumbers.includes(parseInt(value))) {
      return `Jersey number ${value} is already taken by another player`;
    }
    return "";
  };

  const validateDateOfBirth = (value) => {
    if (!value) {
      return "Date of birth is required";
    }
    return "";
  };

  const validateNationality = (value) => {
    if (!value) {
      return "Nationality is required";
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

  const validateHeight = (feet, inches) => {
    if (!feet || !inches) {
      return "Both feet and inches are required";
    }
    
    const feetNum = parseInt(feet) || 0;
    const inchesNum = parseInt(inches) || 0;
    
    if (feetNum < 3 || feetNum > 8) {
      return "Feet must be between 3 and 8";
    }
    
    if (inchesNum < 0 || inchesNum > 11) {
      return "Inches must be between 0 and 11";
    }
    
    return "";
  };

  const validateWeight = (weight) => {
    if (!weight.trim()) {
      return "Weight is required";
    }
    
    const cleanWeight = weight.replace(/\s*(lbs?|pounds?)\s*$/i, "").trim();
    const weightNum = parseFloat(cleanWeight);
    
    if (isNaN(weightNum)) {
      return "Please enter a valid number";
    }
    
    if (weightNum < 50 || weightNum > 400) {
      return "Weight must be between 50 and 400 lbs";
    }
    
    return "";
  };

  const handlePlayerDataChange = (field, value) => {
    setPlayerData(prev => ({ ...prev, [field]: value }));
    
    // Validate each field as it changes
    if (field === "first_name") {
      setFirstNameError(validateFirstName(value));
    }
    
    if (field === "last_name") {
      setLastNameError(validateLastName(value));
    }
    
    if (field === "position") {
      setPositionError(validatePosition(value));
    }
    
    if (field === "jersey_number") {
      setJerseyError(validateJerseyNumber(value));
    }
    
    if (field === "date_of_birth") {
      setDateOfBirthError(validateDateOfBirth(value));
    }
    
    if (field === "nationality") {
      setNationalityError(validateNationality(value));
    }
    
    if (field === "height_feet" || field === "height_inches") {
      const feet = field === "height_feet" ? value : playerData.height_feet;
      const inches = field === "height_inches" ? value : playerData.height_inches;
      const error = validateHeight(feet, inches);
      setHeightError(error);
    }
    
    if (field === "weight") {
      const error = validateWeight(value);
      setWeightError(error);
    }

    if (field === "country_code" || field === "local_phone_number") {
      const countryCode = field === "country_code" ? value : playerData.country_code;
      const localNumber = field === "local_phone_number" ? value : playerData.local_phone_number;
      const error = validatePhoneNumber(countryCode, localNumber);
      setPhoneError(error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = createPageUrl("Login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const firstNameValidation = validateFirstName(playerData.first_name);
    const lastNameValidation = validateLastName(playerData.last_name);
    const positionValidation = validatePosition(playerData.position);
    const jerseyValidation = validateJerseyNumber(playerData.jersey_number);
    const dobValidation = validateDateOfBirth(playerData.date_of_birth);
    const heightValidation = validateHeight(playerData.height_feet, playerData.height_inches);
    const weightValidation = validateWeight(playerData.weight);
    const nationalityValidation = validateNationality(playerData.nationality);
    const phoneValidation = validatePhoneNumber(playerData.country_code, playerData.local_phone_number);
    
    // Set all error states
    setFirstNameError(firstNameValidation);
    setLastNameError(lastNameValidation);
    setPositionError(positionValidation);
    setJerseyError(jerseyValidation);
    setDateOfBirthError(dobValidation);
    setHeightError(heightValidation);
    setWeightError(weightValidation);
    setNationalityError(nationalityValidation);
    setPhoneError(phoneValidation);
    
    // Check if any validation failed
    if (
      firstNameValidation ||
      lastNameValidation ||
      positionValidation ||
      jerseyValidation ||
      dobValidation ||
      heightValidation ||
      weightValidation ||
      nationalityValidation ||
      phoneValidation
    ) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cleanWeight = playerData.weight.replace(/\s*(lbs?|pounds?)\s*$/i, "").trim();
      const heightString = `${playerData.height_feet}'${playerData.height_inches}`;
      const fullPhoneNumber = `${playerData.country_code}${playerData.local_phone_number.replace(/\D/g, '')}`;
      
      const updateData = {
        first_name: playerData.first_name,
        last_name: playerData.last_name,
        position: playerData.position,
        jersey_number: String(playerData.jersey_number || ""), // Ensure it's a string
        date_of_birth: playerData.date_of_birth || null, // DATE column - HTML date input provides YYYY-MM-DD format
        height: heightString,
        weight: cleanWeight,
        nationality: playerData.nationality,
        phone: fullPhoneNumber
      };

      if (playerData.first_name && playerData.last_name) {
        updateData.full_name = `${playerData.first_name} ${playerData.last_name}`;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("Supabase update error:", error);
        console.error("Update data being sent:", updateData);
        console.error("User ID:", user.id);
        throw error;
      }

      toast.success("Profile updated successfully!");
      onComplete();
    } catch (error) {
      console.error("Error updating player profile:", error);
      // Show more detailed error message if available
      const errorMessage = error?.message || error?.details || error?.hint || "There was an error saving your information. Please try again.";
      console.error("Full error details:", JSON.stringify(error, null, 2));
      toast.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  const hasErrors = firstNameError || lastNameError || positionError || jerseyError || 
                    dateOfBirthError || heightError || weightError || nationalityError || phoneError;

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
            Complete Your Player Profile
          </h1>
          <p className="text-gray-600">
            Now that you've joined a team, let's finish setting up your player profile.
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
                      value={playerData.first_name}
                      onChange={(e) => handlePlayerDataChange("first_name", e.target.value)}
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
                      value={playerData.last_name}
                      onChange={(e) => handlePlayerDataChange("last_name", e.target.value)}
                      placeholder="Doe"
                      className={`rounded-lg ${lastNameError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                  {lastNameError && (
                    <p className="text-xs text-red-500">{lastNameError}</p>
                  )}
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-gray-700 font-medium">Position *</Label>
                    <Select 
                      value={playerData.position} 
                      onValueChange={(value) => handlePlayerDataChange("position", value)}
                      required
                    >
                      <SelectTrigger className={`rounded-lg ${positionError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}>
                        <SelectValue placeholder="Select your position" />
                      </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                  {positionError && (
                    <p className="text-xs text-red-500">{positionError}</p>
                  )}
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="jersey_number" className="text-gray-700 font-medium">Jersey Number *</Label>
                    <Input
                      id="jersey_number"
                      type="number"
                      min="1"
                      max="99"
                      value={playerData.jersey_number}
                      onChange={(e) => handlePlayerDataChange("jersey_number", parseInt(e.target.value) || "")}
                      placeholder="e.g., 10"
                      className={`rounded-lg ${jerseyError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                  {jerseyError ? (
                    <p className="text-xs text-red-500">{jerseyError}</p>
                  ) : takenJerseyNumbers.length > 0 ? (
                    <p className="text-xs text-gray-500">
                      Taken numbers: {takenJerseyNumbers.sort((a, b) => a - b).join(", ")}
                    </p>
                  ) : null}
                </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-700 font-medium">Phone Number *</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={playerData.country_code} 
                        onValueChange={(value) => handlePlayerDataChange("country_code", value)}
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
                        value={playerData.local_phone_number}
                        onChange={(e) => handlePlayerDataChange("local_phone_number", e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-gray-700 font-medium">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={playerData.date_of_birth}
                      onChange={(e) => handlePlayerDataChange("date_of_birth", e.target.value)}
                      className={`rounded-lg ${dateOfBirthError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                  {dateOfBirthError && (
                    <p className="text-xs text-red-500">{dateOfBirthError}</p>
                  )}
                </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Height *</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          id="height_feet"
                          type="number"
                          min="3"
                          max="8"
                          value={playerData.height_feet}
                          onChange={(e) => handlePlayerDataChange("height_feet", e.target.value)}
                          placeholder="Feet"
                          className={`rounded-lg ${heightError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          id="height_inches"
                          type="number"
                          min="0"
                          max="11"
                          value={playerData.height_inches}
                          onChange={(e) => handlePlayerDataChange("height_inches", e.target.value)}
                          placeholder="Inches"
                          className={`rounded-lg ${heightError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                          required
                        />
                      </div>
                    </div>
                  {heightError ? (
                    <p className="text-xs text-red-500">{heightError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Enter feet (3-8) and inches (0-11)</p>
                  )}
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-700 font-medium">Weight (lbs) *</Label>
                    <Input
                      id="weight"
                      value={playerData.weight}
                      onChange={(e) => handlePlayerDataChange("weight", e.target.value)}
                      placeholder="e.g., 165"
                      className={`rounded-lg ${weightError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                  {weightError ? (
                    <p className="text-xs text-red-500">{weightError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Enter weight in pounds</p>
                  )}
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-gray-700 font-medium">Nationality *</Label>
                    <Select 
                      value={playerData.nationality} 
                      onValueChange={(value) => handlePlayerDataChange("nationality", value)}
                      required
                    >
                      <SelectTrigger id="nationality" className={`rounded-lg ${nationalityError ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"}`}>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {nationalityError && (
                    <p className="text-xs text-red-500">{nationalityError}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm h-10 transition-all text-white border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
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