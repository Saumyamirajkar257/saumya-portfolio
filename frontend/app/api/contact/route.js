import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, website } = body;

    // Honeypot spam trap
    if (website && website.trim() !== "") {
      return NextResponse.json({
        success: true,
        message: "Message received! Thank you.",
      });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { detail: "Name, email, and message are required." },
        { status: 422 }
      );
    }

    // Optional Web3Forms forwarding (free email forwarder, no server needed)
    const web3FormsKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (web3FormsKey) {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: web3FormsKey,
            name,
            email,
            subject: subject || "New Contact Message from Portfolio",
            message,
          }),
        });
      } catch (err) {
        console.error("Error forwarding contact email:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! I'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { detail: "Unable to process message at this time." },
      { status: 500 }
    );
  }
}
