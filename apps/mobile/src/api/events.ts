import { demoEvents, Event } from "../data/demoEvents";

/**
 * For now: returns demo events.
 * Later: replace this function with GET /events?groupId&from&to using axios.
 */
export async function fetchEventsForToday(): Promise<Event[]> {
  return demoEvents;
}