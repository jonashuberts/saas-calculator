export interface CostInput {
  saasPerUser: number;
  users: number;
  selfHostedMonthly: number;
  setupCost: number;
  quitDate: Date | null;
}

export interface ProjectionData {
  month: number;
  label: string;
  saasCumulative: number;
  selfHostedCumulative: number;
  savings: number;
}

export function calculateProjections(
  input: CostInput,
  monthsToProject: number = 60
): ProjectionData[] {
  const { saasPerUser, users, selfHostedMonthly, setupCost } = input;
  const saasMonthly = saasPerUser * users;

  const data: ProjectionData[] = [];
  let saasCumulative = 0;
  let selfHostedCumulative = setupCost;

  for (let m = 0; m <= monthsToProject; m++) {
    const year = Math.floor(m / 12);
    const monthRemainder = m % 12;
    const label = m === 0 ? "Start" : monthRemainder === 0 ? `Year ${year}` : `M${m}`;

    data.push({
      month: m,
      label,
      saasCumulative,
      selfHostedCumulative,
      savings: saasCumulative - selfHostedCumulative,
    });

    // Add next month's cost
    saasCumulative += saasMonthly;
    selfHostedCumulative += selfHostedMonthly;
  }

  return data;
}

export function calculatePastSavings(input: CostInput): number {
  if (!input.quitDate) return 0;

  const now = new Date();
  const past = new Date(input.quitDate);
  
  if (past >= now) return 0;

  const monthsDifference =
    (now.getFullYear() - past.getFullYear()) * 12 +
    (now.getMonth() - past.getMonth());

  if (monthsDifference <= 0) return 0;

  const saasMonthly = input.saasPerUser * input.users;
  const totalSaasCost = saasMonthly * monthsDifference;
  const totalSelfHostedCost = input.setupCost + (input.selfHostedMonthly * monthsDifference);

  return Math.max(0, totalSaasCost - totalSelfHostedCost);
}
