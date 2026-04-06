export interface CostInput {
  saasPerUser: number;
  users: number;
  selfHostedMonthly: number;
  setupCost: number;
  startDate: Date | null;
  quitDate: Date | null;
  hasSelfHostedCost?: boolean;
}

export interface SubscriptionInput extends CostInput {
  id: string;
  name: string;
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
  const { saasPerUser, users, quitDate } = input;
  const hasSelfHostedCost = input.hasSelfHostedCost !== false;
  const selfHostedMonthly = hasSelfHostedCost ? input.selfHostedMonthly : 0;
  const setupCost = hasSelfHostedCost ? input.setupCost : 0;
  
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

export function calculateAggregatedProjections(
  inputs: CostInput[],
  monthsToProject: number = 60
): ProjectionData[] {
  if (inputs.length === 0) {
    return calculateProjections({
      saasPerUser: 0,
      users: 0,
      selfHostedMonthly: 0,
      setupCost: 0,
      startDate: null,
      quitDate: null,
      hasSelfHostedCost: true,
    }, monthsToProject);
  }

  const allProjections = inputs.map(input => calculateProjections(input, monthsToProject));
  const aggregated: ProjectionData[] = [];

  for (let m = 0; m <= monthsToProject; m++) {
    let saasCumulative = 0;
    let selfHostedCumulative = 0;

    for (const proj of allProjections) {
      saasCumulative += proj[m].saasCumulative;
      selfHostedCumulative += proj[m].selfHostedCumulative;
    }

    const year = Math.floor(m / 12);
    const monthRemainder = m % 12;
    const label = m === 0 ? "Start" : monthRemainder === 0 ? `Year ${year}` : `M${m}`;

    aggregated.push({
      month: m,
      label,
      saasCumulative,
      selfHostedCumulative,
      savings: saasCumulative - selfHostedCumulative,
    });
  }

  return aggregated;
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

  const hasSelfHostedCost = input.hasSelfHostedCost !== false;
  const selfHostedMonthly = hasSelfHostedCost ? input.selfHostedMonthly : 0;
  const setupCost = hasSelfHostedCost ? input.setupCost : 0;

  const saasMonthly = input.saasPerUser * input.users;
  const totalSaasCost = saasMonthly * monthsDifference;
  const totalSelfHostedCost = setupCost + (selfHostedMonthly * monthsDifference);

  return Math.max(0, totalSaasCost - totalSelfHostedCost);
}

export function calculateTotalPastSavings(inputs: CostInput[]): number {
  return inputs.reduce((total, input) => total + calculatePastSavings(input), 0);
}

/**
 * Calculate how much the user has historically spent on a subscription.
 * From startDate to quitDate (if migrated) or to now (if still active).
 */
export function calculateHistoricalSpend(input: CostInput): number {
  if (!input.startDate) return 0;
  
  const start = new Date(input.startDate);
  const end = input.quitDate ? new Date(input.quitDate) : new Date();
  
  if (start >= end) return 0;
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months <= 0) return 0;
  
  return (input.saasPerUser * input.users) * months;
}

export function calculateTotalHistoricalSpend(inputs: CostInput[]): number {
  return inputs.reduce((total, input) => total + calculateHistoricalSpend(input), 0);
}

/**
 * Projects what the user is ACTUALLY paying each month going forward:
 * - For migrated (quitDate set) apps: self-hosted monthly cost (or 0 if shared)
 * - For active apps: full SaaS monthly cost (still being paid)
 * This contrasts with 'calculateAggregatedProjections' which assumes EVERYTHING is migrated from day 1.
 */
export function calculateActualCostProjections(
  inputs: CostInput[],
  monthsToProject: number = 60
): ProjectionData[] {
  const aggregated: ProjectionData[] = [];

  for (let m = 0; m <= monthsToProject; m++) {
    let actualCumulative = 0;
    let saasCumulative = 0;

    for (const input of inputs) {
      const saasMonthly = input.saasPerUser * input.users;
      const hasSelfHostedCost = input.hasSelfHostedCost !== false;
      const selfHostedMonthly = hasSelfHostedCost ? input.selfHostedMonthly : 0;
      const setupCost = hasSelfHostedCost ? input.setupCost : 0;

      // What you'd have paid if you never migrated anything
      saasCumulative += saasMonthly * m;

      if (input.quitDate) {
        // Migrated app: pay setup cost once, then self-hosted monthly going forward
        actualCumulative += setupCost + selfHostedMonthly * m;
      } else {
        // Active app: still paying SaaS every month
        actualCumulative += saasMonthly * m;
      }
    }

    const year = Math.floor(m / 12);
    const monthRemainder = m % 12;
    const label = m === 0 ? "Start" : monthRemainder === 0 ? `Year ${year}` : `M${m}`;

    aggregated.push({
      month: m,
      label,
      saasCumulative,
      selfHostedCumulative: actualCumulative,
      savings: saasCumulative - actualCumulative,
    });
  }

  return aggregated;
}
