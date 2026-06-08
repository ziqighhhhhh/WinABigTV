export interface Team {
  id: string;
  name: string;
  group: string;
}

// 2026 FIFA World Cup qualified teams, verified against FIFA's qualified-team list on 2026-06-08.
// The final draw groups can be updated here when FIFA publishes the A-L group allocation.
export const worldCupTeams: Team[] = [
  { id: "canada", name: "Canada", group: "Host" },
  { id: "mexico", name: "Mexico", group: "Host" },
  { id: "usa", name: "United States", group: "Host" },
  { id: "argentina", name: "Argentina", group: "CONMEBOL" },
  { id: "brazil", name: "Brazil", group: "CONMEBOL" },
  { id: "colombia", name: "Colombia", group: "CONMEBOL" },
  { id: "ecuador", name: "Ecuador", group: "CONMEBOL" },
  { id: "paraguay", name: "Paraguay", group: "CONMEBOL" },
  { id: "uruguay", name: "Uruguay", group: "CONMEBOL" },
  { id: "austria", name: "Austria", group: "UEFA" },
  { id: "belgium", name: "Belgium", group: "UEFA" },
  { id: "croatia", name: "Croatia", group: "UEFA" },
  { id: "czech_republic", name: "Czech Republic", group: "UEFA" },
  { id: "denmark", name: "Denmark", group: "UEFA" },
  { id: "england", name: "England", group: "UEFA" },
  { id: "france", name: "France", group: "UEFA" },
  { id: "germany", name: "Germany", group: "UEFA" },
  { id: "netherlands", name: "Netherlands", group: "UEFA" },
  { id: "norway", name: "Norway", group: "UEFA" },
  { id: "portugal", name: "Portugal", group: "UEFA" },
  { id: "scotland", name: "Scotland", group: "UEFA" },
  { id: "spain", name: "Spain", group: "UEFA" },
  { id: "switzerland", name: "Switzerland", group: "UEFA" },
  { id: "turkey", name: "Turkey", group: "UEFA" },
  { id: "algeria", name: "Algeria", group: "CAF" },
  { id: "cape_verde", name: "Cape Verde", group: "CAF" },
  { id: "cote_d_ivoire", name: "Cote d'Ivoire", group: "CAF" },
  { id: "egypt", name: "Egypt", group: "CAF" },
  { id: "ghana", name: "Ghana", group: "CAF" },
  { id: "morocco", name: "Morocco", group: "CAF" },
  { id: "senegal", name: "Senegal", group: "CAF" },
  { id: "south_africa", name: "South Africa", group: "CAF" },
  { id: "tunisia", name: "Tunisia", group: "CAF" },
  { id: "australia", name: "Australia", group: "AFC" },
  { id: "iran", name: "Iran", group: "AFC" },
  { id: "iraq", name: "Iraq", group: "AFC" },
  { id: "japan", name: "Japan", group: "AFC" },
  { id: "jordan", name: "Jordan", group: "AFC" },
  { id: "qatar", name: "Qatar", group: "AFC" },
  { id: "saudi_arabia", name: "Saudi Arabia", group: "AFC" },
  { id: "south_korea", name: "South Korea", group: "AFC" },
  { id: "uzbekistan", name: "Uzbekistan", group: "AFC" },
  { id: "curacao", name: "Curacao", group: "CONCACAF" },
  { id: "haiti", name: "Haiti", group: "CONCACAF" },
  { id: "panama", name: "Panama", group: "CONCACAF" },
  { id: "new_zealand", name: "New Zealand", group: "OFC" },
  { id: "jamaica", name: "Jamaica", group: "Play-off" },
  { id: "democratic_republic_of_congo", name: "DR Congo", group: "Play-off" },
];

export function getTeamById(id: string): Team | undefined {
  return worldCupTeams.find((team) => team.id === id);
}

export function getTeamNameById(id: string): string {
  return getTeamById(id)?.name || id;
}
