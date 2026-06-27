import PDFDocument from "pdfkit";

export const generateTicketPDF = (booking, qrBuffer) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        const buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));

        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });

        doc.on("error", reject);

        // Heading
        doc.fontSize(24).text("Movie Ticket", {
            align: "center"
        });

        doc.moveDown();

        // Booking Details
        doc.fontSize(14);
        doc.text(`Movie : ${booking.movieTitle}`);
        doc.text(`Date  : ${booking.showDate}`);
        doc.text(`Time  : ${booking.showTime}`);
        doc.text(`Venue : ${booking.venue}`);
        doc.text(`Seats : ${booking.seatNumbers.join(", ")}`);
        doc.text(`Booking ID : ${booking._id}`);

        doc.moveDown(2);

        // QR Code
        doc.image(qrBuffer, {
            fit: [150, 150],
            align: "center"
        });

        doc.end();
    });
};