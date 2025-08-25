import React from "react";
import Card from "../../../layout/containers/Card";
import Text from "../../Text";
import Spacer from "../../Spacer";
import { Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import Row from "../../../layout/containers/Row";


export default function PNGDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleDownloadPNG = () => {
    const profileElement = document.querySelector(".profile-sidebar");
    if (!profileElement) return;

    html2canvas(profileElement).then(canvas => {
      const link = document.createElement("a");
      link.download = "profile.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <Card padding="24px" width="400px">
        <Text variant="heading3">Export as PNG</Text>
        <Text variant="caption1" color="secondary-text">
          This will capture the profile layout and download it as an image.
        </Text>

        <Spacer size="lg" />
         {/* Buttons horizontally aligned */}
        <Row gap="12px" justifyContent="flex-end">
          <button
            onClick={handleDownloadPNG}   
            style={{
              background: "var(--color-primary, #7C3AED)",
              color: "#fff",
              border: "none",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Download PNG
          </button>

          <button
            onClick={onClose}
            style={{
              background: "transparent-black",
              border: "1px solid #ccc",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </Row>
      </Card>
    </div>
  );
}