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

interface MedicalRecord {
  id: string;
  patientId: string;
  type:
    | "visit"
    | "lab"
    | "imaging"
    | "prescription"
    | "procedure"
    | "vaccination";
  date: string;
  provider: string;
  department: string;
  diagnosis?: string[];
  notes: string;
  attachments?: string[];
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

interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  refillsRemaining: number;
  instructions: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface LabResult {
  id: string;
  patientId: string;
  testType: string;
  testName: string;
  orderedBy: string;
  orderedDate: string;
  completedDate?: string;
  status: "ordered" | "in-progress" | "completed" | "cancelled";
  results?: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag?: "normal" | "high" | "low" | "critical";
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Vital {
  id: string;
  patientId: string;
  recordedDate: string;
  recordedBy: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  createdAt: string;
}

// In-memory data stores
const patients: Map<string, Patient> = new Map();
const medicalRecords: Map<string, MedicalRecord> = new Map();
const appointments: Map<string, Appointment> = new Map();
const prescriptions: Map<string, Prescription> = new Map();
const labResults: Map<string, LabResult> = new Map();
const vitals: Map<string, Vital> = new Map();

// Initialize with mock data
const initializeMockData = () => {
  // Mock Patients
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
    {
      id: "P003",
      firstName: "Michael",
      lastName: "Chen",
      dateOfBirth: "1978-11-30",
      gender: "male",
      email: "m.chen@example.com",
      phone: "+1-555-0301",
      address: {
        street: "789 Pine Rd",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "USA",
      },
      emergencyContact: {
        name: "Lisa Chen",
        relationship: "Spouse",
        phone: "+1-555-0302",
      },
      bloodType: "B+",
      allergies: ["Latex"],
      chronicConditions: ["Type 2 Diabetes"],
      insuranceProvider: "UnitedHealthcare",
      insuranceNumber: "UH555666777",
      createdAt: "2022-08-15T11:00:00Z",
      updatedAt: "2025-02-28T16:45:00Z",
    },
  ];

  mockPatients.forEach((p) => patients.set(p.id, p));

  // Mock Medical Records
  const mockRecords: MedicalRecord[] = [
    {
      id: "MR001",
      patientId: "P001",
      type: "visit",
      date: "2025-11-15T10:00:00Z",
      provider: "Dr. Smith",
      department: "General Practice",
      diagnosis: ["Essential Hypertension"],
      notes:
        "Regular checkup. Blood pressure slightly elevated. Adjusted medication dosage.",
      createdAt: "2025-11-15T10:30:00Z",
      updatedAt: "2025-11-15T10:30:00Z",
    },
    {
      id: "MR002",
      patientId: "P001",
      type: "lab",
      date: "2025-11-15T11:00:00Z",
      provider: "Dr. Smith",
      department: "Laboratory",
      notes: "Complete Blood Count ordered",
      createdAt: "2025-11-15T11:00:00Z",
      updatedAt: "2025-11-15T11:00:00Z",
    },
    {
      id: "MR003",
      patientId: "P002",
      type: "visit",
      date: "2025-10-20T14:00:00Z",
      provider: "Dr. Williams",
      department: "Pulmonology",
      diagnosis: ["Asthma - controlled"],
      notes:
        "Asthma well controlled with current medication. Continue current treatment plan.",
      createdAt: "2025-10-20T14:30:00Z",
      updatedAt: "2025-10-20T14:30:00Z",
    },
  ];

  mockRecords.forEach((r) => medicalRecords.set(r.id, r));

  // Mock Appointments
  const mockAppointments: Appointment[] = [
    {
      id: "A001",
      patientId: "P001",
      providerId: "DR001",
      providerName: "Dr. Smith",
      department: "Cardiology",
      date: "2025-12-05T09:00:00Z",
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
      date: "2025-12-10T14:00:00Z",
      duration: 45,
      type: "checkup",
      status: "confirmed",
      createdAt: "2025-11-22T10:00:00Z",
      updatedAt: "2025-11-25T09:00:00Z",
    },
    {
      id: "A003",
      patientId: "P003",
      providerId: "DR003",
      providerName: "Dr. Garcia",
      department: "Endocrinology",
      date: "2025-11-28T11:00:00Z",
      duration: 60,
      type: "consultation",
      status: "confirmed",
      notes: "Diabetes management consultation",
      createdAt: "2025-11-15T12:00:00Z",
      updatedAt: "2025-11-26T10:00:00Z",
    },
  ];

  mockAppointments.forEach((a) => appointments.set(a.id, a));

  // Mock Prescriptions
  const mockPrescriptions: Prescription[] = [
    {
      id: "RX001",
      patientId: "P001",
      medication: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Smith",
      prescribedDate: "2025-11-15T10:30:00Z",
      startDate: "2025-11-15",
      refillsRemaining: 3,
      instructions: "Take in the morning with food",
      status: "active",
      createdAt: "2025-11-15T10:30:00Z",
      updatedAt: "2025-11-15T10:30:00Z",
    },
    {
      id: "RX002",
      patientId: "P002",
      medication: "Albuterol Inhaler",
      dosage: "90mcg",
      frequency: "As needed",
      prescribedBy: "Dr. Williams",
      prescribedDate: "2025-10-20T14:30:00Z",
      startDate: "2025-10-20",
      refillsRemaining: 5,
      instructions:
        "Use as needed for asthma symptoms. 2 puffs every 4-6 hours as needed.",
      status: "active",
      createdAt: "2025-10-20T14:30:00Z",
      updatedAt: "2025-10-20T14:30:00Z",
    },
    {
      id: "RX003",
      patientId: "P003",
      medication: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Garcia",
      prescribedDate: "2025-09-10T11:00:00Z",
      startDate: "2025-09-10",
      refillsRemaining: 2,
      instructions: "Take with meals to reduce stomach upset",
      status: "active",
      createdAt: "2025-09-10T11:00:00Z",
      updatedAt: "2025-09-10T11:00:00Z",
    },
  ];

  mockPrescriptions.forEach((p) => prescriptions.set(p.id, p));

  // Mock Lab Results
  const mockLabResults: LabResult[] = [
    {
      id: "LAB001",
      patientId: "P001",
      testType: "Blood Test",
      testName: "Complete Blood Count",
      orderedBy: "Dr. Smith",
      orderedDate: "2025-11-15T11:00:00Z",
      completedDate: "2025-11-16T09:00:00Z",
      status: "completed",
      results: [
        {
          parameter: "White Blood Cells",
          value: "7.5",
          unit: "K/uL",
          referenceRange: "4.5-11.0",
          flag: "normal",
        },
        {
          parameter: "Red Blood Cells",
          value: "4.8",
          unit: "M/uL",
          referenceRange: "4.5-5.9",
          flag: "normal",
        },
        {
          parameter: "Hemoglobin",
          value: "14.5",
          unit: "g/dL",
          referenceRange: "13.5-17.5",
          flag: "normal",
        },
        {
          parameter: "Platelets",
          value: "250",
          unit: "K/uL",
          referenceRange: "150-400",
          flag: "normal",
        },
      ],
      createdAt: "2025-11-15T11:00:00Z",
      updatedAt: "2025-11-16T09:00:00Z",
    },
    {
      id: "LAB002",
      patientId: "P003",
      testType: "Blood Test",
      testName: "HbA1c",
      orderedBy: "Dr. Garcia",
      orderedDate: "2025-11-10T10:00:00Z",
      completedDate: "2025-11-11T14:00:00Z",
      status: "completed",
      results: [
        {
          parameter: "HbA1c",
          value: "6.8",
          unit: "%",
          referenceRange: "<5.7",
          flag: "high",
        },
      ],
      notes: "Indicates good diabetes control",
      createdAt: "2025-11-10T10:00:00Z",
      updatedAt: "2025-11-11T14:00:00Z",
    },
  ];

  mockLabResults.forEach((l) => labResults.set(l.id, l));

  // Mock Vitals
  const mockVitals: Vital[] = [
    {
      id: "V001",
      patientId: "P001",
      recordedDate: "2025-11-15T10:00:00Z",
      recordedBy: "Nurse Williams",
      bloodPressure: { systolic: 135, diastolic: 85 },
      heartRate: 72,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 180,
      height: 70,
      bmi: 25.8,
      createdAt: "2025-11-15T10:00:00Z",
    },
    {
      id: "V002",
      patientId: "P002",
      recordedDate: "2025-10-20T14:00:00Z",
      recordedBy: "Nurse Johnson",
      bloodPressure: { systolic: 118, diastolic: 76 },
      heartRate: 68,
      temperature: 98.4,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      weight: 135,
      height: 65,
      bmi: 22.5,
      createdAt: "2025-10-20T14:00:00Z",
    },
    {
      id: "V003",
      patientId: "P003",
      recordedDate: "2025-11-10T10:00:00Z",
      recordedBy: "Nurse Martinez",
      bloodPressure: { systolic: 128, diastolic: 82 },
      heartRate: 75,
      temperature: 98.5,
      respiratoryRate: 15,
      oxygenSaturation: 97,
      weight: 195,
      height: 68,
      bmi: 29.6,
      createdAt: "2025-11-10T10:00:00Z",
    },
  ];

  mockVitals.forEach((v) => vitals.set(v.id, v));
};

// Helper functions
const generateId = (prefix: string): string => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

export const createServer = (): Express => {
  const app = express();

  // Initialize mock data
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
    // Get all patients
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

    // Get patient by ID
    .get("/api/patients/:id", (req, res) => {
      const patient = patients.get(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      return res.json(patient);
    })

    // Create new patient
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

    // Update patient
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

    // Delete patient
    .delete("/api/patients/:id", (req, res) => {
      if (!patients.has(req.params.id)) {
        return res.status(404).json({ error: "Patient not found" });
      }
      patients.delete(req.params.id);
      return res.status(204).send();
    })

    // MEDICAL RECORDS ENDPOINTS
    // Get all medical records for a patient
    .get("/api/patients/:patientId/records", (req, res) => {
      const { type } = req.query;
      let records = Array.from(medicalRecords.values()).filter(
        (r) => r.patientId === req.params.patientId
      );

      if (type) {
        records = records.filter((r) => r.type === type);
      }

      records.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return res.json({ records, total: records.length });
    })

    // Get specific medical record
    .get("/api/records/:id", (req, res) => {
      const record = medicalRecords.get(req.params.id);
      if (!record) {
        return res.status(404).json({ error: "Medical record not found" });
      }
      return res.json(record);
    })

    // Create medical record
    .post("/api/patients/:patientId/records", (req, res) => {
      if (!patients.has(req.params.patientId)) {
        return res.status(404).json({ error: "Patient not found" });
      }
      const newRecord: MedicalRecord = {
        id: generateId("MR"),
        patientId: req.params.patientId,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      medicalRecords.set(newRecord.id, newRecord);
      return res.status(201).json(newRecord);
    })

    // Update medical record
    .put("/api/records/:id", (req, res) => {
      const record = medicalRecords.get(req.params.id);
      if (!record) {
        return res.status(404).json({ error: "Medical record not found" });
      }
      const updatedRecord = {
        ...record,
        ...req.body,
        id: record.id,
        patientId: record.patientId,
        createdAt: record.createdAt,
        updatedAt: new Date().toISOString(),
      };
      medicalRecords.set(req.params.id, updatedRecord);
      return res.json(updatedRecord);
    })

    // Delete medical record
    .delete("/api/records/:id", (req, res) => {
      if (!medicalRecords.has(req.params.id)) {
        return res.status(404).json({ error: "Medical record not found" });
      }
      medicalRecords.delete(req.params.id);
      return res.status(204).send();
    })

    // APPOINTMENT ENDPOINTS
    // Get all appointments
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

    // Get appointment by ID
    .get("/api/appointments/:id", (req, res) => {
      const appointment = appointments.get(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      return res.json(appointment);
    })

    // Create appointment
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

    // Update appointment
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

    // Cancel appointment
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

    // Delete appointment
    .delete("/api/appointments/:id", (req, res) => {
      if (!appointments.has(req.params.id)) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      appointments.delete(req.params.id);
      return res.status(204).send();
    })

    // PRESCRIPTION ENDPOINTS
    // Get all prescriptions for a patient
    .get("/api/patients/:patientId/prescriptions", (req, res) => {
      const { status } = req.query;
      let prescriptionList = Array.from(prescriptions.values()).filter(
        (p) => p.patientId === req.params.patientId
      );

      if (status) {
        prescriptionList = prescriptionList.filter((p) => p.status === status);
      }

      prescriptionList.sort(
        (a, b) =>
          new Date(b.prescribedDate).getTime() -
          new Date(a.prescribedDate).getTime()
      );
      return res.json({
        prescriptions: prescriptionList,
        total: prescriptionList.length,
      });
    })

    // Get prescription by ID
    .get("/api/prescriptions/:id", (req, res) => {
      const prescription = prescriptions.get(req.params.id);
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      return res.json(prescription);
    })

    // Create prescription
    .post("/api/patients/:patientId/prescriptions", (req, res) => {
      if (!patients.has(req.params.patientId)) {
        return res.status(404).json({ error: "Patient not found" });
      }
      const newPrescription: Prescription = {
        id: generateId("RX"),
        patientId: req.params.patientId,
        ...req.body,
        status: req.body.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      prescriptions.set(newPrescription.id, newPrescription);
      return res.status(201).json(newPrescription);
    })

    // Update prescription
    .put("/api/prescriptions/:id", (req, res) => {
      const prescription = prescriptions.get(req.params.id);
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      const updatedPrescription = {
        ...prescription,
        ...req.body,
        id: prescription.id,
        patientId: prescription.patientId,
        createdAt: prescription.createdAt,
        updatedAt: new Date().toISOString(),
      };
      prescriptions.set(req.params.id, updatedPrescription);
      return res.json(updatedPrescription);
    })

    // Refill prescription
    .patch("/api/prescriptions/:id/refill", (req, res) => {
      const prescription = prescriptions.get(req.params.id);
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      if (prescription.refillsRemaining <= 0) {
        return res.status(400).json({ error: "No refills remaining" });
      }
      prescription.refillsRemaining -= 1;
      prescription.updatedAt = new Date().toISOString();
      prescriptions.set(req.params.id, prescription);
      return res.json(prescription);
    })

    // Delete prescription
    .delete("/api/prescriptions/:id", (req, res) => {
      if (!prescriptions.has(req.params.id)) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      prescriptions.delete(req.params.id);
      return res.status(204).send();
    })

    // LAB RESULTS ENDPOINTS
    // Get all lab results for a patient
    .get("/api/patients/:patientId/labs", (req, res) => {
      const { status, testType } = req.query;
      let labList = Array.from(labResults.values()).filter(
        (l) => l.patientId === req.params.patientId
      );

      if (status) {
        labList = labList.filter((l) => l.status === status);
      }

      if (testType) {
        labList = labList.filter((l) => l.testType === testType);
      }

      labList.sort(
        (a, b) =>
          new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime()
      );
      return res.json({ labResults: labList, total: labList.length });
    })

    // Get lab result by ID
    .get("/api/labs/:id", (req, res) => {
      const lab = labResults.get(req.params.id);
      if (!lab) {
        return res.status(404).json({ error: "Lab result not found" });
      }
      return res.json(lab);
    })

    // Create lab order
    .post("/api/patients/:patientId/labs", (req, res) => {
      if (!patients.has(req.params.patientId)) {
        return res.status(404).json({ error: "Patient not found" });
      }
      const newLab: LabResult = {
        id: generateId("LAB"),
        patientId: req.params.patientId,
        ...req.body,
        status: req.body.status || "ordered",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      labResults.set(newLab.id, newLab);
      return res.status(201).json(newLab);
    })

    // Update lab result
    .put("/api/labs/:id", (req, res) => {
      const lab = labResults.get(req.params.id);
      if (!lab) {
        return res.status(404).json({ error: "Lab result not found" });
      }
      const updatedLab = {
        ...lab,
        ...req.body,
        id: lab.id,
        patientId: lab.patientId,
        createdAt: lab.createdAt,
        updatedAt: new Date().toISOString(),
      };
      labResults.set(req.params.id, updatedLab);
      return res.json(updatedLab);
    })

    // Delete lab result
    .delete("/api/labs/:id", (req, res) => {
      if (!labResults.has(req.params.id)) {
        return res.status(404).json({ error: "Lab result not found" });
      }
      labResults.delete(req.params.id);
      return res.status(204).send();
    })

    // VITALS ENDPOINTS
    // Get all vitals for a patient
    .get("/api/patients/:patientId/vitals", (req, res) => {
      const { limit } = req.query;
      let vitalsList = Array.from(vitals.values()).filter(
        (v) => v.patientId === req.params.patientId
      );

      vitalsList.sort(
        (a, b) =>
          new Date(b.recordedDate).getTime() -
          new Date(a.recordedDate).getTime()
      );

      if (limit) {
        vitalsList = vitalsList.slice(0, parseInt(limit as string));
      }

      return res.json({ vitals: vitalsList, total: vitalsList.length });
    })

    // Get vital by ID
    .get("/api/vitals/:id", (req, res) => {
      const vital = vitals.get(req.params.id);
      if (!vital) {
        return res.status(404).json({ error: "Vital record not found" });
      }
      return res.json(vital);
    })

    // Create vital record
    .post("/api/patients/:patientId/vitals", (req, res) => {
      if (!patients.has(req.params.patientId)) {
        return res.status(404).json({ error: "Patient not found" });
      }
      const newVital: Vital = {
        id: generateId("V"),
        patientId: req.params.patientId,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      vitals.set(newVital.id, newVital);
      return res.status(201).json(newVital);
    })

    // Delete vital record
    .delete("/api/vitals/:id", (req, res) => {
      if (!vitals.has(req.params.id)) {
        return res.status(404).json({ error: "Vital record not found" });
      }
      vitals.delete(req.params.id);
      return res.status(204).send();
    })

    // ADDITIONAL UTILITY ENDPOINTS
    // Get patient dashboard summary
    .get("/api/patients/:patientId/dashboard", (req, res) => {
      const patient = patients.get(req.params.patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const patientRecords = Array.from(medicalRecords.values()).filter(
        (r) => r.patientId === req.params.patientId
      );
      const patientAppointments = Array.from(appointments.values()).filter(
        (a) => a.patientId === req.params.patientId && a.status !== "cancelled"
      );
      const patientPrescriptions = Array.from(prescriptions.values()).filter(
        (p) => p.patientId === req.params.patientId && p.status === "active"
      );
      const patientLabs = Array.from(labResults.values()).filter(
        (l) => l.patientId === req.params.patientId
      );
      const patientVitals = Array.from(vitals.values())
        .filter((v) => v.patientId === req.params.patientId)
        .sort(
          (a, b) =>
            new Date(b.recordedDate).getTime() -
            new Date(a.recordedDate).getTime()
        )[0];

      return res.json({
        patient,
        summary: {
          totalRecords: patientRecords.length,
          upcomingAppointments: patientAppointments.filter(
            (a) => new Date(a.date) > new Date()
          ).length,
          activePrescriptions: patientPrescriptions.length,
          pendingLabs: patientLabs.filter((l) => l.status !== "completed")
            .length,
        },
        recentActivity: {
          lastVisit: patientRecords
            .filter((r) => r.type === "visit")
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0],
          nextAppointment: patientAppointments
            .filter((a) => new Date(a.date) > new Date())
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0],
          latestVitals: patientVitals,
        },
      });
    })

    // Search across all entities
    .get("/api/search", (req, res) => {
      const { query, type } = req.query;
      if (!query) {
        return res.status(400).json({ error: "Query parameter required" });
      }

      const searchTerm = (query as string).toLowerCase();
      const results: any = {};

      if (!type || type === "patients") {
        results.patients = Array.from(patients.values()).filter(
          (p) =>
            p.firstName.toLowerCase().includes(searchTerm) ||
            p.lastName.toLowerCase().includes(searchTerm) ||
            p.email.toLowerCase().includes(searchTerm) ||
            p.id.toLowerCase().includes(searchTerm)
        );
      }

      if (!type || type === "appointments") {
        results.appointments = Array.from(appointments.values()).filter(
          (a) =>
            a.providerName.toLowerCase().includes(searchTerm) ||
            a.department.toLowerCase().includes(searchTerm) ||
            a.type.toLowerCase().includes(searchTerm)
        );
      }

      return res.json(results);
    });

  return app;
};
