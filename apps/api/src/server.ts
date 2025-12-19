import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  insuranceProvider?: string;
  insuranceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  department: string;
  date: string;
  duration: number;
  type: "checkup" | "followup" | "emergency" | "consultation" | "procedure";
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory data stores
const patients: Map<string, Patient> = new Map();
const appointments: Map<string, Appointment> = new Map();

// Initialize with mock data
const initializeMockData = () => {
  const mockPatients: Patient[] = [
    {
      id: "P001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1985-03-15",
      gender: "male",
      email: "john.doe@example.com",
      phone: "+1-555-0101",
      address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        country: "USA",
      },
      emergencyContact: {
        name: "Jane Doe",
        relationship: "Spouse",
        phone: "+1-555-0102",
      },
      bloodType: "O+",
      allergies: ["Penicillin", "Peanuts"],
      chronicConditions: ["Hypertension"],
      insuranceProvider: "Blue Cross",
      insuranceNumber: "BC123456789",
      createdAt: "2023-01-10T08:00:00Z",
      updatedAt: "2025-01-15T10:30:00Z",
    },
    {
      id: "P002",
      firstName: "Sarah",
      lastName: "Johnson",
      dateOfBirth: "1992-07-22",
      gender: "female",
      email: "sarah.j@example.com",
      phone: "+1-555-0201",
      address: {
        street: "456 Oak Ave",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        country: "USA",
      },
      emergencyContact: {
        name: "Michael Johnson",
        relationship: "Father",
        phone: "+1-555-0202",
      },
      bloodType: "A+",
      allergies: [],
      chronicConditions: ["Asthma"],
      insuranceProvider: "Aetna",
      insuranceNumber: "AE987654321",
      createdAt: "2023-05-20T09:00:00Z",
      updatedAt: "2025-03-10T14:20:00Z",
    },
  ];

  mockPatients.forEach((p) => patients.set(p.id, p));

  const mockAppointments: Appointment[] = [
    {
      id: "A001",
      patientId: "P001",
      providerId: "DR001",
      providerName: "Dr. Smith",
      department: "Cardiology",
      date: "2025-12-20T09:00:00Z",
      duration: 30,
      type: "followup",
      status: "scheduled",
      notes: "Follow-up for hypertension management",
      createdAt: "2025-11-20T08:00:00Z",
      updatedAt: "2025-11-20T08:00:00Z",
    },
    {
      id: "A002",
      patientId: "P002",
      providerId: "DR002",
      providerName: "Dr. Williams",
      department: "Pulmonology",
      date: "2025-12-22T14:00:00Z",
      duration: 45,
      type: "checkup",
      status: "confirmed",
      createdAt: "2025-11-22T10:00:00Z",
      updatedAt: "2025-11-25T09:00:00Z",
    },
    {
      id: "A003",
      patientId: "P001",
      providerId: "DR003",
      providerName: "Dr. Garcia",
      department: "General Practice",
      date: "2025-12-28T11:00:00Z",
      duration: 60,
      type: "consultation",
      status: "scheduled",
      notes: "Annual checkup",
      createdAt: "2025-11-15T12:00:00Z",
      updatedAt: "2025-11-26T10:00:00Z",
    },
  ];

  mockAppointments.forEach((a) => appointments.set(a.id, a));
};

// Helper functions
const generateId = (prefix: string): string => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

export const createServer = (): Express => {
  const app = express();

  initializeMockData();

  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/status", (_, res) => {
      return res.json({ ok: true });
    })

    // PATIENT ENDPOINTS
    .get("/api/patients", (req, res) => {
      const { search, gender, limit } = req.query;
      let patientList = Array.from(patients.values());

      if (search) {
        const searchLower = (search as string).toLowerCase();
        patientList = patientList.filter(
          (p) =>
            p.firstName.toLowerCase().includes(searchLower) ||
            p.lastName.toLowerCase().includes(searchLower) ||
            p.email.toLowerCase().includes(searchLower) ||
            p.id.toLowerCase().includes(searchLower)
        );
      }

      if (gender) {
        patientList = patientList.filter((p) => p.gender === gender);
      }

      if (limit) {
        patientList = patientList.slice(0, parseInt(limit as string));
      }

      return res.json({ patients: patientList, total: patientList.length });
    })

    .get("/api/patients/:id", (req, res) => {
      const patient = patients.get(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      return res.json(patient);
    })

    .post("/api/patients", (req, res) => {
      const newPatient: Patient = {
        id: generateId("P"),
        ...req.body,
        allergies: req.body.allergies || [],
        chronicConditions: req.body.chronicConditions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      patients.set(newPatient.id, newPatient);
      return res.status(201).json(newPatient);
    })

    .put("/api/patients/:id", (req, res) => {
      const patient = patients.get(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      const updatedPatient = {
        ...patient,
        ...req.body,
        id: patient.id,
        createdAt: patient.createdAt,
        updatedAt: new Date().toISOString(),
      };
      patients.set(req.params.id, updatedPatient);
      return res.json(updatedPatient);
    })

    .delete("/api/patients/:id", (req, res) => {
      if (!patients.has(req.params.id)) {
        return res.status(404).json({ error: "Patient not found" });
      }
      patients.delete(req.params.id);
      return res.status(204).send();
    })

    // APPOINTMENT ENDPOINTS
    .get("/api/appointments", (req, res) => {
      const { patientId, status, date } = req.query;
      let appointmentList = Array.from(appointments.values());

      if (patientId) {
        appointmentList = appointmentList.filter(
          (a) => a.patientId === patientId
        );
      }

      if (status) {
        appointmentList = appointmentList.filter((a) => a.status === status);
      }

      if (date) {
        const targetDate = new Date(date as string).toDateString();
        appointmentList = appointmentList.filter(
          (a) => new Date(a.date).toDateString() === targetDate
        );
      }

      appointmentList.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return res.json({
        appointments: appointmentList,
        total: appointmentList.length,
      });
    })

    .get("/api/appointments/:id", (req, res) => {
      const appointment = appointments.get(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      return res.json(appointment);
    })

    .post("/api/appointments", (req, res) => {
      if (!patients.has(req.body.patientId)) {
        return res.status(404).json({ error: "Patient not found" });
      }
      const newAppointment: Appointment = {
        id: generateId("A"),
        ...req.body,
        status: req.body.status || "scheduled",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      appointments.set(newAppointment.id, newAppointment);
      return res.status(201).json(newAppointment);
    })

    .put("/api/appointments/:id", (req, res) => {
      const appointment = appointments.get(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      const updatedAppointment = {
        ...appointment,
        ...req.body,
        id: appointment.id,
        createdAt: appointment.createdAt,
        updatedAt: new Date().toISOString(),
      };
      appointments.set(req.params.id, updatedAppointment);
      return res.json(updatedAppointment);
    })

    .patch("/api/appointments/:id/cancel", (req, res) => {
      const appointment = appointments.get(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      appointment.status = "cancelled";
      appointment.updatedAt = new Date().toISOString();
      appointments.set(req.params.id, appointment);
      return res.json(appointment);
    })

    .delete("/api/appointments/:id", (req, res) => {
      if (!appointments.has(req.params.id)) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      appointments.delete(req.params.id);
      return res.status(204).send();
    });

  return app;
};
