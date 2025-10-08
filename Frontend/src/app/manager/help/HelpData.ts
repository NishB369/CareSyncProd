// src/data/frontDeskHelp.ts

import { Phone, Mail, Calendar, UserCheck } from "lucide-react";

export const helpItems = [
  {
    icon: Phone,
    title: "Call Patient",
    description: "Contact patient to confirm or reschedule appointment",
    action: "Dial Now",
  },
  {
    icon: Mail,
    title: "Email Template",
    description: "Send standardized confirmation/cancellation email",
    action: "Send Email",
  },
];

export const faqs = [
  {
    question: "How do I add a new doctor to the system?",
    answer:
      "Go to the **Manage Doctors** tab in the sidebar. You can add a doctor in two ways:\n\n" +
      "1. **Single Entry**: Click 'Add Doctor' and fill out the form with their name, specialization, contact, clinic location, and available time slots.\n" +
      "2. **Bulk Upload**: Click 'Upload Sheet' and submit a CSV/Excel file with multiple doctors. The system will validate and import them automatically.",
  },
  {
    question:
      "Where can I find the correct format for the doctor upload sheet?",
    answer:
      "When you open the **Upload Sheet** modal (from the Manage Doctors tab), look for the **? (help) icon** in the top-right corner of the modal. Click it to view formatting guidelines and download a sample template (CSV/Excel) with the correct column structure.",
  },
  {
    question: "What are the rules for canceling or rescheduling appointments?",
    answer:
      "The system enforces the following time-based rules:\n\n" +
      "- **Cancel Appointment**: Allowed only if the appointment is **more than 6 hours away**.\n" +
      "- **Reschedule Appointment**: Allowed only if the appointment is **more than 12 hours away**.\n\n" +
      "As a front desk operator, you can override these rules using the **'Admin Override'** option — but a reason must be logged for audit purposes.",
  },
  {
    question: "How do I handle a patient who wants to change doctors?",
    answer:
      "You can reschedule the appointment and select a new doctor during the rescheduling flow — as long as the new doctor has availability and matches the required specialty. The system will warn you if the specialties don’t align (e.g., switching from Dentist to Cardiologist).",
  },
  {
    question: "Can I edit a doctor’s schedule after they’re added?",
    answer:
      "Yes. Go to **Manage Doctors**, find the doctor, and click 'Edit Schedule'. You can update their weekly availability, add time-off, or mark specific slots as unavailable. Changes apply immediately to the booking calendar.",
  },
  {
    question: "What happens when I cancel an appointment?",
    answer:
      "The appointment status changes to **'CANCELLED'**, and:\n" +
      "- The time slot is freed up for new bookings.\n" +
      "- If the patient provided an email or phone, an automated cancellation notice is sent (if notifications are enabled).\n" +
      "- The action is logged with your operator ID and timestamp for audit compliance.",
  },
];
