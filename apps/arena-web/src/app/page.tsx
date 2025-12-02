"use client";

import { log } from "@repo/logger";
import { useEffect, useState } from "react";

const styles = {
  container: { padding: "20px", maxWidth: "1400px" },
  error: { color: "red", padding: "10px", background: "#fee" },
  layout: { display: "flex", gap: "20px", marginTop: "20px" },
  panel: { border: "1px solid #ccc", padding: "15px" },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ddd",
  },
  list: { maxHeight: "600px", overflow: "auto" },
  patientCard: (selected: boolean) => ({
    padding: "10px",
    margin: "5px 0",
    background: selected ? "#e7f3ff" : "#f9f9f9",
    cursor: "pointer",
    border: "1px solid #ddd",
  }),
  deleteBtn: {
    marginTop: "5px",
    padding: "4px 8px",
    background: "#dc3545",
    color: "white",
    border: "none",
    fontSize: "12px",
    cursor: "pointer",
  },
  apptCard: {
    padding: "10px",
    margin: "5px 0",
    background: "#f0f0f0",
    border: "1px solid #ddd",
  },
  cancelBtn: {
    marginLeft: "10px",
    padding: "4px 8px",
    background: "#ffc107",
    border: "none",
    cursor: "pointer",
  },
  placeholder: { textAlign: "center" as const, padding: "40px", color: "#999" },
};

export default function Page() {
  log("Arena Web - Patient Portal Page Loaded");

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [localCache, setLocalCache] = useState<any>({});

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(() => {
      if (selectedPatient) {
        fetchAppointments(selectedPatient.id);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/patients");
      const data = await res.json();
      setPatients(data.patients);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch patients");
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patientId: string) => {
    if (localCache[patientId]) {
      setSelectedPatient(localCache[patientId].patient);
      setAppointments(localCache[patientId].appointments);
      return;
    }

    try {
      const [patientRes, apptRes] = await Promise.all([
        fetch(`http://localhost:5001/api/patients/${patientId}`),
        fetch(`http://localhost:5001/api/appointments?patientId=${patientId}`),
      ]);

      const patient = await patientRes.json();
      const apptData = await apptRes.json();

      setSelectedPatient(patient);
      setAppointments(apptData.appointments);

      setLocalCache({
        ...localCache,
        [patientId]: { patient, appointments: apptData.appointments },
      });
    } catch (err) {
      alert("Error loading patient details");
    }
  };

  const fetchAppointments = async (patientId: string) => {
    const res = await fetch(
      `http://localhost:5001/api/appointments?patientId=${patientId}`
    );
    const data = await res.json();
    setAppointments(data.appointments);
  };

  const deletePatient = async (id: string) => {
    try {
      await fetch(`http://localhost:5001/api/patients/${id}`, {
        method: "DELETE",
      });
      setPatients(patients.filter((p) => p.id !== id));
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
        setAppointments([]);
      }
    } catch (err) {
      console.log("Delete failed", err);
    }
  };

  const cancelAppointment = async (apptId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/appointments/${apptId}/cancel`,
        { method: "PATCH" }
      );
      if (res.ok) {
        const updated = await res.json();
        setAppointments(
          appointments.map((a) => (a.id === apptId ? updated : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) =>
    status === "cancelled"
      ? "red"
      : status === "completed"
        ? "green"
        : "orange";

  return (
    <div style={styles.container}>
      <h1>Patient Portal</h1>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.layout}>
        <div style={{ ...styles.panel, flex: 1 }}>
          <h2>Patients</h2>
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
          {loading ? (
            <p>Loading patients...</p>
          ) : (
            <div style={styles.list}>
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  style={styles.patientCard(selectedPatient?.id === patient.id)}
                  onClick={() => handleSelectPatient(patient.id)}
                >
                  <strong>
                    {patient.firstName} {patient.lastName}
                  </strong>
                  <br />
                  <small>{patient.email}</small>
                  <br />
                  <small>DOB: {patient.dateOfBirth}</small>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePatient(patient.id);
                    }}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...styles.panel, flex: 2 }}>
          {selectedPatient ? (
            <div>
              <h2>
                {selectedPatient.firstName} {selectedPatient.lastName}
              </h2>
              <p>
                <strong>Email:</strong> {selectedPatient.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedPatient.phone}
              </p>
              <p>
                <strong>DOB:</strong> {selectedPatient.dateOfBirth}
              </p>
              <p>
                <strong>Gender:</strong> {selectedPatient.gender}
              </p>
              <p>
                <strong>Blood Type:</strong>{" "}
                {selectedPatient.bloodType || "N/A"}
              </p>
              <p>
                <strong>Allergies:</strong>{" "}
                {selectedPatient.allergies.length > 0
                  ? selectedPatient.allergies.join(", ")
                  : "None"}
              </p>

              <h3 style={{ marginTop: "20px" }}>Appointments</h3>
              {appointments.length === 0 ? (
                <p>No appointments</p>
              ) : (
                <div>
                  {appointments.map((appt) => (
                    <div key={appt.id} style={styles.apptCard}>
                      <strong>{appt.providerName}</strong> - {appt.department}
                      <br />
                      {new Date(appt.date).toLocaleString()}
                      <br />
                      Type: {appt.type} | Status:{" "}
                      <span style={{ color: statusColor(appt.status) }}>
                        {appt.status}
                      </span>
                      {appt.status !== "cancelled" && (
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={styles.placeholder}>
              <p>Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
