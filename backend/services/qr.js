import QRCode from "qrcode";

export const generateQRCode = async (bookingId) => {
    return await QRCode.toBuffer(bookingId);
};