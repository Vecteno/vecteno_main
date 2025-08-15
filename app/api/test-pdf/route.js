import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== Test jsPDF Generation Started ===");
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('TEST INVOICE', 20, 20);
    
    doc.setFontSize(12);
    doc.text('This is a test PDF using jsPDF', 20, 40);
    doc.text('Invoice ID: TEST-123', 20, 60);
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, 80);
    doc.text('Amount: ₹100.00', 20, 100);
    doc.text('Test completed successfully!', 20, 120);
    
    const pdfBuffer = doc.output('arraybuffer');
    console.log("Test jsPDF buffer created, size:", pdfBuffer.byteLength);
    console.log("=== Test jsPDF Generation Completed Successfully ===");
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=test_invoice.pdf`,
      },
    });
  } catch (error) {
    console.error("=== Test jsPDF Generation Failed ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      error: "Failed to generate test PDF",
      details: error.message 
    }, { status: 500 });
  }
}
