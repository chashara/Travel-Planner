export const CATEGORY_META = {
  food: { icon: "🍽️", label: "Food" },
  sightseeing: { icon: "📍", label: "Sightseeing" },
  transport: { icon: "🚆", label: "Transport" },
  lodging: { icon: "🏨", label: "Lodging" },
  activity: { icon: "🎟️", label: "Activity" },
  other: { icon: "✨", label: "Other" },
};

export function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

export function sumActivities(activities) {
  return activities.reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0);
}

export function sumTrip(days) {
  return days.reduce((sum, d) => sum + sumActivities(d.activities), 0);
}