/**
 * Service pour gérer les événements de calendrier ajoutés manuellement
 */

import { type CalendarEvent } from "./EmailService";

const STORAGE_KEY = "nara_calendar_events";

class CalendarEventService {
  /**
   * Récupère tous les événements ajoutés manuellement
   */
  getManualEvents(): CalendarEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const events = JSON.parse(stored);
      // Convertir les dates string en Date objects
      return events.map((event: any) => ({
        ...event,
        date: new Date(event.date),
      }));
    } catch (err) {
      console.error("Erreur lors de la récupération des événements:", err);
      return [];
    }
  }

  /**
   * Ajoute un nouvel événement
   */
  addEvent(event: Omit<CalendarEvent, "id">): CalendarEvent {
    const events = this.getManualEvents();
    const newEvent: CalendarEvent = {
      ...event,
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
    
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  /**
   * Supprime un événement
   */
  removeEvent(eventId: string): void {
    const events = this.getManualEvents();
    const filtered = events.filter((e) => e.id !== eventId);
    this.saveEvents(filtered);
  }

  /**
   * Sauvegarde les événements dans localStorage
   */
  private saveEvents(events: CalendarEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des événements:", err);
    }
  }
}

export default new CalendarEventService();

