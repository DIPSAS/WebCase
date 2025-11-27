"use client";

import { log } from "@repo/logger";
import { useEffect, useState } from "react";

export default function Page() {
  log("Arena Web - Patient Portal Page Loaded");

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch patients on mount - mixing concerns by doing this directly in component
  useEffect(() => {
    fetchPatients();
  }, []);

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

  // Fetch patient details when selected - no abstraction
  const handleSelectPatient = async (patientId: string) => {
    try {
      const [patientRes, apptRes, rxRes, vitalsRes] = await Promise.all([
        fetch(`http://localhost:5001/api/patients/${patientId}`),
        fetch(`http://localhost:5001/api/appointments?patientId=${patientId}`),
        fetch(`http://localhost:5001/api/patients/${patientId}/prescriptions`),
        fetch(`http://localhost:5001/api/patients/${patientId}/vitals?limit=5`),
      ]);

      const patient = await patientRes.json();
      const apptData = await apptRes.json();
      const rxData = await rxRes.json();
      const vitalsData = await vitalsRes.json();

      setSelectedPatient(patient);
      setAppointments(apptData.appointments);
      setPrescriptions(rxData.prescriptions);
      setVitals(vitalsData.vitals);
    } catch (err) {
      alert("Error loading patient details");
    }
  };

  // Add new patient - mixing validation, API calls, and state updates
  const addPatient = async () => {
    if (!newPatientName || !newPatientEmail) {
      alert("Name and email required!");
      return;
    }

    // Poor validation
    if (newPatientEmail.indexOf("@") === -1) {
      alert("Invalid email");
      return;
    }

    const names = newPatientName.split(" ");
    const payload = {
      firstName: names[0],
      lastName: names.slice(1).join(" ") || "Unknown",
      email: newPatientEmail,
      dateOfBirth: "1990-01-01",
      gender: "other",
      phone: "+1-555-0000",
      address: {
        street: "123 Main St",
        city: "City",
        state: "ST",
        zipCode: "12345",
        country: "USA",
      },
      emergencyContact: {
        name: "Emergency Contact",
        relationship: "Friend",
        phone: "+1-555-0001",
      },
    };

    try {
      const res = await fetch("http://localhost:5001/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewPatientName("");
        setNewPatientEmail("");
        setShowAddForm(false);
        fetchPatients(); // Refetch everything
      } else {
        alert("Failed to add patient");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Delete patient - no confirmation, direct manipulation
  const deletePatient = async (id: string) => {
    try {
      await fetch(`http://localhost:5001/api/patients/${id}`, {
        method: "DELETE",
      });
      setPatients(patients.filter((p) => p.id !== id));
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
        setAppointments([]);
        setPrescriptions([]);
        setVitals([]);
      }
    } catch (err) {
      console.log("Delete failed", err);
    }
  };

  // Cancel appointment - inline logic
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

  // Filter patients - doing this in render instead of useMemo
  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render everything in one massive component
  return (
    <div className="container" style={{ padding: "20px", maxWidth: "1400px" }}>
      <h1 className="title">
        Patient Portal <br />
        <span>EHR System</span>
      </h1>

      {error && (
        <div style={{ color: "red", padding: "10px", background: "#fee" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* Patient List */}
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "15px" }}>
          <h2>Patients</h2>

          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              border: "1px solid #ddd",
            }}
          />

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: "8px 16px",
              marginBottom: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showAddForm ? "Cancel" : "Add Patient"}
          </button>

          {showAddForm && (
            <div
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Full Name"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid #ddd",
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={newPatientEmail}
                onChange={(e) => setNewPatientEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid #ddd",
                }}
              />
              <button
                onClick={addPatient}
                style={{
                  padding: "8px 16px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          )}

          {loading ? (
            <p>Loading patients...</p>
          ) : (
            <div style={{ maxHeight: "600px", overflow: "auto" }}>
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  style={{
                    padding: "10px",
                    margin: "5px 0",
                    background:
                      selectedPatient?.id === patient.id
                        ? "#e7f3ff"
                        : "#f9f9f9",
                    cursor: "pointer",
                    border: "1px solid #ddd",
                  }}
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
                    style={{
                      marginTop: "5px",
                      padding: "4px 8px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Details */}
        <div style={{ flex: 2, border: "1px solid #ccc", padding: "15px" }}>
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
              <p>
                <strong>Chronic Conditions:</strong>{" "}
                {selectedPatient.chronicConditions.length > 0
                  ? selectedPatient.chronicConditions.join(", ")
                  : "None"}
              </p>

              {/* Appointments */}
              <h3 style={{ marginTop: "20px" }}>Appointments</h3>
              {appointments.length === 0 ? (
                <p>No appointments</p>
              ) : (
                <div>
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      style={{
                        padding: "10px",
                        margin: "5px 0",
                        background: "#f0f0f0",
                        border: "1px solid #ddd",
                      }}
                    >
                      <strong>{appt.providerName}</strong> - {appt.department}
                      <br />
                      {new Date(appt.date).toLocaleString()}
                      <br />
                      Type: {appt.type} | Status:{" "}
                      <span
                        style={{
                          color:
                            appt.status === "cancelled"
                              ? "red"
                              : appt.status === "completed"
                                ? "green"
                                : "orange",
                        }}
                      >
                        {appt.status}
                      </span>
                      {appt.status !== "cancelled" && (
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          style={{
                            marginLeft: "10px",
                            padding: "4px 8px",
                            background: "#ffc107",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Prescriptions */}
              <h3 style={{ marginTop: "20px" }}>Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p>No prescriptions</p>
              ) : (
                <div>
                  {prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      style={{
                        padding: "10px",
                        margin: "5px 0",
                        background: "#f0f0f0",
                        border: "1px solid #ddd",
                      }}
                    >
                      <strong>{rx.medication}</strong> - {rx.dosage}
                      <br />
                      {rx.frequency}
                      <br />
                      Prescribed by: {rx.prescribedBy}
                      <br />
                      Refills remaining: {rx.refillsRemaining}
                      <br />
                      Status: {rx.status}
                    </div>
                  ))}
                </div>
              )}

              {/* Vitals */}
              <h3 style={{ marginTop: "20px" }}>Recent Vitals</h3>
              {vitals.length === 0 ? (
                <p>No vitals recorded</p>
              ) : (
                <div>
                  {vitals.map((vital) => (
                    <div
                      key={vital.id}
                      style={{
                        padding: "10px",
                        margin: "5px 0",
                        background: "#f0f0f0",
                        border: "1px solid #ddd",
                      }}
                    >
                      <strong>
                        {new Date(vital.recordedDate).toLocaleDateString()}
                      </strong>{" "}
                      - Recorded by {vital.recordedBy}
                      <br />
                      {vital.bloodPressure && (
                        <>
                          BP: {vital.bloodPressure.systolic}/
                          {vital.bloodPressure.diastolic}
                          <br />
                        </>
                      )}
                      {vital.heartRate && (
                        <>
                          Heart Rate: {vital.heartRate} bpm
                          <br />
                        </>
                      )}
                      {vital.temperature && (
                        <>
                          Temp: {vital.temperature}°F
                          <br />
                        </>
                      )}
                      {vital.oxygenSaturation && (
                        <>
                          O2 Sat: {vital.oxygenSaturation}%<br />
                        </>
                      )}
                      {vital.weight && (
                        <>
                          Weight: {vital.weight} lbs
                          <br />
                        </>
                      )}
                      {vital.bmi && <>BMI: {vital.bmi}</>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#999" }}
            >
              <p>Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
