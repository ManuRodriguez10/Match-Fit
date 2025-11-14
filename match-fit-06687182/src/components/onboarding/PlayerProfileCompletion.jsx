import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

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
      const response = await base44.functions.invoke('getTeamMembers');
      const teamMembers = response.data.teamMembers;
      
      const taken = teamMembers
        .filter(member => member.team_role === "player" && member.jersey_number && member.id !== user.id)
        .map(member => member.jersey_number);
      
      setTakenJerseyNumbers(taken);
    } catch (error) {
      console.error("Error loading team jersey numbers:", error);
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
      await base44.auth.logout();
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
        jersey_number: playerData.jersey_number,
        date_of_birth: playerData.date_of_birth,
        height: heightString,
        weight: cleanWeight,
        nationality: playerData.nationality,
        phone: fullPhoneNumber
      };

      if (playerData.first_name && playerData.last_name) {
        updateData.full_name = `${playerData.first_name} ${playerData.last_name}`;
      }
      
      await base44.auth.updateMe(updateData);
      toast.success("Profile updated successfully!");
      onComplete();
    } catch (error) {
      console.error("Error updating player profile:", error);
      toast.error("There was an error saving your information. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const hasErrors = firstNameError || lastNameError || positionError || jerseyError || 
                    dateOfBirthError || heightError || weightError || nationalityError || phoneError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-48 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png" alt="MatchFit Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Player Profile</h1>
          <p className="text-gray-600">
            Now that you've joined a team, let's finish setting up your player profile.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={playerData.first_name}
                    onChange={(e) => handlePlayerDataChange("first_name", e.target.value)}
                    placeholder="John"
                    className={firstNameError ? "border-red-500" : ""}
                    required
                  />
                  {firstNameError && (
                    <p className="text-xs text-red-500">{firstNameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={playerData.last_name}
                    onChange={(e) => handlePlayerDataChange("last_name", e.target.value)}
                    placeholder="Doe"
                    className={lastNameError ? "border-red-500" : ""}
                    required
                  />
                  {lastNameError && (
                    <p className="text-xs text-red-500">{lastNameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select 
                    value={playerData.position} 
                    onValueChange={(value) => handlePlayerDataChange("position", value)}
                    required
                  >
                    <SelectTrigger className={positionError ? "border-red-500" : ""}>
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
                  <Label htmlFor="jersey_number">Jersey Number *</Label>
                  <Input
                    id="jersey_number"
                    type="number"
                    min="1"
                    max="99"
                    value={playerData.jersey_number}
                    onChange={(e) => handlePlayerDataChange("jersey_number", parseInt(e.target.value) || "")}
                    placeholder="e.g., 10"
                    className={jerseyError ? "border-red-500" : ""}
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
                  <Label>Phone Number *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={playerData.country_code} 
                      onValueChange={(value) => handlePlayerDataChange("country_code", value)}
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
                      value={playerData.local_phone_number}
                      onChange={(e) => handlePlayerDataChange("local_phone_number", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={playerData.date_of_birth}
                    onChange={(e) => handlePlayerDataChange("date_of_birth", e.target.value)}
                    className={dateOfBirthError ? "border-red-500" : ""}
                    required
                  />
                  {dateOfBirthError && (
                    <p className="text-xs text-red-500">{dateOfBirthError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Height *</Label>
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
                        className={heightError ? "border-red-500" : ""}
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
                        className={heightError ? "border-red-500" : ""}
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
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    value={playerData.weight}
                    onChange={(e) => handlePlayerDataChange("weight", e.target.value)}
                    placeholder="e.g., 165"
                    className={weightError ? "border-red-500" : ""}
                    required
                  />
                  {weightError ? (
                    <p className="text-xs text-red-500">{weightError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Enter weight in pounds</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Select 
                    value={playerData.nationality} 
                    onValueChange={(value) => handlePlayerDataChange("nationality", value)}
                    required
                  >
                    <SelectTrigger id="nationality" className={nationalityError ? "border-red-500" : ""}>
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

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white"
                  disabled={isSubmitting || hasErrors}
                >
                  {isSubmitting ? "Completing Profile..." : "Complete Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}