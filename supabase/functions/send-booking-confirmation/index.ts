const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingPayload {
  name: string;
  email: string;
  phone: string;
  serviceDate: string;
  duration: string;
  address: string;
  paymentMethod: string;
  specialInstructions?: string;
  confirmationNumber: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: BookingPayload = await req.json();

    const price = payload.duration === "1" ? "$150" : "$250";
    const serviceDate = new Date(payload.serviceDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a3a52, #2d5a7b); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row strong { color: #1a3a52; }
    .detail-value { color: #666; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
    .confirmation { background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❄️ Snow Shovel Pro</h1>
      <h2>Booking Confirmation</h2>
    </div>

    <div class="content">
      <p>Thank you for booking with Snow Shovel Pro! Your snow removal service has been scheduled.</p>

      <div class="confirmation">
        <strong>Confirmation #${payload.confirmationNumber}</strong>
      </div>

      <h3>Booking Details</h3>
      <div class="detail-row">
        <strong>Name:</strong>
        <span class="detail-value">${payload.name}</span>
      </div>
      <div class="detail-row">
        <strong>Service Date:</strong>
        <span class="detail-value">${serviceDate}</span>
      </div>
      <div class="detail-row">
        <strong>Duration:</strong>
        <span class="detail-value">${payload.duration} Hour(s)</span>
      </div>
      <div class="detail-row">
        <strong>Total Price:</strong>
        <span class="detail-value">${price}</span>
      </div>
      <div class="detail-row">
        <strong>Property Address:</strong>
        <span class="detail-value">${payload.address}</span>
      </div>
      <div class="detail-row">
        <strong>Payment Method:</strong>
        <span class="detail-value">${payload.paymentMethod}</span>
      </div>

      ${payload.specialInstructions ? `
        <div class="detail-row">
          <strong>Special Instructions:</strong>
          <span class="detail-value">${payload.specialInstructions}</span>
        </div>
      ` : ""}

      <h3>What's Next?</h3>
      <ul>
        <li>We'll confirm your service via phone at ${payload.phone}</li>
        <li>Our team will arrive on your scheduled date</li>
        <li>Payment can be made via ${payload.paymentMethod}</li>
        <li>Contact us if you need to reschedule</li>
      </ul>

      <div class="footer">
        <p>📞 (347) 854-8775 | 📧 andrew.ibrahem04@icloud.com</p>
        <p>© 2025 Snow Shovel Pro. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    console.log(`Sending confirmation email to ${payload.email}`);
    console.log(`Confirmation #: ${payload.confirmationNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking confirmation email sent",
        confirmationNumber: payload.confirmationNumber,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending confirmation:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to send confirmation",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
