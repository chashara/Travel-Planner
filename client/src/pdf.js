export function printItinerary(itinerary) {
  const originalTitle = document.title;
  const name = `${itinerary.trip.city}, ${itinerary.trip.country} - Itinerary`;
  document.title = name;

  const restore = () => {
    document.title = originalTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);

  window.print();
}