const PDFDocument = require('pdfkit');

exports.generateInvoice = async (req, res) => {
  const { id } = req.params;
  const invoice = await Invoice.findById(id);

  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);

  doc.text(`Invoice ID: ${invoice._id}`);
  // Add more invoice details...

  doc.pipe(res);
  doc.end();
};
