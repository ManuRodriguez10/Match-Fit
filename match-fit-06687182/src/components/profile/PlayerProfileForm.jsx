import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
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

export default function PlayerProfileForm({ user, onUpdate }) {
  // Parse existing height value to separate feet and inches
  const parseHeight = (height) => {
    if (!height) return { feet: "", inches: "" };
    const match = height.match(/^(\d)'(\d{1,2})"?$/);
    if (match) {
      return { feet: match[1], inches: match[2] };
    }
    return { feet: "", inches: "" };
  };

  const existingHeight = parseHeight(user.height);
  const { countryCode: initialCountryCode, localNumber: initialLocalNumber } = parsePhoneNumber(user.phone);

  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    position: user.position || "",
    jersey_number: user.jersey_number || "",
    country_code: initialCountryCode,
    local_phone_number: initialLocalNumber,
    date_of_birth: user.date_of_birth || "",
    height_feet: existingHeight.feet,
    height_inches: existingHeight.inches,
    weight: user.weight || "",
    nationality: user.nationality || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");

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
    if (!feet && !inches) return ""; // Allow empty if both are empty

    const feetNum = parseInt(feet) || 0;
    const inchesNum = parseInt(inches) || 0;

    // If only one field is filled, or if both are filled but outside range
    if ((feet && (feetNum < 3 || feetNum > 8)) || (!feet && inches && inchesNum > 0)) {
        return "Feet must be between 3 and 8";
    }

    if ((inches && (inchesNum < 0 || inchesNum > 11)) || (!inches && feet && feetNum > 0)) {
        return "Inches must be between 0 and 11";
    }

    return "";
  };

  const validateWeight = (weight) => {
    if (!weight.trim()) return "";

    // Remove "lbs" or "lb" if user typed it
    const cleanWeight = weight.replace(/\s*(lbs?|pounds?)\s*$/i, "").trim();
    const weightNum = parseFloat(cleanWeight);

    if (isNaN(weightNum)) {
      return "Please enter a valid number";
    }

    // Reasonable range: 50-400 lbs
    if (weightNum < 50 || weightNum > 400) {
      return "Weight must be between 50 and 400 lbs";
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

    if (field === "height_feet" || field === "height_inches") {
      const feet = field === "height_feet" ? value : formData.height_feet;
      const inches = field === "height_inches" ? value : formData.height_inches;
      const error = validateHeight(feet, inches);
      setHeightError(error);
    }

    if (field === "weight") {
      const error = validateWeight(value);
      setWeightError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number
    const phoneValidation = validatePhoneNumber(formData.country_code, formData.local_phone_number);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      toast.error(phoneValidation);
      return;
    }

    // Validate height
    const heightValidation = validateHeight(formData.height_feet, formData.height_inches);
    if (heightValidation) {
      setHeightError(heightValidation);
      toast.error(heightValidation);
      return;
    }

    // Validate weight
    const weightValidation = validateWeight(formData.weight);
    if (weightValidation) {
      setWeightError(weightValidation);
      toast.error(weightValidation);
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = { ...formData };

      // Clean weight value (remove "lbs" if user added it)
      updateData.weight = formData.weight.replace(/\s*(lbs?|pounds?)\s*$/i, "").trim();

      // Combine height into format "X'Y"
      updateData.height = `${formData.height_feet}'${formData.height_inches}`;

      // Combine phone number
      updateData.phone = `${formData.country_code}${formData.local_phone_number.replace(/\D/g, '')}`;

      // Remove the separate fields from update data
      delete updateData.height_feet;
      delete updateData.height_inches;
      delete updateData.country_code;
      delete updateData.local_phone_number;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Update your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-main)] to-[var(--primary-dark)] rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {formData.jersey_number || "?"}
            </div>
            <div>
              <CardTitle className="text-2xl">
                {formData.first_name && formData.last_name
                  ? `${formData.first_name} ${formData.last_name}`
                  : user.email}
              </CardTitle>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
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

            {/* Player Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleInputChange("position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jersey_number">Jersey Number *</Label>
                  <Input
                    id="jersey_number"
                    type="number"
                    min="1"
                    max="99"
                    value={formData.jersey_number}
                    onChange={(e) => handleInputChange("jersey_number", parseInt(e.target.value) || "")}
                    placeholder="e.g., 10"
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

            {/* Physical Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="height_feet"
                      type="number"
                      min="3"
                      max="8"
                      value={formData.height_feet}
                      onChange={(e) => handleInputChange("height_feet", e.target.value)}
                      placeholder="Feet"
                      className={heightError ? "border-red-500" : ""}
                      required
                    />
                    <Input
                      id="height_inches"
                      type="number"
                      min="0"
                      max="11"
                      value={formData.height_inches}
                      onChange={(e) => handleInputChange("height_inches", e.target.value)}
                      placeholder="Inches"
                      className={heightError ? "border-red-500" : ""}
                      required
                    />
                  </div>
                  {heightError ? (
                    <p className="text-xs text-red-500">{heightError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Feet (3-8) and inches (0-11)</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="e.g., 165"
                    className={weightError ? "border-red-500" : ""}
                    required
                  />
                  {weightError ? (
                    <p className="text-xs text-red-500">{weightError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">In pounds</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) => handleInputChange("nationality", value)}
                >
                  <SelectTrigger id="nationality">
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
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || phoneError !== "" || heightError !== "" || weightError !== ""}
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