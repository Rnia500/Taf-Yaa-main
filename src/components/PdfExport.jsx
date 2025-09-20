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
import { useTranslation } from 'react-i18next'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export default function PDFExport({ isOpen, onClose }) {
  const [scopeOptions, setScopeOptions] = useState('iscurrentView')
  const [exportOptions, setExportOptions] = useState({ format: 'pdf' })
  const { t } = useTranslation()

  // Dummy data for now
  const dummyFamilyTree = {
    id: "dummy-tree-001",
    name: t("relations.test"),
    members: [
  { id: "1", name: "Ali Jaber", relation: "father" },
  { id: "2", name: "Aaliya Zuleyha", relation: "mother" },
  { id: "3", name: "Muhammad", relation: "son" },
  { id: "4", name: "Aisha", relation: "daughter" },
  { id: "5", name: "Omar", relation: "uncle" },
  { id: "6", name: "Fatima", relation: "aunt" },
  { id: "7", name: "Yusuf", relation: "cousin" },
  { id: "8", name: "Zainab", relation: "grandmother" },
  { id: "9", name: "Hassan", relation: "grandfather" },
  { id: "10", name: "Khadija", relation: "sister" },
  { id: "11", name: "Ibrahim", relation: "brother" },
  { id: "12", name: "Maryam", relation: "niece" }
],
  }

  const treeRef = useRef(null)

  const handleExport = async () => {
    try {
      if (!treeRef.current) {
        console.error("Tree container not found!")
        return
      }

      if (exportOptions.format === "png") {
        const dataUrl = await toPng(treeRef.current)
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = "family_tree.png"
        link.click()
      } else if (exportOptions.format === "pdf") {
        const dataUrl = await toPng(treeRef.current)
        const pdf = new jsPDF("landscape", "mm", "a4")
        const imgProps = pdf.getImageProperties(dataUrl)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save("family_tree.pdf")
      }

      console.log(
        'Exported family tree with options:',
        exportOptions,
        'and scope:',
        scopeOptions
      )

    } catch (error) {
      console.error("Error exporting family tree:", error)
    }
  }

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({ ...prev, [option]: value }))
  }

  const handleScopeChange = (value) => {
    setScopeOptions(value)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Column fitContent width='90%' padding='5px 0px' alignItems='start' gap='0.5rem'>
        <Text align='start' variant="heading2">📤 {t("modals.export_family_tree")}</Text>
        <Text variant="caption1" color="var(--color-secondary2)">
          {t("modals.download_tree")}
        </Text>
      </Column>

      <Spacer size="md" />

      {/* Dummy preview */}
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
      {member.name} - {t(`relations.${member.relation.toLowerCase()}`)}
    </li>
  ))}
</ul>

      </div>

      <FlexContainer direction="column" gap="12px">
        <Card padding="16px" backgroundColor="var(--color-transparent)">
          <Text variant="heading3">{t("modals.scope")}</Text>
          <Spacer size="sm" />
          <Grid columns={2} gap="12px">
            <Checkbox label={t("modals.current_view")} checked={scopeOptions === 'iscurrentView'} onChange={() => handleScopeChange('iscurrentView')} value="iscurrentView" />
            <Checkbox label={t("modals.centered_view")} checked={scopeOptions === 'isCenteredView'} onChange={() => handleScopeChange('isCenteredView')} value="isCenteredView" />
            <Checkbox label={t("modals.complete_view")} checked={scopeOptions === 'isCompleteView'} onChange={() => handleScopeChange('isCompleteView')} value="isCompleteView" />
            <Checkbox label={t("modals.custom_view")} checked={scopeOptions === 'isCustom'} onChange={() => handleScopeChange('isCustom')} value="isCustom" />
          </Grid>
        </Card>

        <Card padding="16px" backgroundColor="var(--color-transparent)">
          <Text variant="heading4">{t("modals.export_settings")}</Text>
          <Spacer size="md" />
          <Row padding='0px' margin='0px' fitContent justifyContent='center' alignItems='center'>
            <Text variant="body2" margin="0 0 4px 0">{t("modals.format")}:</Text>
            <SelectDropdown
              options={[
                { label: t("modals.pdf_document"), value: "pdf" },
                { label: t("modals.png_image"), value: "png" }
              ]}
              value={exportOptions.format}
              onChange={(e) => handleOptionChange('format', e.target.value)}
            />
          </Row>
        </Card>
      </FlexContainer>

      <Spacer size="md" />

      <Row>
        <Button fullWidth variant="secondary" onClick={onClose}>
          {t("buttons.cancel")}
        </Button>
        <Button fullWidth variant="primary" onClick={handleExport} leftIcon={<Download size={16} />}>
          {t("buttons.export")}
        </Button>
      </Row>
    </Modal>
  )
}
