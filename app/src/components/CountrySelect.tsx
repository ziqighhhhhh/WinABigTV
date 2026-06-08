import { useMemo } from "react";
import { getNames, registerLocale } from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import frLocale from "i18n-iso-countries/langs/fr.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

registerLocale(enLocale);
registerLocale(frLocale);

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  lang?: "en" | "fr";
  placeholder?: string;
}

export default function CountrySelect({
  value,
  onChange,
  lang = "en",
  placeholder = "Select country",
}: CountrySelectProps) {
  const countries = useMemo(() => {
    return Object.entries(getNames(lang))
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [lang]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 border-gray-200">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
