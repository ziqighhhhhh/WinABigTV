import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ContactType = "phone" | "whatsapp" | "email" | "other";

interface ContactInputProps {
  value: string;
  type: ContactType;
  onChange: (value: string, type: ContactType) => void;
}

export function getContactError(value: string, type: ContactType): string | null {
  if (!value.trim()) return "Required";
  if ((type === "phone" || type === "whatsapp") && !/^\+?\d{7,15}$/.test(value.replace(/\s/g, ""))) {
    return "Please enter a valid phone number";
  }
  if (type === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
    return "Please enter a valid email";
  }
  return null;
}

export default function ContactInput({ value, type, onChange }: ContactInputProps) {
  const error = getContactError(value, type);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={type} onValueChange={(nextType) => onChange(value, nextType as ContactType)}>
          <SelectTrigger className="h-12 w-[136px] border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value, type)}
          placeholder={
            type === "phone" || type === "whatsapp"
              ? "+234 123 456 7890"
              : type === "email"
                ? "example@email.com"
                : "Enter contact info"
          }
          className={`h-12 flex-1 border-gray-200 ${error && value ? "border-red-500" : ""}`}
        />
      </div>
      {error && value ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
