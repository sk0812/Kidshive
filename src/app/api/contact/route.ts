import { NextResponse } from 'next/server';
import { Resend } from 'resend'; // Install this package: npm install resend

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Send email using Resend
    await resend.emails.send({
      from: 'contact@kidshive.co.uk', // Use your verified domain
      to: ['shilpakheria@gmail.com'], // Where you want to receive contact form submissions
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    // Optionally, save to database here

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 