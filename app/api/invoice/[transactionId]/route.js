import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Transaction from "@/app/models/transactionModel";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Create PDF invoice matching the professional design from example
function createStyledInvoice(transaction) {
  const doc = new jsPDF();
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors for professional look
  const blueColor = [70, 130, 180]; // Steel blue
  const grayColor = [128, 128, 128];
  const lightGray = [245, 245, 245];
  
  // Logo/Company Name at top left
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 255);
  doc.text('VECTENO', 20, 25);
  
  // Invoice title at top center
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', pageWidth / 2 - 15, 25);
  
  // Invoice details - Left side
  const issueDate = new Date(transaction.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const dueDate = new Date(transaction.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Date Issued: ${issueDate}`, 20, 45);
  doc.text(`Invoice No: VC${transaction._id.toString().slice(-5)}`, 20, 52);

  // Issued to - Right side
  doc.text('Issued to:', pageWidth - 100, 45);
  doc.text(transaction.userId?.name || 'Customer Name', pageWidth - 100, 52);
  doc.text(transaction.userId?.email || 'customer@email.com', pageWidth - 100, 59);
  
  // Company details (left side)
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text('Vecteno Digital Services', 20, 85);
  doc.text('Digital Asset Marketplace', 20, 92);
  doc.text('Gudamalani, Barmer (Rajasthan)', 20, 99);
  doc.text('Email: vectenoindia@gmail.com', 20, 106);
  
  // Payment details (center)
  doc.text('Payment Gateway: Razorpay', 80, 85);
  doc.text(`Order ID: ${(transaction.razorpayOrderId || 'order_Xx5IY9f49').substring(0, 20)}`, 80, 92);
  doc.text(`Status: Completed`, 80, 99);
  
  // Table header with blue background
  const tableStartY = 120;
  doc.setFillColor(...blueColor);
  doc.rect(20, tableStartY, pageWidth - 40, 15, 'F');
  
  // Table headers
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('DESCRIPTION', 25, tableStartY + 10);
  doc.text('QTY', 80, tableStartY + 10);
  doc.text('UNIT PRICE', 110, tableStartY + 10);
  doc.text('SUBTOTAL', 145, tableStartY + 10);
  doc.text('TAX', 175, tableStartY + 10);
  
  // Table rows
  const rowY = tableStartY + 15;
  doc.setFillColor(...lightGray);
  doc.rect(20, rowY, pageWidth - 40, 15, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  const planName = transaction.planId?.name || 'Quarterly';
  const amount = (transaction.amount / 100).toFixed(2);
  
  // Table content row
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  doc.text('1', 25, rowY + 10);
  doc.text(planName, 35, rowY + 10);
  doc.text('1', 80, rowY + 10);
  doc.text(`Rs ${amount}`, 110, rowY + 10);
  doc.text(`Rs ${amount}`, 145, rowY + 10);
  doc.text('Rs 0.00', 175, rowY + 10);
  
  // Remove the second row to avoid overlap
  
  // Amount in words
  const totalAmount = transaction.amount / 100;
  const amountInWords = convertToWords(totalAmount);
  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  doc.text(`${amountInWords.toUpperCase()} RUPEES ONLY`, 25, rowY + 30);
  
  // Totals section
  const totalsY = rowY + 50;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text('SUBTOTAL', 120, totalsY);
  doc.text(`Rs ${totalAmount.toFixed(2)}`, 160, totalsY);
  doc.text('TAX', 120, totalsY + 8);
  doc.text('Rs 0.00', 160, totalsY + 8);
  
  // Grand Total
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('GRAND TOTAL', 120, totalsY + 20);
  doc.text(`Rs ${totalAmount.toFixed(2)}`, 160, totalsY + 20);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Note:', 20, pageHeight - 38);
  doc.text('Bank Name: Rimberio', 20, pageHeight - 34);
  doc.text('Account No: 0123 4567 8901', 20, pageHeight - 30);
  doc.text('Finance Manager', pageWidth - 60, pageHeight - 30);
  doc.text('Claudia', pageWidth - 60, pageHeight - 26);
  doc.text('This is a computer generated invoice.', 20, pageHeight - 22);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, pageHeight - 14);
  
  return doc.output('arraybuffer');
}

// Helper function to convert numbers to words
function convertToWords(num) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const thousands = ['', 'thousand', 'million', 'billion'];
  
  if (num === 0) return 'zero';
  
  let result = '';
  let thousandCounter = 0;
  
  while (num > 0) {
    if (num % 1000 !== 0) {
      result = convertHundreds(num % 1000, ones, teens, tens) + thousands[thousandCounter] + ' ' + result;
    }
    num = Math.floor(num / 1000);
    thousandCounter++;
  }
  
  return result.trim();
}

function convertHundreds(num, ones, teens, tens) {
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    result += teens[num - 10] + ' ';
    return result;
  }
  
  if (num > 0) {
    result += ones[num] + ' ';
  }
  
  return result;
}

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { transactionId } = params;

    // Authentication check
    let userId;
    const token = req.cookies.get("token")?.value;

    try {
      if (token) {
        const payload = await verifyJWT(token);
        userId = payload.id;
      } else {
        const session = await getServerSession({ req, ...authOptions });
        if (!session?.user?.id) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        userId = session.user.id;
      }
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    console.log("Fetching transaction with ID:", transactionId);
    
    const transaction = await Transaction.findById(transactionId)
      .populate("userId", "name email")
      .populate("planId", "name");
      
    if (!transaction) {
      console.log("Transaction not found");
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Check if the transaction belongs to the authenticated user
    if (transaction.userId._id.toString() !== userId.toString()) {
      console.log("Unauthorized access to transaction");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    console.log("Transaction found:", {
      id: transaction._id,
      userId: transaction.userId,
      planId: transaction.planId,
      amount: transaction.amount
    });

    console.log("Starting beautiful PDF generation...");
    
    // Generate styled invoice
    const pdfBuffer = createStyledInvoice(transaction);
    console.log("Beautiful PDF successfully generated.");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice_${transaction._id}.pdf`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ 
      error: "Failed to generate invoice",
      details: error.message 
    }, { status: 500 });
  }
}
