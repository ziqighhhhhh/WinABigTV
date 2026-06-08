import { useMemo, useState } from "react";
import { worldCupTeams } from "@/lib/worldcup-teams";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TeamPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabledTeams: string[];
  placeholder?: string;
}

export default function TeamPicker({
  value,
  onChange,
  disabledTeams,
  placeholder = "Select team",
}: TeamPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedTeam = worldCupTeams.find((team) => team.id === value);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return worldCupTeams;
    return worldCupTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.group.toLowerCase().includes(query)
    );
  }, [search]);

  const handleSelect = (teamId: string) => {
    if (disabledTeams.includes(teamId) && teamId !== value) return;
    onChange(teamId);
    setSearch("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full justify-start border-gray-200 text-left"
        >
          {selectedTeam ? (
            <span>
              {selectedTeam.name}{" "}
              <span className="text-xs text-gray-400">({selectedTeam.group})</span>
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="h-[78dvh] max-h-[78dvh] max-w-md grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden p-4 sm:p-6"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>Select Team</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search team or region..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="shrink-0"
        />
        <div
          className="grid min-h-0 touch-pan-y grid-cols-2 content-start gap-2 overflow-y-scroll overscroll-contain pb-4 pr-1 [-webkit-overflow-scrolling:touch]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {filteredTeams.map((team) => {
            const isDisabled = disabledTeams.includes(team.id) && team.id !== value;
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => handleSelect(team.id)}
                disabled={isDisabled}
                className={`rounded-lg border p-3 text-left text-sm transition-all ${
                  team.id === value
                    ? "border-green-500 bg-green-50"
                    : isDisabled
                      ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{team.name}</div>
                <div className="text-xs text-gray-400">{team.group}</div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
