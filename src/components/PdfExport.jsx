import React, { useState, useRef } from 'react'
import Modal from '../layout/containers/Modal'
import Text from './Text'
import Button from './Button'
import Card from '../layout/containers/Card'
import FlexContainer from '../layout/containers/FlexContainer'
import Spacer from './Spacer'
import Checkbox from './Checkbox'
import SelectDropdown from './SelectDropdown'
import { Download } from 'lucide-react'
import Row from '../layout/containers/Row'
import Grid from '../layout/containers/Grid'
import Column from '../layout/containers/Column'

// Export helpers
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export default function PDFExport({ isOpen, onClose }) {
  const [scopeOptions, setScopeOptions] = useState('iscurrentView')
  const [exportOptions, setExportOptions] = useState({ format: 'pdf' })

  // Dummy data for now
  const dummyFamilyTree = {
    id: "dummy-tree-001",
    name: "Test Family Tree",
    members: [
      { id: "1", name: "Ali Jaber", relation: "Father" },
      { id: "2", name: "Aaliya Zuleyha", relation: "Mother" },
      { id: "3", name: "Muhammad", relation: "Son" },
    ],
  };

  // Reference to dummy tree container
  const treeRef = useRef(null);

  const handleExport = async () => {
    try {
      if (!treeRef.current) {
        console.error("Tree container not found!");
        return;
      }

      // Export as PNG
      if (exportOptions.format === "png") {
        const dataUrl = await toPng(treeRef.current);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "family_tree.png";
        link.click();
      }
      // Export as PDF
      else if (exportOptions.format === "pdf") {
        const dataUrl = await toPng(treeRef.current);
        const pdf = new jsPDF("landscape", "mm", "a4");
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("family_tree.pdf");
      }

      console.log(
        'Exported family tree with options:',
        exportOptions,
        'and scope:',
        scopeOptions
      );

    } catch (error) {
      console.error("Error exporting family tree:", error);
    }
  };

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({ ...prev, [option]: value }))
  };

  const handleScopeChange = (value) => {
    setScopeOptions(value)
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Column fitContent width='90%' padding='5px 0px' alignItems='start' gap='0.5rem'>
        <Text align='start' variant="heading2">📤 Export Family Tree</Text>
        <Text variant="caption1" color="var(--color-secondary2)">
          Download your tree as a printable image or PDF to share, archive, or preserve.
        </Text>
      </Column>

      <Spacer size="md" />

      {/* DUMMY TREE PREVIEW */}
      <div
        ref={treeRef}
        style={{
          background: "#fff",
          padding: "10px",
          margin: "10px 0",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
      >
        <h3>{dummyFamilyTree.name}</h3>
        <ul>
          {dummyFamilyTree.members.map(member => (
            <li key={member.id}>
              {member.name} - {member.relation}
            </li>
          ))}
        </ul>
      </div>

      <FlexContainer direction="column" gap="12px">
        <Card padding="16px" backgroundColor="var(--color-transparent)">
          <Text variant="heading3">Scope</Text>
          <Spacer size="sm" />
          <Grid columns={2} gap="12px" >
            <Checkbox label="Current View" checked={scopeOptions === 'iscurrentView'} onChange={() => handleScopeChange('iscurrentView')} value="iscurrentView" />
            <Checkbox label="Centered View" checked={scopeOptions === 'isCenteredView'} onChange={() => handleScopeChange('isCenteredView')} value="isCenteredView" />
            <Checkbox label="Complete View" checked={scopeOptions === 'isCompleteView'} onChange={() => handleScopeChange('isCompleteView')} value="isCompleteView" />
            <Checkbox label="Custom View" checked={scopeOptions === 'isCustom'} onChange={() => handleScopeChange('isCustom')} value="isCustom" />
          </Grid>
        </Card>

        <Card padding="16px" backgroundColor="var(--color-transparent)">
          <Text variant="heading4">Export Settings</Text>
          <Spacer size="md" />
          <Row padding='0px' margin='0px' fitContent justifyContent='center' alignItems='center'>
            <Text variant="body2" margin="0 0 4px 0">Format:</Text>
            <SelectDropdown
              options={[{ label: 'PDF Document', value: "pdf"}, { label: 'PNG Image', value: "png" }]}
              value={exportOptions.format}
              onChange={(e) => handleOptionChange('format', e.target.value)}
            />
          </Row>
        </Card>
      </FlexContainer>

      <Spacer size="md" />

      <Row>
        <Button fullWidth variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button fullWidth variant="primary" onClick={handleExport} leftIcon={<Download size={16} />}>
          Export Family Tree
        </Button>
      </Row>
    </Modal>
  )
}