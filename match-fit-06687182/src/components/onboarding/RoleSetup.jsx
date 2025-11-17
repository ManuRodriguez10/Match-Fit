import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, LogOut, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function RoleSetup({ user, onComplete }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [playerData, setPlayerData] = useState({
    first_name: "",
    last_name: "",
    country_code: "+1",
    local_phone_number: ""
  });
  const [coachData, setCoachData] = useState({
    first_name: "",
    last_name: "",
    country_code: "+1",
    local_phone_number: "",
    coach_role: "",
    years_experience: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
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

  const handlePlayerDataChange = (field, value) => {
    setPlayerData(prev => ({ ...prev, [field]: value }));
    
    if (field === "country_code" || field === "local_phone_number") {
      const countryCode = field === "country_code" ? value : playerData.country_code;
      const localNumber = field === "local_phone_number" ? value : playerData.local_phone_number;
      const error = validatePhoneNumber(countryCode, localNumber);
      setPhoneError(error);
    }
  };

  const handleCoachDataChange = (field, value) => {
    setCoachData(prev => ({ ...prev, [field]: value }));
    
    if (field === "country_code" || field === "local_phone_number") {
      const countryCode = field === "country_code" ? value : coachData.country_code;
      const localNumber = field === "local_phone_number" ? value : coachData.local_phone_number;
      const error = validatePhoneNumber(countryCode, localNumber);
      setPhoneError(error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate(createPageUrl("LandingPage"));
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submitting
    const countryCode = selectedRole === "player" ? playerData.country_code : coachData.country_code;
    const localNumber = selectedRole === "player" ? playerData.local_phone_number : coachData.local_phone_number;
    const error = validatePhoneNumber(countryCode, localNumber);
    
    if (error) {
      setPhoneError(error);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = selectedRole === "player" ? playerData : coachData;
      const fullPhoneNumber = `${data.country_code}${data.local_phone_number.replace(/\D/g, '')}`;
      
      const updateData = {
        team_role: selectedRole,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: fullPhoneNumber,
        ...(selectedRole === "coach" ? {
          coach_role: coachData.coach_role,
          years_experience: coachData.years_experience
        } : {})
      };
      
      // Set full_name from first_name and last_name
      if (updateData.first_name && updateData.last_name) {
        updateData.full_name = `${updateData.first_name} ${updateData.last_name}`;
      }
      
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      onComplete();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("There was an error saving your information. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-48 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png" alt="MatchFit Logo" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to MatchFit!</h1>
            <p className="text-gray-600">Let's get you set up. Are you joining as a coach or player?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-[var(--primary-main)]"
              onClick={() => handleRoleSelect("coach")}
            >
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">I'm a Coach</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Manage your team, schedule events, track attendance, and create lineups.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Event scheduling</li>
                  <li>• Roster management</li>
                  <li>• Lineup builder</li>
                  <li>• Team announcements</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-[var(--primary-main)]"
              onClick={() => handleRoleSelect("player")}
            >
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">I'm a Player</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  View team calendar, manage your profile, and check lineups.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Team calendar access</li>
                  <li>• Profile management</li>
                  <li>• View lineups</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Logout Button - Centered at Bottom */}
          <div className="mt-8 text-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-light)] to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-48 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png" alt="MatchFit Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedRole === "coach" ? "Coach Setup" : "Basic Information"}
          </h1>
          <p className="text-gray-600">
            {selectedRole === "coach" 
              ? "Let's complete your profile to get started with your team."
              : "Provide some basic information. You'll complete your full profile after joining a team."}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {phoneError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{phoneError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={selectedRole === "player" ? playerData.first_name : coachData.first_name}
                    onChange={(e) => selectedRole === "player" ? handlePlayerDataChange("first_name", e.target.value) : handleCoachDataChange("first_name", e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={selectedRole === "player" ? playerData.last_name : coachData.last_name}
                    onChange={(e) => selectedRole === "player" ? handlePlayerDataChange("last_name", e.target.value) : handleCoachDataChange("last_name", e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedRole === "player" ? playerData.country_code : coachData.country_code}
                    onValueChange={(value) => selectedRole === "player" ? handlePlayerDataChange("country_code", value) : handleCoachDataChange("country_code", value)}
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
                    value={selectedRole === "player" ? playerData.local_phone_number : coachData.local_phone_number}
                    onChange={(e) => selectedRole === "player" ? handlePlayerDataChange("local_phone_number", e.target.value) : handleCoachDataChange("local_phone_number", e.target.value)}
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

              {selectedRole === "coach" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coach_role">Coach Role *</Label>
                      <Select value={coachData.coach_role} onValueChange={(value) => handleCoachDataChange("coach_role", value)}>
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
                        value={coachData.years_experience}
                        onChange={(e) => handleCoachDataChange("years_experience", parseInt(e.target.value) || "")}
                        placeholder="e.g., 5"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRole("")}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white"
                  disabled={isSubmitting || phoneError !== ""}
                >
                  {isSubmitting ? "Saving..." : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Logout Button - Centered at Bottom */}
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