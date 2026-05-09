import fs from "fs";
import path from "path";

const uploadsRoot = path.resolve(process.cwd(), "uploads");
const receiptsRoot = path.join(uploadsRoot, "receipts");

const ensureReceiptsDirectory = () => {
  if (!fs.existsSync(receiptsRoot)) {
    fs.mkdirSync(receiptsRoot, { recursive: true });
  }
};

const escapePdfText = (value) =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapLine = (label, value, maxLength = 82) => {
  const fullText = value ? `${label}: ${value}` : `${label}: -`;
  const words = fullText.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const buildPdfContent = (textRows) =>
  textRows
    .map(
      ({ size, x = 50, y, text }) =>
        `BT\n/F1 ${size} Tf\n${x} ${y} Td\n(${escapePdfText(text)}) Tj\nET`,
    )
    .join("\n");

const writePdf = (outputPath, content) => {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((objectContent, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${objectContent}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  fs.writeFileSync(outputPath, pdf, "binary");
};

const buildReceiptNumber = (feeRecord) =>
  `SA-${feeRecord.year}${String(feeRecord.month).padStart(2, "0")}-${Date.now()
    .toString()
    .slice(-6)}`;

export const generateFeeReceipt = async ({ feeRecord, payment, settings, baseUrl }) => {
  ensureReceiptsDirectory();

  const receiptNumber = payment.receiptNumber || buildReceiptNumber(feeRecord);
  const fileName = `${receiptNumber.toLowerCase()}.pdf`;
  const outputPath = path.join(receiptsRoot, fileName);
  const monthLabel = new Date(2000, Number(feeRecord.month) - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });

  const rows = [
    { size: 18, y: 800, text: settings.instituteName || "Sarvodaya Academy" },
    {
      size: 12,
      y: 778,
      text:
        settings.instituteSubtitle || "NAFS Fire and Safety College, Kolhapur",
    },
    {
      size: 11,
      y: 758,
      text: settings.affiliation || "Affiliated with NAFS India",
    },
    { size: 15, y: 728, text: "Fee Receipt" },
    { size: 11, y: 706, text: `Receipt Number: ${receiptNumber}` },
  ];

  const detailLines = [
    ...wrapLine("Student Name", feeRecord.student?.name),
    ...wrapLine("Course Name", feeRecord.student?.courseEnrolled),
    ...wrapLine("Month", `${monthLabel} ${feeRecord.year}`),
    ...wrapLine("Amount Paid", `INR ${Number(payment.amountPaid || 0).toFixed(2)}`),
    ...wrapLine("Payment Mode", payment.paymentMode),
    ...wrapLine(
      "Payment Date",
      new Date(payment.paymentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ),
    ...wrapLine("Transaction ID", payment.transactionId || "Not provided"),
    ...wrapLine("Contact", settings.contactPhone || settings.contactEmail || "Sarvodaya Academy"),
    ...wrapLine("Address", settings.address || "Kolhapur, Maharashtra, India"),
    ...wrapLine("Logo Reference", settings.logoUrl || "Configured institute branding"),
  ];

  let currentY = 680;
  detailLines.forEach((line) => {
    rows.push({ size: 11, y: currentY, text: line });
    currentY -= 18;
  });

  rows.push({
    size: 10,
    y: Math.max(currentY - 24, 80),
    text: "This is a system-generated receipt from Sarvodaya Academy.",
  });

  writePdf(outputPath, buildPdfContent(rows));

  return {
    receiptNumber,
    receiptUrl: `${baseUrl}/uploads/receipts/${fileName}`,
    receiptGeneratedAt: new Date(),
  };
};
