/**
 * Returns a dynamic greeting based on the user's current local time:
 * - Before 12:00 PM -> "Good morning"
 * - 12:00 PM to 5:59 PM -> "Good afternoon"
 * - 6:00 PM onward -> "Good evening"
 */
export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}
