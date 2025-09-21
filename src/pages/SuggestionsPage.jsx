import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/SuggestionsPage.css";
import {
  Filter,
  RefreshCw,
  MapPin,
  Calendar,
  Info,
  CheckCircle,
  Star,
  Clock,
} from "lucide-react";

// Import your components
import Text from "../components/Text";
import Button from "../components/Button";
import Card from "../layout/containers/Card";
import Row from "../layout/containers/Row";
import Column from "../layout/containers/Column";
import Grid from "../layout/containers/Grid";
import SelectDropdown from "../components/SelectDropdown";
import Slider from "../components/Slider";
import Pill from "../components/pill"
import Modal from "../layout/containers/Modal";

// --- Demo data (UI-only) ---
const INITIAL_SUGGESTIONS = [
  {
    id: "s1",
    name1: "John Smith",
    name2: "Robert Johnson",
    relation: "Potential fatherson based on birth records and DNA analysis",
    dna: "47% shared",
    birth: "1945  1970",
    location: "New York",
    score: 95, // %
  },
  {
    id: "s2",
    name1: "Mary Davis",
    name2: "Susan Wilson",
    relation: "Potential sisters based on shared parents and birth record",
    dna: "52% shared",
    birth: "1952  1955",
    location: "California",
    score: 87,
  },
  {
    id: "s3",
    name1: "William Brown",
    name2: "James Miller",
    relation: "Potential cousins based on shared grandparents",
    dna: "12% shared",
    birth: "1960  1962",
    location: "Texas",
    score: 78,
  },
];

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const { treeId } = useParams();

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

  const relationOptions = [
    { value: "all", label: "All" },
    { value: "father", label: "Father" },
    { value: "sister", label: "Sister" },
    { value: "cousin", label: "Cousin" }
  ];

  return (
    <div className="suggestions-page">
      <Column padding="20px 24px" gap="18px">
        {/* Header Section */}
        <Row justifyContent="space-between" alignItems="center">
          <Column gap="4px">
            <Text variant="heading1" as="h1">AI Match Suggestions</Text>
            <Text variant="body2" color="secondary-text">
              Review potential family connections identified by our AI
            </Text>
          </Column>

          <Row gap="10px">
            <Button 
              variant="outline" 
              onClick={() => setFilterOpen((v) => !v)}
              icon={<Filter size={16} />}
            >
              Filter
            </Button>
            <Button 
              variant="outline" 
              onClick={refresh}
              icon={<RefreshCw size={16} />}
            >
              Refresh
            </Button>
          </Row>
        </Row>

        {/* Stats Cards */}
        <Grid columns={4} gap="14px">
          <Card padding="12px" backgroundColor="var(--color-white)" borderColor="var(--color-gray)">
            <Row justifyContent="space-between" alignItems="flex-start">
              <Column gap="2px">
                <Text variant="caption" color="secondary-text">Pending Suggestions</Text>
                <Text variant="heading3" bold>{filtered.length}</Text>
              </Column>
              <Clock size={18} color="var(--color-gray)" />
            </Row>
          </Card>

          <Card padding="12px" backgroundColor="var(--color-white)" borderColor="var(--color-gray)">
            <Row justifyContent="space-between" alignItems="flex-start">
              <Column gap="2px">
                <Text variant="caption" color="secondary-text">High Confidence</Text>
                <Text variant="heading3" bold>{highConfidenceCount}</Text>
              </Column>
              <Star size={18} color="var(--color-gray)" />
            </Row>
          </Card>

          <Card padding="12px" backgroundColor="var(--color-white)" borderColor="var(--color-gray)">
            <Row justifyContent="space-between" alignItems="flex-start">
              <Column gap="2px">
                <Text variant="caption" color="secondary-text">This Week</Text>
                <Text variant="heading3" bold>8</Text>
              </Column>
              <Calendar size={18} color="var(--color-gray)" />
            </Row>
          </Card>

          <Card padding="12px" backgroundColor="var(--color-white)" borderColor="var(--color-gray)">
            <Row justifyContent="space-between" alignItems="flex-start">
              <Column gap="2px">
                <Text variant="caption" color="secondary-text">Approved Today</Text>
                <Text variant="heading3" bold>{acceptedToday}</Text>
              </Column>
              <CheckCircle size={18} color="var(--color-gray)" />
            </Row>
          </Card>
        </Grid>

        {/* Filter Panel */}
        {filterOpen && (
          <Card padding="12px" backgroundColor="var(--color-white)" borderColor="var(--color-gray)">
            <Grid columns={3} gap="14px">
              <Column gap="6px">
                <Text variant="body2" bold>Min score</Text>
                <Slider
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={setMinScore}
                />
                <Text variant="caption" color="secondary-text">{minScore}%</Text>
              </Column>

              <Column gap="6px">
                <Text variant="body2" bold>Relation type</Text>
                <SelectDropdown
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                  options={relationOptions}
                />
              </Column>

              <Row alignItems="center" gap="6px">
                <Info size={14} color="var(--color-gray)" />
                <Text variant="caption" color="secondary-text">
                  Filters are UI-only for now. Backend wiring comes later.
                </Text>
              </Row>
            </Grid>
          </Card>
        )}

        {/* Suggestion Cards */}
        <Column gap="14px">
          {filtered.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onAccept={() => onAccept(s.id)}
              onReject={() => onReject(s.id)}
            />
          ))}

          {filtered.length === 0 && (
            <Card 
              padding="30px" 
              backgroundColor="var(--color-white)" 
              borderColor="var(--color-gray)"
              style={{ borderStyle: "dashed", textAlign: "center" }}
            >
              <Text color="secondary-text">No suggestions match your current filters.</Text>
            </Card>
          )}
        </Column>
      </Column>
    </div>
  );
};

// Suggestion Card Component
function SuggestionCard({ suggestion, onAccept, onReject }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getScoreColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "info";
    return "warning";
  };

  return (
    <>
      <Card padding="14px" backgroundColor="var(--color-white)" borderColor="var(--color-gray)">
        <Column gap="12px">
          {/* Top Row - Names and Score */}
          <Row justifyContent="space-between" alignItems="flex-start">
            <Row gap="8px" alignItems="center">
              <Card size="34px" rounded backgroundColor="var(--color-gray-light)" />
              <Card size="34px" rounded backgroundColor="var(--color-gray-light)" style={{ marginLeft: "-10px" }} />
              <Column gap="4px">
                <Row gap="10px" alignItems="center" wrap>
                  <Text variant="body1" bold>{suggestion.name1}</Text>
                  <Text color="secondary-text"></Text>
                  <Text variant="body1" bold>{suggestion.name2}</Text>
                  <Text 
                    variant="caption" 
                    color={getScoreColor(suggestion.score)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "999px",
                      backgroundColor: `var(--color-${getScoreColor(suggestion.score)}-light)`,
                      fontWeight: "bold"
                    }}
                  >
                    {suggestion.score}% Match
                  </Text>
                </Row>
                <Text variant="body2" color="secondary-text">{suggestion.relation}</Text>
              </Column>
            </Row>
          </Row>

          {/* Meta Information */}
          <Row gap="18px" wrap>
            <Text variant="body2" color="secondary-text"> DNA: {suggestion.dna}</Text>
            <Text variant="body2" color="secondary-text"> Birth: {suggestion.birth}</Text>
            <Row gap="6px" alignItems="center">
              <MapPin size={14} color="var(--color-gray)" />
              <Text variant="body2" color="secondary-text">Location: {suggestion.location}</Text>
            </Row>
          </Row>

          {/* Action Buttons */}
          <Row justifyContent="flex-end" gap="10px">
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              View Details
            </Button>
            <Button variant="primary" onClick={onAccept}>
              Accept
            </Button>
            <Button variant="danger" onClick={onReject}>
              Reject
            </Button>
          </Row>
        </Column>
      </Card>

      {/* Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Column gap="12px" padding="20px">
          <Row justifyContent="space-between" alignItems="center">
            <Text variant="heading3">Suggested Match</Text>
            <Button variant="danger" onClick={() => setIsModalOpen(false)}>
              
            </Button>
          </Row>

          <Card padding="12px" backgroundColor="var(--color-gray-light)">
            <Row gap="12px" alignItems="center">
              <Card size="48px" rounded backgroundColor="var(--color-gray-light)" />
              <Column gap="4px" style={{ flex: 1 }}>
                <Row gap="10px" alignItems="center">
                  <Text variant="body1" bold>{suggestion.name1}</Text>
                  <Text color="secondary-text"></Text>
                  <Text variant="body1" bold>{suggestion.name2}</Text>
                </Row>
                <Text variant="body2" color="secondary-text">{suggestion.relation}</Text>
              </Column>
              <Text 
                variant="caption" 
                color={getScoreColor(suggestion.score)}
                style={{
                  padding: "2px 8px",
                  borderRadius: "999px",
                  backgroundColor: `var(--color-${getScoreColor(suggestion.score)}-light)`,
                  fontWeight: "bold"
                }}
              >
                {suggestion.score}% Match
              </Text>
            </Row>
          </Card>

          <Grid columns={3} gap="12px">
            <Card padding="10px" backgroundColor="var(--color-gray-light)">
              <Text variant="body2" bold>DNA</Text>
              <Text variant="body2">{suggestion.dna}</Text>
            </Card>
            <Card padding="10px" backgroundColor="var(--color-gray-light)">
              <Text variant="body2" bold>Birth</Text>
              <Text variant="body2">{suggestion.birth}</Text>
            </Card>
            <Card padding="10px" backgroundColor="var(--color-gray-light)">
              <Text variant="body2" bold>Location</Text>
              <Text variant="body2">{suggestion.location}</Text>
            </Card>
          </Grid>

          <Text variant="caption" color="secondary-text">
            This is a UI-only preview. Final decision will be saved once backend is ready.
          </Text>

          <Row justifyContent="flex-end" gap="10px">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={onAccept}>
              Accept
            </Button>
            <Button variant="danger" onClick={onReject}>
              Reject
            </Button>
          </Row>
        </Column>
      </Modal>
    </>
  );
}

export default SuggestionsPage;
