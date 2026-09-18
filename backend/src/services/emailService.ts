import nodemailer from 'nodemailer';
import { Bill } from '../entities/Bill';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildEmailHtml(bill: Bill): string {
  const itemRows = bill.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.itemName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${item.unitPrice}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">₹${item.total}</td>
    </tr>`
    )
    .join('');

  const date = new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const time = new Date(bill.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Bill - Avadhut Bhel</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b35,#f7c59f);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:2px;text-shadow:0 1px 3px rgba(0,0,0,0.15);">
                🍽️ AVADHUT BHEL
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:500;">
                Delicious &amp; Fresh
              </p>
            </td>
          </tr>

          <!-- Bill Info -->
          <tr>
            <td style="padding:24px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Bill Number</p>
                    <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1a1a1a;">${bill.billNumber}</p>
                  </td>
                  <td style="text-align:right;">
                    <p style="margin:0;font-size:13px;color:#888;">${date}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#888;">${time}</p>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:2px dashed #eeeeee;margin:20px 0;">
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding:0 32px 16px;">
              <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Customer Details</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">👤 ${bill.customerName}</p>
              <p style="margin:4px 0 0;font-size:14px;color:#555;">📞 ${bill.customerPhone}</p>
              ${bill.customerEmail ? `<p style="margin:4px 0 0;font-size:14px;color:#555;">✉️ ${bill.customerEmail}</p>` : ''}
              <hr style="border:none;border-top:2px dashed #eeeeee;margin:20px 0 0;">
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#faf9f7;">
                    <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0f0f0;">Item</th>
                    <th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0f0f0;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0f0f0;">Rate</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0f0f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;color:#555;font-size:14px;">Subtotal</td>
                  <td style="padding:4px 0;text-align:right;color:#555;font-size:14px;">₹${bill.subtotal}</td>
                </tr>
                ${Number(bill.discount) > 0 ? `
                <tr>
                  <td style="padding:4px 0;color:#e74c3c;font-size:14px;">Discount</td>
                  <td style="padding:4px 0;text-align:right;color:#e74c3c;font-size:14px;">-₹${bill.discount}</td>
                </tr>` : ''}
                <tr>
                  <td colspan="2">
                    <hr style="border:none;border-top:2px solid #eeeeee;margin:12px 0;">
                  </td>
                </tr>
                <tr>
                  <td style="font-size:18px;font-weight:800;color:#1a1a1a;">TOTAL</td>
                  <td style="text-align:right;font-size:22px;font-weight:900;color:#ff6b35;">₹${bill.total}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:linear-gradient(135deg,#fff7f2,#fff3ec);padding:24px 32px;text-align:center;border-top:2px dashed #ffe0cc;">
              <p style="margin:0;font-size:20px;">🙏</p>
              <p style="margin:8px 0 4px;font-size:16px;font-weight:700;color:#ff6b35;">Thank You for your visit!</p>
              <p style="margin:0;font-size:13px;color:#888;">We look forward to serving you again.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBillEmail(bill: Bill): Promise<void> {
  if (!bill.customerEmail) {
    throw new Error('Customer email is not provided');
  }

  const html = buildEmailHtml(bill);
  const fromName = process.env.EMAIL_FROM_NAME || 'Avadhut Bhel';

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to: bill.customerEmail,
    subject: `🍽️ Your Bill from Avadhut Bhel — ${bill.billNumber}`,
    html,
  });
}
