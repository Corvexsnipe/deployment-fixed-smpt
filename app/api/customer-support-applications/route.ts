import { NextRequest, NextResponse } from 'next/server';
import pool, { initializeDatabase, generateApplicationId, sendCustomerSupportApplicationEmail, sendAdminNotificationForCustomerSupport } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting customer support application submission...');
    await initializeDatabase();
    console.log('Database initialized');

    const formData = await request.formData();

    // Extract all form fields
    const fullName = formData.get('fullName') as string;
    const age = parseInt(formData.get('age') as string);
    const country = formData.get('country') as string;
    const city = formData.get('city') as string;
    const email = formData.get('email') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const discordUsername = formData.get('discordUsername') as string;
    const languages = formData.get('languages') as string;
    const previousExperience = formData.get('previousExperience') as string;
    const hasHostingExperience = formData.get('hasHostingExperience') === 'true';
    const hostingExperienceDetails = formData.get('hostingExperienceDetails') as string;
    const dailyHours = parseInt(formData.get('dailyHours') as string);
    const weekendAvailability = formData.get('weekendAvailability') === 'true';
    const emergencyAvailability = formData.get('emergencyAvailability') === 'true';
    const handleAngryCustomer = formData.get('handleAngryCustomer') as string;
    const handleUnknownSolution = formData.get('handleUnknownSolution') as string;
    const prioritizeMultipleCustomers = formData.get('prioritizeMultipleCustomers') as string;
    const explainTechnicalIssue = formData.get('explainTechnicalIssue') as string;
    const minecraftServerCheck = formData.get('minecraftServerCheck') as string;
    const expectedSalary = formData.get('expectedSalary') as string;
    const whyHire = formData.get('whyHire') as string;
    const agreeToRules = formData.get('agreeToRules') === 'true';

    // File uploads
    const experienceLetter = formData.get('experienceLetter') as File | null;
    const identityCard = formData.get('identityCard') as File | null;
    const passportPhoto = formData.get('passportPhoto') as File | null;

    // Validate required fields
    if (!fullName || !age || !country || !city || !email || !contactNumber || !languages || 
        !dailyHours || !handleAngryCustomer || !handleUnknownSolution || 
        !prioritizeMultipleCustomers || !explainTechnicalIssue || !minecraftServerCheck || 
        !expectedSalary || !whyHire || !agreeToRules) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const applicationId = generateApplicationId();
    console.log('Generated application ID:', applicationId);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'customer-support');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log('Uploads directory already exists or creation failed');
    }

    // Save files and get their paths
    let experienceLetterPath = null;
    let identityCardPath = null;
    let passportPhotoPath = null;

    if (experienceLetter) {
      const bytes = await experienceLetter.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${applicationId}_experience_letter${experienceLetter.name.substring(experienceLetter.name.lastIndexOf('.'))}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      experienceLetterPath = `/uploads/customer-support/${filename}`;
    }

    if (identityCard) {
      const bytes = await identityCard.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${applicationId}_identity_card${identityCard.name.substring(identityCard.name.lastIndexOf('.'))}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      identityCardPath = `/uploads/customer-support/${filename}`;
    }

    if (passportPhoto) {
      const bytes = await passportPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${applicationId}_passport_photo${passportPhoto.name.substring(passportPhoto.name.lastIndexOf('.'))}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      passportPhotoPath = `/uploads/customer-support/${filename}`;
    }

    const connection = await pool.getConnection();
    console.log('Database connection acquired');

    try {
      await connection.query(
        `INSERT INTO customer_support_applications (
          application_id, full_name, age, country, city, email, contact_number, discord_username,
          languages, previous_experience, has_hosting_experience, hosting_experience_details,
          experience_letter_path, daily_hours, weekend_availability, emergency_availability,
          handle_angry_customer, handle_unknown_solution, prioritize_multiple_customers,
          explain_technical_issue, minecraft_server_check, expected_salary,
          identity_card_path, passport_photo_path, why_hire, agree_to_rules
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId, fullName, age, country, city, email, contactNumber, discordUsername,
          languages, previousExperience, hasHostingExperience, hostingExperienceDetails,
          experienceLetterPath, dailyHours, weekendAvailability, emergencyAvailability,
          handleAngryCustomer, handleUnknownSolution, prioritizeMultipleCustomers,
          explainTechnicalIssue, minecraftServerCheck, expectedSalary,
          identityCardPath, passportPhotoPath, whyHire, agreeToRules
        ]
      );
      console.log('Application saved to database');
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      connection.release();
      throw dbError;
    }

    connection.release();

    // Send email notification to applicant
    try {
      await sendCustomerSupportApplicationEmail(fullName, email, applicationId);
      console.log('Email sent successfully to applicant');
    } catch (emailError) {
      console.error('Email sending error to applicant:', emailError);
      // Email failure is logged but does not prevent application submission
      // The application is already saved to the database
    }

    // Send notification to admin
    try {
      await sendAdminNotificationForCustomerSupport(fullName, email, applicationId);
      console.log('Admin notification sent successfully');
    } catch (emailError) {
      console.error('Admin notification sending error:', emailError);
      // Email failure is logged but does not prevent application submission
      // The application is already saved to the database
    }

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        applicationId,
        emailStatus: 'Email sending completed (check logs for details)'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await initializeDatabase();

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM customer_support_applications ORDER BY created_at DESC'
    );
    connection.release();

    return NextResponse.json({ applications: rows });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
