
"use client";

import { useEffect, useState } from "react";
import {
  clearSubmissions,
  deleteSubmission,
  getSubmissions,
  updateSubmissionStatus,
} from "../lib/storage";
import type {
  ProjectSubmission,
  ProjectStatus,
} from "../lib/storage";

export default function AdminPage() {
  const [items, setItems] = useState<ProjectSubmission[]>([]);
  const [selected, setSelected] = useState<ProjectSubmission | null>(null);
  const [filter, setFilter] = useState("All");

  function refresh() {
    setItems(getSubmissions());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = items.filter(
    (item) => filter === "All" || item.status === filter
  );

  function changeStatus(id: string, status: ProjectStatus) {
    updateSubmissionStatus(id, status);
    refresh();
    setSelected((old) => old?.id === id ? { ...old, status } : old);
  }

  async function copyBrief(brief: string) {
    try {
      await navigator.clipboard.writeText(brief);
      alert("Brief copied!");
    } catch {
      alert("Could not access clipboard.");
    }
  }

  function remove(id: string) {
    if (!window.confirm("Delete this project submission?")) return;
    deleteSubmission(id);
    setSelected(null);
    refresh();
  }

  function removeAll() {
    if (!window.confirm("Delete ALL demo submissions from this browser?")) return;
    clearSubmissions();
    setSelected(null);
    refresh();
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a href="/" className="admin-logo">
          <div className="brand-mark">N</div>
          <div>
            <strong>Nexa Digital Studio</strong>
            <span>ONBOARDFLOW ADMIN</span>
          </div>
        </a>

        <div className="admin-header-right">
          <span className="demo-badge">LOCAL DEMO DATA</span>
          <a href="/" className="back-link">← Client portal</a>
        </div>
      </header>

      <div className="admin-main">
        <div className="admin-intro">
          <div>
            <span className="eyebrow">WORKSPACE OVERVIEW</span>
            <h1>Client submissions</h1>
            <p>Review project requests and manage their progress.</p>
          </div>
          <button className="btn-secondary" onClick={refresh}>↻ Refresh</button>
        </div>

        <div className="admin-notice">
          <span>ⓘ</span>
          <p>Demonstration dashboard. Submissions are stored only in this browser. This page has no authentication or secure access control.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>TOTAL SUBMISSIONS</span>
            <strong>{items.length}</strong>
            <small>All project requests</small>
          </div>
          <div className="stat-card">
            <span>NEW</span>
            <strong>{items.filter(x => x.status === "New").length}</strong>
            <small>Awaiting review</small>
          </div>
          <div className="stat-card">
            <span>REVIEWING</span>
            <strong>{items.filter(x => x.status === "Reviewing").length}</strong>
            <small>Under review</small>
          </div>
          <div className="stat-card">
            <span>COMPLETED</span>
            <strong>{items.filter(x => x.status === "Completed").length}</strong>
            <small>Marked completed</small>
          </div>
        </div>

        <section className="submissions-panel">
          <div className="table-heading">
            <div>
              <h2>Project requests</h2>
              <p>View and manage client submissions.</p>
            </div>

            <div className="table-actions">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option>
                <option>New</option>
                <option>Reviewing</option>
                <option>Completed</option>
              </select>
              <button className="danger-button" onClick={removeAll} disabled={!items.length}>
                Clear all
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div>▤</div>
              <h3>No submissions found</h3>
              <p>Completed client onboarding submissions will appear here.</p>
              <a href="/">Open client portal →</a>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>CLIENT</th>
                    <th>SERVICE</th>
                    <th>BUDGET</th>
                    <th>SUBMITTED</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="client-cell">
                          <div className="client-avatar">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.service}</td>
                      <td>{item.budget}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          className={`status-select status-${item.status.toLowerCase()}`}
                          value={item.status}
                          onChange={(e) => changeStatus(item.id, e.target.value as ProjectStatus)}
                          aria-label="Project status"
                        >
                          <option>New</option>
                          <option>Reviewing</option>
                          <option>Completed</option>
                        </select>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => setSelected(item)}>View</button>
                          <button className="delete-text" onClick={() => remove(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <section className="detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-heading">
                <div>
                  <span className="eyebrow">SUBMISSION DETAILS</span>
                  <h2>Project overview</h2>
                </div>
                <button className="icon-button" onClick={() => setSelected(null)}>×</button>
              </div>

              <div className="detail-grid">
                <div><span>REFERENCE</span><strong>{selected.id}</strong></div>
                <div><span>CLIENT</span><strong>{selected.name}</strong></div>
                <div><span>EMAIL</span><strong>{selected.email}</strong></div>
                <div><span>COMPANY</span><strong>{selected.company}</strong></div>
                <div><span>SERVICE</span><strong>{selected.service}</strong></div>
                <div><span>BUDGET</span><strong>{selected.budget}</strong></div>
                <div><span>TIMEFRAME</span><strong>{selected.timeframe}</strong></div>
                <div><span>TARGET AUDIENCE</span><strong>{selected.audience}</strong></div>
                <div><span>STATUS</span><strong>{selected.status}</strong></div>
                <div><span>SUBMITTED</span><strong>{new Date(selected.createdAt).toLocaleString()}</strong></div>
              </div>

              <div className="detail-description">
                <span>PROJECT DESCRIPTION</span>
                <p>{selected.description}</p>
              </div>

              <div className="detail-description">
                <span>ADDITIONAL REQUIREMENTS</span>
                <p>{selected.additional || "Not provided"}</p>
              </div>

              <div className="brief-preview">
                <span>GENERATED PROJECT BRIEF</span>
                <pre>{selected.brief}</pre>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => copyBrief(selected.brief)}>Copy brief</button>
                <button className="btn-primary" onClick={() => setSelected(null)}>Close</button>
              </div>
            </section>
          </div>
        )}

        <p className="admin-footnote">
          OnboardFlow · Nexa Digital Studio · Demo environment
        </p>
      </div>
    </main>
  );
}
