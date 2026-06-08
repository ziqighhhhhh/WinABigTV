import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "sonner";
import BrandLogo from "@/components/BrandLogo";
import ContactInput, { getContactError } from "@/components/ContactInput";
import type { ContactType } from "@/components/ContactInput";
import CountrySelect from "@/components/CountrySelect";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, User } from "lucide-react";

export default function ScanRegister() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "";

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState<ContactType>("phone");

  const handleSubmit = () => {
    const contactError = getContactError(contact, contactType);
    if (!code) {
      toast.error("Missing QR code");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (contactError) {
      toast.error(contactError);
      return;
    }

    localStorage.setItem(
      `scan_register_${code}`,
      JSON.stringify({
        name: name.trim(),
        country,
        contact: contact.trim(),
        contactType,
      })
    );

    navigate(`/survey?code=${code}`);
  };

  const countryLang = i18n.language.startsWith("fr") ? "fr" : "en";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-gray-50 p-4">
      <Toaster position="top-center" />
      <Card className="w-full max-w-md border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardContent className="px-6 pb-8 pt-8">
          <div className="mb-4 flex justify-end">
            <LanguageSwitcher />
          </div>

          <div className="mb-6 text-center">
            <div className="mb-3 flex justify-center">
              <BrandLogo size={58} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Register Your Scan</h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User size={14} /> Your Name
              </Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                className="h-12 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe size={14} /> Country / Region
              </Label>
              <CountrySelect
                value={country}
                onChange={setCountry}
                lang={countryLang}
                placeholder="Select your country"
              />
            </div>

            <div className="space-y-2">
              <Label>Contact Information</Label>
              <ContactInput
                value={contact}
                type={contactType}
                onChange={(nextValue, nextType) => {
                  setContact(nextValue);
                  setContactType(nextType);
                }}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="h-12 w-full rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Continue to Survey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
