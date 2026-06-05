export interface Team {
  id: string;
  name: string;
  group: string;
}

// 2026 FIFA World Cup 参赛球队（48支）
// 注意：实际参赛名单以 FIFA 官方公布为准
export const worldCupTeams: Team[] = [
  // A组
  { id: "argentina", name: "Argentina", group: "A" },
  { id: "mexico", name: "Mexico", group: "A" },
  { id: "poland", name: "Poland", group: "A" },
  // B组
  { id: "brazil", name: "Brazil", group: "B" },
  { id: "usa", name: "USA", group: "B" },
  { id: "wales", name: "Wales", group: "B" },
  // C组
  { id: "france", name: "France", group: "C" },
  { id: "denmark", name: "Denmark", group: "C" },
  { id: "tunisia", name: "Tunisia", group: "C" },
  // D组
  { id: "spain", name: "Spain", group: "D" },
  { id: "germany", name: "Germany", group: "D" },
  { id: "japan", name: "Japan", group: "D" },
  // E组
  { id: "belgium", name: "Belgium", group: "E" },
  { id: "croatia", name: "Croatia", group: "E" },
  { id: "morocco", name: "Morocco", group: "E" },
  // F组
  { id: "england", name: "England", group: "F" },
  { id: "netherlands", name: "Netherlands", group: "F" },
  { id: "senegal", name: "Senegal", group: "F" },
  // G组
  { id: "portugal", name: "Portugal", group: "G" },
  { id: "switzerland", name: "Switzerland", group: "G" },
  { id: "cameroon", name: "Cameroon", group: "G" },
  // H组
  { id: "uruguay", name: "Uruguay", group: "H" },
  { id: "ghana", name: "Ghana", group: "H" },
  { id: "korea", name: "South Korea", group: "H" },
  // I组
  { id: "italy", name: "Italy", group: "I" },
  { id: "ecuador", name: "Ecuador", group: "I" },
  { id: "saudi", name: "Saudi Arabia", group: "I" },
  // J组
  { id: "colombia", name: "Colombia", group: "J" },
  { id: "serbia", name: "Serbia", group: "J" },
  { id: "qatar", name: "Qatar", group: "J" },
  // K组
  { id: "iran", name: "Iran", group: "K" },
  { id: "canada", name: "Canada", group: "K" },
  { id: "australia", name: "Australia", group: "K" },
  // L组
  { id: "nigeria", name: "Nigeria", group: "L" },
  { id: "algeria", name: "Algeria", group: "L" },
  { id: "egypt", name: "Egypt", group: "L" },
  // M组
  { id: "ivory", name: "Ivory Coast", group: "M" },
  { id: "chile", name: "Chile", group: "M" },
  { id: "costarica", name: "Costa Rica", group: "M" },
  // N组
  { id: "sweden", name: "Sweden", group: "N" },
  { id: "ukraine", name: "Ukraine", group: "N" },
  { id: "peru", name: "Peru", group: "N" },
];

export function getTeamById(id: string): Team | undefined {
  return worldCupTeams.find(t => t.id === id);
}

export function getTeamNameById(id: string): string {
  return getTeamById(id)?.name || id;
}
