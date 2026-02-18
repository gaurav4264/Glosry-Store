import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order, currency) => {
    try {
        const doc = new jsPDF();
        const primaryColor = [16, 185, 129]; // SabziKart Green

        // -- Header / Branding --
        doc.setFontSize(28);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont("helvetica", "bold");
        doc.text("SABZIKART", 105, 25, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text("FRESH GROCERIES DELIVERED TO YOUR DOOR", 105, 32, { align: "center" });

        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(1);
        doc.line(20, 38, 190, 38);

        // -- Order & Address Info Section --
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE DETAILS", 20, 50);
        doc.text("SHIPPING TO", 120, 50);

        doc.line(20, 52, 60, 52);
        doc.line(120, 52, 160, 52);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80);

        // Left: Order Info
        const orderId = String(order._id);
        doc.text(`Invoice ID: #${orderId.slice(-8).toUpperCase()}`, 20, 60);
        doc.text(`Full ID: ${orderId}`, 20, 66);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 20, 72);
        doc.text(`Payment: ${order.paymentType}`, 20, 78);

        // Payment Status Display
        if (order.isPaid) {
            doc.setTextColor(16, 185, 129);
            doc.setFont("helvetica", "bold");
            doc.text("STATUS: PAID", 20, 84);
        } else {
            doc.setTextColor(220, 38, 38);
            doc.setFont("helvetica", "bold");
            doc.text(`STATUS: ${order.paymentType === 'COD' ? 'PAY ON DELIVERY' : 'UNPAID'}`, 20, 84);
        }
        doc.setTextColor(80);
        doc.setFont("helvetica", "normal");

        // Right: Address Info
        const addr = order.address;
        if (addr) {
            doc.text(`${addr.firstName} ${addr.lastName}`, 120, 60);
            doc.text(`${addr.street}`, 120, 65);
            doc.text(`${addr.city}, ${addr.state}`, 120, 70);
            doc.text(`${addr.zipcode}, ${addr.country}`, 120, 75);
            doc.text(`Phone: ${addr.phone}`, 120, 80);
        }

        // -- Items Table --
        // Fix for currency symbol: Use "Rs. " if the symbol fails or just ensure clean string
        const safeCurrency = currency === '₹' ? 'Rs. ' : currency;

        const tableColumn = ["#", "Item Name", "Category", "Qty", "Price", "Total"];
        const tableRows = [];

        order.items.forEach((item, index) => {
            const itemData = [
                index + 1,
                item.product?.name || "Product Removed",
                item.product?.category || "N/A",
                item.quantity,
                `${safeCurrency}${item.product?.offerPrice || 0}`,
                `${safeCurrency}${(item.product?.offerPrice || 0) * item.quantity}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
            columnStyles: {
                0: { cellWidth: 10 },
                3: { halign: 'center' },
                4: { halign: 'right' },
                5: { halign: 'right' }
            }
        });

        // -- Payment Summary --
        let finalY = doc.lastAutoTable.finalY + 10;

        const summaryX = 130;
        doc.setFontSize(10);
        doc.setTextColor(40);

        const subtotal = order.items.reduce((acc, item) => acc + (item.product?.offerPrice || 0) * item.quantity, 0);
        const tax = Math.floor((subtotal - (order.discount || 0)) * 0.02);

        doc.text("Sub-total:", summaryX, finalY);
        doc.text(`${safeCurrency}${subtotal}`, 185, finalY, { align: 'right' });

        finalY += 6;
        if (order.discount > 0) {
            doc.setTextColor(16, 185, 129);
            doc.text(`Discount (${order.couponCode || 'COUPON'}):`, summaryX, finalY);
            doc.text(`-${safeCurrency}${order.discount}`, 185, finalY, { align: 'right' });
            doc.setTextColor(40);
            finalY += 6;
        }

        doc.text("Tax (GST 2%):", summaryX, finalY);
        doc.text(`${safeCurrency}${tax}`, 185, finalY, { align: 'right' });

        finalY += 8;
        doc.setLineWidth(0.5);
        doc.line(summaryX, finalY - 4, 190, finalY - 4);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Total Amount:", summaryX, finalY + 2);
        doc.text(`${safeCurrency}${order.amount}`, 185, finalY + 2, { align: 'right' });

        // Amount paid detail
        finalY += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        if (order.isPaid) {
            doc.setTextColor(16, 185, 129);
            doc.text(`Amount Paid: ${safeCurrency}${order.amount}`, summaryX, finalY);
        } else if (order.paymentType === 'COD') {
            doc.setTextColor(220, 38, 38);
            doc.text(`Balance to be Paid (COD): ${safeCurrency}${order.amount}`, summaryX, finalY);
        }
        doc.setTextColor(40);

        // -- Bottom Bar --
        finalY += 30;

        // Thank you message
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Thank you for shopping with us!", 105, finalY, { align: "center" });

        // Signature Area
        finalY += 20;
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.setFont("helvetica", "normal");
        doc.text("For SabziKart Stores", 150, finalY);

        // Gaurav Signature (Cursive-like simulation using Courier bold italic in black)
        doc.setFont("courier", "bolditalic");
        doc.setFontSize(22);
        doc.setTextColor(0); // Black Pen
        doc.text("Gaurav", 155, finalY + 12);

        doc.setLineWidth(0.2);
        doc.line(140, finalY + 14, 190, finalY + 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("Authorized Signatory", 155, finalY + 18);

        // Save PDF
        doc.save(`SabziKart_Invoice_${orderId.slice(-6)}.pdf`);
    } catch (error) {
        console.error("Invoice Generation Error:", error);
    }
};
