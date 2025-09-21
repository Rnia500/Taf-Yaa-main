import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import "../styles/SuggestionsPage.css";
import {
  Bell,
  Filter,
  RefreshCw,
  ChevronLeft,
  MapPin,
  Calendar,
  Info,
} from "lucide-react";


// --- Demo data (UI-only) ---
const INITIAL_SUGGESTIONS = [
  {
    id: "s1",
    name1: "John Smith",
    name2: "Robert Johnson",
    relation: "Potential father–son based on birth records and DNA analysis",
    dna: "47% shared",
    birth: "1945 – 1970",
    location: "New York",
    score: 95, // %
  },
  {
    id: "s2",
    name1: "Mary Davis",
    name2: "Susan Wilson",
    relation: "Potential sisters based on shared parents and birth record",
    dna: "52% shared",
    birth: "1952 – 1955",
    location: "California",
    score: 87,
  },
  {
    id: "s3",
    name1: "William Brown",
    name2: "James Miller",
    relation: "Potential cousins based on shared grandparents",
    dna: "12% shared",
    birth: "1960 – 1962",
    location: "Texas",
    score: 78,
  },
];

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const { treeId } = useParams();
  const location = useLocation();

  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [acceptedToday, setAcceptedToday] = useState(3); // demo counter
  const [filterOpen, setFilterOpen] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [relType, setRelType] = useState("all");

  const filtered = useMemo(() => {
    let list = [...suggestions];
    list = list.filter((s) => s.score >= minScore);
    if (relType !== "all") {
      const k = relType.toLowerCase();
      list = list.filter((s) => s.relation.toLowerCase().includes(k));
    }
    return list;
  }, [suggestions, minScore, relType]);

  const highConfidenceCount = useMemo(
    () => filtered.filter((s) => s.score >= 85).length,
    [filtered]
  );

  function onAccept(id) {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    setAcceptedToday((n) => n + 1);
  }
  function onReject(id) {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }

  function refresh() {
    // lightweight visual refresh (shuffle)
    setSuggestions((prev) => [...prev].sort(() => Math.random() - 0.5));
  }

  return (
    <div className="sugg-page">
      <div className="sugg-layout">
        {/* Main content */}
        <main className="sugg-main">

         {/* Header row */}
<div className="sugg-header">
  <div>
    <h1 className="sugg-title">AI Match Suggestions</h1>
    <p className="sugg-subtitle">
      Review potential family connections identified by our AI
    </p>
  </div>

  <div className="page-actions">
    <button className="btn outline" onClick={() => setFilterOpen((v) => !v)}>
      <Filter size={16} />
      Filter
    </button>
    <button className="btn outline" onClick={refresh}>
      <RefreshCw size={16} />
      Refresh
    </button>
  </div>
</div>

          {/* Stat cards */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="label">Pending Suggestions</div>
              <div className="value">{filtered.length}</div>
              <ClockIcon />
            </div>

            <div className="stat-card">
              <div className="label">High Confidence</div>
              <div className="value">{highConfidenceCount}</div>
              <StarIcon />
            </div>

            <div className="stat-card">
              <div className="label">This Week</div>
              <div className="value">8</div>
              <Calendar size={18} />
            </div>

            <div className="stat-card">
              <div className="label">Approved Today</div>
              <div className="value">{acceptedToday}</div>
              <CheckIcon />
            </div>
          </div>

         
          {/* Filter panel */}
          {filterOpen && (
            <div className="filter-panel">
              <div className="filter-group">
                <label>Min score</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                />
                <div className="filter-value">{minScore}%</div>
              </div>

              <div className="filter-group">
                <label>Relation type</label>
                <select value={relType} onChange={(e) => setRelType(e.target.value)}>
                  <option value="all">All</option>
                  <option value="father">Father</option>
                  <option value="sister">Sister</option>
                  <option value="cousin">Cousin</option>
                </select>
              </div>

              <div className="filter-hint">
                <Info size={14} />
                Filters are UI-only for now. Backend wiring comes later.
              </div>
            </div>
          )}

          {/* Suggestion list */}
          <div className="cards-list">
            {filtered.map((s) => (
              <SuggestionCard
                key={s.id}
                s={s}
                onAccept={() => onAccept(s.id)}
                onReject={() => onReject(s.id)}
              />
            ))}

            {filtered.length === 0 && (
              <div className="empty">
                No suggestions match your current filters.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default SuggestionsPage;

// --- Small components ---

function SuggestionCard({ s, onAccept, onReject }) {
  const [open, setOpen] = useState(false);
  const scoreClass =
    s.score >= 90 ? "score success" : s.score >= 80 ? "score info" : "score warn";

  return (
    <div className="sugg-card">
      <div className="row top">
        <div className="avatars">
          <div className="avatar" />
          <div className="avatar second" />
        </div>

        <div className="names">
          <div className="line">
            <span className="name">{s.name1}</span>
            <span className="sep">↔</span>
            <span className="name">{s.name2}</span>
            <span className={scoreClass}>{s.score}% Match</span>
          </div>
          <div className="relation">{s.relation}</div>
        </div>
      </div>

      <div className="row meta">
        <div className="meta-item">🧬 DNA: {s.dna}</div>
        <div className="meta-item">
          🎂 Birth: {s.birth}
        </div>
        <div className="meta-item">
          <MapPin size={14} />
          Location: {s.location}
        </div>
      </div>

      <div className="row actions">
        <button className="btn view" onClick={() => setOpen(true)}>
          View Details
        </button>
        <button className="btn accept" onClick={onAccept}>
          Accept
        </button>
        <button className="btn reject" onClick={onReject}>
          Reject
        </button>
      </div>

      {open && (
        <DetailsModal s={s} onClose={() => setOpen(false)} onAccept={onAccept} onReject={onReject} />
      )}
    </div>
  );
}

function DetailsModal({ s, onClose, onAccept, onReject }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-head">
          <h3>Suggested Match</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="pair">
            <div className="big-avatar" />
            <div className="mid">
              <div className="pair-names">
                {s.name1} <span className="sep">↔</span> {s.name2}
              </div>
              <div className="pair-relation">{s.relation}</div>
            </div>
            <span className={s.score >= 90 ? "score success" : s.score >= 80 ? "score info" : "score warn"}>
              {s.score}% Match
            </span>
          </div>

          <div className="modal-grid">
            <div className="grid-item"><strong>DNA</strong><div>{s.dna}</div></div>
            <div className="grid-item"><strong>Birth</strong><div>{s.birth}</div></div>
            <div className="grid-item"><strong>Location</strong><div>{s.location}</div></div>
          </div>

          <div className="modal-note">
            This is a UI-only preview. Final decision will be saved once backend is ready.
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn view" onClick={onClose}>Close</button>
          <button className="btn accept" onClick={onAccept}>Accept</button>
          <button className="btn reject" onClick={onReject}>Reject</button>
        </div>
      </div>
    </div>
  );
}

// tiny icon helpers
function CheckIcon() { return <span className="icon-check">✔</span>; }
function StarIcon() { return <span className="icon-star">★</span>; }
function ClockIcon() { return <span className="icon-clock">🕒</span>; }
