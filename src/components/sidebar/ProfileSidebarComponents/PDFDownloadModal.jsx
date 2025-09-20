import React from "react";
import Card from "../../../layout/containers/Card";
import Text from "../../Text";
import Spacer from "../../Spacer";
import Row from "../../../layout/containers/Row";   
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PDFDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    const profileElement = document.querySelector(".profile-sidebar"); 
    if (!profileElement) return;

    html2canvas(profileElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("profile.pdf");
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <Card padding="24px" width="400px">
        <Text variant="heading3">Export as PDF</Text>
        <Text variant="caption1" color="secondary-text">
          This will capture the profile layout and download it as a PDF.
        </Text>

        <Spacer size="lg" />

        {/* Buttons horizontally aligned */}
        <Row gap="12px" justifyContent="flex-end">
          <button
            onClick={handleDownloadPDF}   
            style={{
              background: "var(--color-primary, #7C3AED)",
              color: "#fff",
              border: "none",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Download PDF
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
