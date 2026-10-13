import { NextRequest, NextResponse } from 'next/server';
import pool, { initializeDatabase, generateApplicationId, sendSalesApplicationEmail, sendAdminNotificationForSales } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting sales application submission...');
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
    const hostingExperience = formData.get('hostingExperience') as string;
    const dailyHours = formData.get('dailyHours') as string;
    const weekendAvailability = formData.get('weekendAvailability') === 'true';
    const emergencyAvailability = formData.get('emergencyAvailability') === 'true';
    const expectedSalary = formData.get('expectedSalary') as string;
    const convinceCustomer = formData.get('convinceCustomer') as string;
    const expensiveResponse = formData.get('expensiveResponse') as string;
    const minecraftServerInfo = formData.get('minecraftServerInfo') as string;
    const ramCpuDifference = formData.get('ramCpuDifference') as string;
    const lagDiagnosis = formData.get('lagDiagnosis') as string;
    const whyHire = formData.get('whyHire') as string;
    const agreeToRules = formData.get('agreeToRules') === 'true';

    // File uploads
    const experienceLetter = formData.get('experienceLetter') as File | null;
    const identityCard = formData.get('identityCard') as File | null;
    const passportPhoto = formData.get('passportPhoto') as File | null;

    // Validate required fields
    if (!fullName || !age || !country || !city || !email || !contactNumber || !discordUsername || 
        !languages || !previousExperience || !hostingExperience || !dailyHours || 
        !expectedSalary || !convinceCustomer || !expensiveResponse || !minecraftServerInfo || 
        !ramCpuDifference || !lagDiagnosis || !whyHire || !agreeToRules) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const applicationId = generateApplicationId();
    console.log('Generated application ID:', applicationId);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'sales');
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
      experienceLetterPath = `/uploads/sales/${filename}`;
    }

    if (identityCard) {
      const bytes = await identityCard.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${applicationId}_identity_card${identityCard.name.substring(identityCard.name.lastIndexOf('.'))}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      identityCardPath = `/uploads/sales/${filename}`;
    }

    if (passportPhoto) {
      const bytes = await passportPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${applicationId}_passport_photo${passportPhoto.name.substring(passportPhoto.name.lastIndexOf('.'))}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      passportPhotoPath = `/uploads/sales/${filename}`;
    }

    const connection = await pool.getConnection();
    console.log('Database connection acquired');

    try {
      await connection.query(
        `INSERT INTO sales_applications (
          application_id, full_name, age, country, city, email, contact_number, discord_username,
          languages, previous_experience, hosting_experience, experience_letter_path,
          daily_hours, weekend_availability, emergency_availability, expected_salary,
          convince_customer, expensive_response, minecraft_server_info, ram_cpu_difference,
          lag_diagnosis, identity_card_path, passport_photo_path, why_hire, agree_to_rules
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId, fullName, age, country, city, email, contactNumber, discordUsername,
          languages, previousExperience, hostingExperience, experienceLetterPath,
          dailyHours, weekendAvailability, emergencyAvailability, expectedSalary,
          convinceCustomer, expensiveResponse, minecraftServerInfo, ramCpuDifference,
          lagDiagnosis, identityCardPath, passportPhotoPath, whyHire, agreeToRules
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
      await sendSalesApplicationEmail(fullName, email, applicationId);
      console.log('Email sent successfully to applicant');
    } catch (emailError) {
      console.error('Email sending error to applicant:', emailError);
      // Continue even if email fails
    }

    // Send notification to admin
    try {
      await sendAdminNotificationForSales(fullName, email, applicationId);
      console.log('Admin notification sent successfully');
    } catch (emailError) {
      console.error('Admin notification sending error:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        applicationId
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
      'SELECT * FROM sales_applications ORDER BY created_at DESC'
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
