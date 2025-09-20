// PDFDownloadModal.jsx
import React from "react";
import Card from "../../../layout/containers/Card";
import Row from "../../../layout/containers/Row";
import Text from "../../Text";
import Spacer from "../../Spacer";
import { FileText, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

export default function PDFDownloadModal({ isOpen, onClose, profileName }) {
  const { t } = useTranslation();
  
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
      pdf.save(`${profileName || "profile"}.pdf`);
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <Card padding="24px" width="400px" style={{ borderRadius: 16 }}>
        {/* Header */}
        <div style={{ position: "relative" }}>
          <Row gap="10px" alignItems="center">
            <FileText color="var(--color-primary1)" />
            <Text variant="heading3" as="h3" style={{ color: "var(--color-primary-text)" }}>
              {t("modals.export_as_pdf")}
            </Text>
          </Row>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              left: 200,
              top: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--color-danger)",
            }}
          >
            <X />
          </button>
        </div>

        <Spacer size="xs" />
        <Text variant="caption1" color="secondary-text">
          {t("modals.pdf_subtitle2")}
        </Text>

        <Spacer size="lg" />

        {/* Buttons horizontally aligned */}
        <Row gap="12px" justifyContent="flex-end">
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--color-gray)",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--color-primary1)",
              fontWeight: 500,
            }}
          >
            {t("buttons.cancel")}
          </button>
          <button
            onClick={handleDownloadPDF}
            style={{
              background: "var(--color-primary1)",
              color: "#fff",
              border: "none",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {t("buttons.download")}
          </button>
        </Row>
      </Card>
    </div>
  );
}