// Dynamic, on-demand exports for PDF and DOCX generation to keep initial bundle light
export interface LetterExportData {
  title: string;
  recipientTitle: string;
  recipientOrg: string;
  subject: string;
  body: string;
  caseNumber: string;
  patientName: string;
  policyNumber: string;
  claimNumber: string;
  hospitalName?: string;
  claimAmount?: number;
  deductedAmount?: number;
}

export const exportLetterToPdf = async (data: LetterExportData, filename: string = 'ClaimFight_Grievance_Appeal.pdf') => {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header banner / title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(18, 38, 63); // Navy #12263F
  doc.text(data.title.toUpperCase(), margin, cursorY);
  cursorY += 22;

  // Metadata ribbon
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(91, 107, 122); // Muted #5B6B7A
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Generated via ClaimFight on: ${todayStr} | Reference Case: ${data.caseNumber}`, margin, cursorY);
  cursorY += 15;

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  // Recipient details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(27, 39, 51);
  doc.text('TO:', margin, cursorY);
  cursorY += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(data.recipientTitle, margin, cursorY);
  cursorY += 14;
  doc.text(data.recipientOrg, margin, cursorY);
  cursorY += 20;

  // Subject line with highlight box
  doc.setFillColor(244, 246, 248);
  doc.rect(margin, cursorY, contentWidth, 32, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(18, 38, 63);
  const subjectWrapped = doc.splitTextToSize(`SUBJECT: ${data.subject}`, contentWidth - 16);
  doc.text(subjectWrapped, margin + 8, cursorY + 14);
  cursorY += 42;

  // Case Particulars Table / Key Value block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(31, 138, 138); // Teal
  doc.text('CASE PARTICULARS:', margin, cursorY);
  cursorY += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(27, 39, 51);

  const particulars = [
    `• Insured Patient Name: ${data.patientName}`,
    `• Policy Number: ${data.policyNumber}`,
    `• Claim Number / Ref: ${data.claimNumber}`,
    data.hospitalName ? `• Hospital: ${data.hospitalName}` : null,
    data.claimAmount ? `• Total Claim Amount: Rs. ${Number(data.claimAmount).toLocaleString('en-IN')}` : null,
    data.deductedAmount ? `• Amount Repudiated / Deducted: Rs. ${Number(data.deductedAmount).toLocaleString('en-IN')}` : null,
  ].filter(Boolean) as string[];

  for (const item of particulars) {
    doc.text(item, margin + 10, cursorY);
    cursorY += 14;
  }
  cursorY += 12;

  // Letter Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(27, 39, 51);

  const paragraphs = data.body.split('\n\n');
  for (const para of paragraphs) {
    if (!para.trim()) continue;

    // Check if new page is needed
    if (cursorY > pageHeight - 90) {
      doc.addPage();
      cursorY = margin;
    }

    const lines = doc.splitTextToSize(para.trim(), contentWidth);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 13 + 8;
  }

  // Footer Disclaimer
  const footerText = 'Notice: This representation was prepared using ClaimFight for general information and grievance appeal drafting. It does not constitute legal representation. Verify rules at official IRDAI / CIO portals.';
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 150, 160);
  doc.text(footerText, margin, pageHeight - 30, { maxWidth: contentWidth });

  // Save the PDF
  doc.save(filename);
};

export const exportLetterToDocx = async (data: LetterExportData, filename: string = 'ClaimFight_Grievance_Appeal.docx') => {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } = await import('docx');
  const paragraphs = data.body.split('\n\n').filter(p => p.trim().length > 0);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: data.title.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Date: ', bold: true }),
              new TextRun(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })),
              new TextRun({ text: `   |   Case Reference: ${data.caseNumber}`, italics: true })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'TO:\n', bold: true }),
              new TextRun(`${data.recipientTitle}\n`),
              new TextRun(`${data.recipientOrg}\n`)
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'SUBJECT: ', bold: true }),
              new TextRun({ text: data.subject, bold: true, underline: {} })
            ],
            spacing: { after: 300 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'CASE PARTICULARS:\n', bold: true }),
              new TextRun(`• Patient Name: ${data.patientName}\n`),
              new TextRun(`• Policy Number: ${data.policyNumber}\n`),
              new TextRun(`• Claim Reference: ${data.claimNumber}\n`),
              new TextRun(`• Hospital: ${data.hospitalName || 'As per records'}\n`),
              new TextRun(`• Disputed / Deducted Amount: Rs. ${Number(data.deductedAmount || 0).toLocaleString('en-IN')}\n`)
            ],
            spacing: { after: 300 }
          }),
          ...paragraphs.map(para => (
            new Paragraph({
              children: [new TextRun(para)],
              spacing: { after: 200, line: 276 }
            })
          )),
          new Paragraph({
            children: [
              new TextRun({
                text: '\n\nDisclaimer: This letter was drafted with ClaimFight. Policyholders should verify cited clauses and IRDAI rules before official submission.',
                italics: true,
                size: 16
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
