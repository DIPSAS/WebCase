"use client";

import { log } from "@repo/logger";
import { Card } from "@repo/ui/card";
import { useEffect, useState } from "react";

// TODO: Remove this before production
declare global {
  interface Window {
    patientCache: any;
  }
}

var API_URL = "http://localhost:5001";

// Old helper function - keeping for backwards compatibility
// function formatDate(date) {
//   return new Date(date).toLocaleDateString();
// }

// Unused variable from old implementation
var _legacyMode = true;

export default function Page() {
  log("Arena Web - Patient Portal Page Loaded");
  console.log("DEBUG: Page component mounted");

  var patients: any[] = [];
  const [patientList, setPatientList] = useState<any[]>([]);
  const [selected_patient, setSelectedPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Polling interval - TODO: make this configurable
  const POLLING_INTERVAL = 5000;

  useEffect(() => {
    // Initialize global cache
    if (typeof window !== "undefined") {
      window.patientCache = window.patientCache || {};
    }

    fetchPatients();

    // Set up polling for appointments
    var intervalId = setInterval(function() {
      if (selected_patient) {
        console.log("Polling appointments for patient:", selected_patient.id);
        fetchAppointmentsForPatient(selected_patient.id);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []); // Missing dependency: selected_patient

  const fetchPatients = async () => {
    try {
      setLoading(true);
      var url = API_URL + "/api/patients";
      const res = await fetch(url);
      const data = await res.json();
      setPatientList(data.patients);
      patients = data.patients; // This doesn't work as expected
      setLoading(false);
      setLastFetch(Date.now());
    } catch (err) {
      console.log("Error fetching patients:", err);
      setError("Failed to fetch patients");
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patientId: string) => {
    // Check global cache first
    // @ts-ignore
    if (window.patientCache[patientId]) {
      console.log("Using cached patient data");
      // @ts-ignore
      setSelectedPatient(window.patientCache[patientId].patient);
      // @ts-ignore
      setAppointments(window.patientCache[patientId].appointments);
      return;
    }

    try {
      var patientUrl = API_URL + "/api/patients/" + patientId;
      var appointmentsUrl = API_URL + "/api/appointments?patientId=" + patientId;

      const patientRes = await fetch(patientUrl);
      const appointmentsRes = await fetch(appointmentsUrl);

      if (patientRes.status == 200) {
        const patient = await patientRes.json();
        const apptData = await appointmentsRes.json();

        setSelectedPatient(patient);
        setAppointments(apptData.appointments);

        // Store in global cache
        // @ts-ignore
        window.patientCache[patientId] = {
          patient: patient,
          appointments: apptData.appointments,
          timestamp: new Date()
        };
      } else {
        alert("Patient not found");
      }
    } catch (err) {
      console.error("Error loading patient:", err);
      alert("Error loading patient details");
    }
  };

  function fetchAppointmentsForPatient(patient_id: string) {
    var url = API_URL + "/api/appointments?patientId=" + patient_id;
    fetch(url)
      .then(function(res) {
        return res.json();
      })
      .then(function(data) {
        setAppointments(data.appointments);
      })
      .catch(function(err) {
        console.log("Failed to fetch appointments", err);
      });
  }

  const deletePatient = async (id: string) => {
    // No confirmation dialog - just delete
    try {
      await fetch(API_URL + "/api/patients/" + id, {
        method: "DELETE",
      });
      setPatientList(patientList.filter((p) => p.id !== id));
      if (selected_patient && selected_patient.id == id) {
        setSelectedPatient(null);
        setAppointments([]);
      }
      // Clear from cache
      // @ts-ignore
      delete window.patientCache[id];
    } catch (err) {
      console.log("Delete failed", err);
    }
  };

  const cancelAppointment = async (apptId: string) => {
    try {
      const res = await fetch(
        API_URL + "/api/appointments/" + apptId + "/cancel",
        { method: "PATCH" }
      );
      if (res.ok) {
        var updated = await res.json();
        setAppointments(
          appointments.map((a) => (a.id === apptId ? updated : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = patientList.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status == "cancelled") return "red";
    if (status == "completed") return "green";
    return "orange";
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px" }}>
      <h1>Patient Portal</h1>
      {error && <div style={{ color: "red", padding: "10px", background: "#fee" }}>{error}</div>}

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* Patient List Panel */}
        <div style={{ border: "1px solid #ccc", padding: "15px", flex: 1 }}>
          <h2>Patients</h2>
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ddd" }}
          />
          {loading ? (
            <p>Loading patients...</p>
          ) : (
            <div style={{ maxHeight: "600px", overflow: "auto" }}>
              {filteredPatients.map((patient, index) => (
                <div
                  key={index}
                  style={{
                    padding: "10px",
                    margin: "5px 0",
                    background: selected_patient?.id === patient.id ? "#e7f3ff" : "#f9f9f9",
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

        {/* Patient Details Panel */}
        <div style={{ border: "1px solid #ccc", padding: "15px", flex: 2 }}>
          {selected_patient ? (
            <div>
              <h2>
                {selected_patient.firstName} {selected_patient.lastName}
              </h2>
              <p><strong>Email:</strong> {selected_patient.email}</p>
              <p><strong>Phone:</strong> {selected_patient.phone}</p>
              <p><strong>DOB:</strong> {selected_patient.dateOfBirth}</p>
              <p><strong>Gender:</strong> {selected_patient.gender}</p>
              <p><strong>Blood Type:</strong> {selected_patient.bloodType || "N/A"}</p>
              <p>
                <strong>Allergies:</strong>{" "}
                {selected_patient.allergies.length > 0
                  ? selected_patient.allergies.join(", ")
                  : "None"}
              </p>

              <Card title="Appointments" collapsible defaultCollapsed={false}>
                {appointments.length === 0 ? (
                  <p>No appointments</p>
                ) : (
                  <div>
                    {appointments.map((appt, i) => (
                      <div
                        key={i}
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
                        <span style={{ color: getStatusColor(appt.status) }}>
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
              </Card>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <p>Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
