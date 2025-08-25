import React from "react";
import Card from "../../../layout/containers/Card";
import Row from "../../../layout/containers/Row";
import Text from "../../Text";
import Spacer from "../../Spacer";
import { Download, FileText, Image as ImageIcon, X, Check } from "lucide-react";

export default function DownloadProfileModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  const OptionCard = ({
    icon,
    title,
    subtitle,
    features,
    recommended,
    onClick,
    dim,
  }) => (
    <Card
      padding="16px"
      margin="8px 0"
      style={{
        border: "1px solid var(--color-border, #E5E7EB)", // light gray border
        borderRadius: 12,
        cursor: "pointer",
        background: "var(--color-surface, #fff)",
        boxShadow: "0 2px 6px rgba(0,0,0,.08)", 
        transition: "background 0.2s ease",
      }}
      justifyContent="space-between"
      onClick={onClick}
      tabIndex={0}
      role="button"
    >
      <Row gap="12px" alignItems="center" justifyContent="space-between">
        <Row gap="12px" alignItems="center">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-primary-50, #F3E8FF)", 
              color: "var(--color-primary, #6D28D9)",
            }}
          >
            {icon}
          </div>
          <div>
            <Row gap="8px" alignItems="center">
              <Text variant="body1" bold style={{ opacity: dim ? 0.6 : 1 }}>
                {title}
              </Text>
              {recommended && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "var(--color-primary-100, #EDE9FE)", 
                    color: "var(--color-primary, #6D28D9)",
                  }}
                >
                  Recommended
                </span>
              )}
            </Row>
            <Text
              variant="caption1"
              color="secondary-text"
              style={{ opacity: dim ? 0.7 : 1 }}
            >
              {subtitle}
            </Text>
          </div>
        </Row>
      </Row>

      <Spacer size="sm" />
      <ul
        style={{
          margin: "6px 0 0 52px",
          padding: 0,
          listStyle: "none",
          opacity: dim ? 0.6 : 1,
        }}
      >
        {features.map((f, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "4px 0",
            color: "var(--color-text, #374151)",
            }}
          >
            <Check size={16} color="var(--color-primary, #6D28D9)" />
            <Text variant="caption1">{f}</Text>
          </li>
        ))}
      </ul>
    </Card>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Card
        width="600px"
        padding="16px 16px 20px"
        style={{ borderRadius: 16, background: "var(--color-background, #fff)" }}
      >
        {/* Header */}
        <div style={{ position: "relative", paddingRight:"40px" }}>
          <Row gap="10px" alignItems="center">
            <Download  color="var(--color-primary, #6D28D9)" />
            <Text variant="heading3" as="h3">
              Download Profile
            </Text>
          </Row>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              left: 300 ,
              top: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--color-gray-500, #6B7280)", // muted gray
            }}
          >
            <X />
          </button>
        </div>

        <Spacer size="xs" />
        <Text variant="caption1" color="secondary-text">
          Choose your preferred format to download this profile.
        </Text>

        <Spacer size="md" />

        {/* PDF option */}
        <OptionCard
          icon={<FileText />}
          title="PDF Document"
          subtitle="Perfect for printing and official records"
          features={[
            "High-quality text and images",
            "Printable format",
            "Preserves layout and formatting",
          ]}
          recommended
          onClick={() => onSelect?.("pdf")}
        />

        {/* PNG option */}
        <OptionCard
          icon={<ImageIcon />}
          title="PNG Image"
          subtitle="Great for sharing on social media"
          features={[
            "Easy to share online",
            "High-resolution image",
            "Works on all devices",
          ]}
          onClick={() => onSelect?.("png")}
        />

        <Spacer size="lg" />

        {/* Buttons horizontally aligned */}
        <Row gap="12px" justifyContent="flex-end">
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--color-border, #D1D5DB)",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--color-gray-700, #374151)",
            }}
          >
            Cancel
          </button>
         
        </Row>
      </Card>
    </div>
  );
}