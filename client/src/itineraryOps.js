const mapDay = (itinerary, dayId, fn) => ({
  ...itinerary,
  days: itinerary.days.map((d) => (d.id === dayId ? fn(d) : d)),
});

export function updateActivity(itinerary, dayId, activityId, patch) {
  return mapDay(itinerary, dayId, (day) => ({
    ...day,
    activities: day.activities.map((a) => {
      if (a.id !== activityId) return a;
      const { _new, ...clean } = { ...a, ...patch }; // drop the "new" flag once saved
      return clean;
    }),
  }));
}

export function deleteActivity(itinerary, dayId, activityId) {
  return mapDay(itinerary, dayId, (day) => ({
    ...day,
    activities: day.activities.filter((a) => a.id !== activityId),
  }));
}

export function addActivity(itinerary, dayId) {
  const newActivity = {
    id: crypto.randomUUID(),
    time: "12:00",
    title: "",
    description: "",
    category: "activity",
    estimatedCost: 0,
    _new: true, // makes the item open in edit mode
  };
  return mapDay(itinerary, dayId, (day) => ({
    ...day,
    activities: [...day.activities, newActivity],
  }));
}

export function moveActivity(itinerary, dayId, activityId, direction) {
  return mapDay(itinerary, dayId, (day) => {
    const i = day.activities.findIndex((a) => a.id === activityId);
    const j = i + direction;
    if (i === -1 || j < 0 || j >= day.activities.length) return day;
    const activities = [...day.activities];
    [activities[i], activities[j]] = [activities[j], activities[i]];
    return { ...day, activities };
  });
}