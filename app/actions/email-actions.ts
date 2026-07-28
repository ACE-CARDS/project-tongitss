// https://nodemailer.com/
"use server"

import nodemailer from "nodemailer"
import { createClient } from "@/utils/supabase/server"

// Email Config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

const senderString = `"ACE CARDS System" <${process.env.EMAIL_USER}>`

// Helper functions
function isDeliverable(email: string): boolean {
  const normalized = email.toLowerCase()
  const testDomains = ["dummy", "test", "example", "fake"]
  for (const domain of testDomains) {
    if (normalized.includes(domain)) return false
  }
  return true
}

async function sendMailSafe(to: string, subject: string, html: string) {
  if (!isDeliverable(to)) {
    console.log(`[ACE Email] Skipped test email: ${to}`)
    return { success: false, skipped: true }
  }

  try {
    const info = await transporter.sendMail({
      from: senderString,
      to,
      subject,
      html,
    })
    console.log(`[ACE Email] ✅ Sent to ${to}`)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error(`[ACE Email] ❌ Failed to send to ${to}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Thesis emails (strictly sent only to uploading author)
export async function sendThesisApprovalEmail(thesisId: number) {
  try {
    const supabase = await createClient()

    const { data: thesis, error: thesisError } = await supabase
      .from("thesis")
      .select(
        `
        id,
        thesis_title,
        thesis_abstract,
        r_category (
          r_category_name
        ),
        school (
          school_name
        ),
        thesis_author!inner (
          author (
            id,
            author_fname,
            author_lname,
            author_email
          )
        )
        `
      )
      .eq("id", thesisId)
      .single()

    if (thesisError || !thesis) {
      console.error("[ACE Email] Thesis not found:", thesisError?.message)
      return { success: false, error: "Thesis not found" }
    }

    const authors = thesis.thesis_author?.map((ta: any) => ta.author) || []
    
    if (authors.length === 0) {
      return { success: false, error: "No authors found" }
    }

    // First author
    const uploader = authors[0]
    if (!uploader.author_email) {
      return { success: false, error: "Uploader has no email" }
    }

    // Approved Thesis Email template
    const result = await sendMailSafe(
      uploader.author_email,
      `Thesis Approved: ${thesis.thesis_title}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p>Dear ${uploader.author_fname} ${uploader.author_lname},</p>
          
          <p>We are pleased to inform you that your thesis, <strong>${thesis.thesis_title}</strong>, has been <strong style="color: #059669;">APPROVED</strong> by the ACE CARDS review committee.</p>
          <p>Your thesis will now be displayed in the ACE CARDS website.</p>
          </div>

          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from ACE CARDS System.
          </p>
        </div>
      `
    )

    return { success: result.success, result }
  } catch (err: any) {
    console.error("[ACE Email] Thesis approval error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendThesisRejectionEmail(thesisId: number, reason: string) {
  try {
    const supabase = await createClient()

    const { data: thesis, error: thesisError } = await supabase
      .from("thesis")
      .select(
        `
        id,
        thesis_title,
        r_category (
          r_category_name
        ),
        school (
          school_name
        ),
        thesis_author!inner (
          author (
            id,
            author_fname,
            author_lname,
            author_email
          )
        )
        `
      )
      .eq("id", thesisId)
      .single()

    if (thesisError || !thesis) {
      console.error("[ACE Email] Thesis not found:", thesisError?.message)
      return { success: false, error: "Thesis not found" }
    }

    const authors = thesis.thesis_author?.map((ta: any) => ta.author) || []
    
    if (authors.length === 0) {
      return { success: false, error: "No authors found" }
    }

    const uploader = authors[0]
    if (!uploader.author_email) {
      return { success: false, error: "Uploader has no email" }
    }

    // Rejected Thesis Email template
    const result = await sendMailSafe(
      uploader.author_email,
      `Thesis Rejected: ${thesis.thesis_title}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">          
          <p>Dear ${uploader.author_fname} ${uploader.author_lname},</p>
          
          <p>We regret to inform you that your thesis, <strong>${thesis.thesis_title}</strong>, has been <strong style="color: #dc2626;">REJECTED</strong> by the ACE CARDS review committee.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason for Rejection:</strong><br></p> 
            <p>${reason}</p>
          </div>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from the ACE CARDS System.
          </p>
        </div>
      `
    )

    return { success: result.success, result }
  } catch (err: any) {
    console.error("[ACE Email] Thesis rejection error:", err)
    return { success: false, error: err.message }
  }
}

// Survey Emails
export async function sendSurveyApprovalEmail(surveyId: number) {
  try {
    const supabase = await createClient()

    const { data: survey, error: surveyError } = await supabase
      .from("survey")
      .select(
        `
        id,
        survey_title,
        survey_desc,
        survey_link,
        survey_end,
        r_category (
          r_category_name
        ),
        school (
          school_name
        ),
        survey_author!inner (
          author (
            id,
            author_fname,
            author_lname,
            author_email
          )
        )
        `
      )
      .eq("id", surveyId)
      .single()

    if (surveyError || !survey) {
      console.error("[ACE Email] Survey not found:", surveyError?.message)
      return { success: false, error: "Survey not found" }
    }

    const authors = survey.survey_author?.map((sa: any) => sa.author) || []
    
    if (authors.length === 0) {
      return { success: false, error: "No authors found" }
    }

    const uploader = authors[0]
    if (!uploader.author_email) {
      return { success: false, error: "Uploader has no email" }
    }

    // Approved Survey Email template
    const result = await sendMailSafe(
      uploader.author_email,
      `Survey Approved: ${survey.survey_title}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">          
          <p>Dear ${uploader.author_fname} ${uploader.author_lname},</p>
          
          <p>We are pleased to inform you that your survey, <strong>${survey.survey_title}</strong>, has been <strong style="color: #059669;">APPROVED</strong> by the ACE CARDS review committee.</p>
          <p>Your survey will now be displayed in the ACE CARDS website.</p>
          </div>

          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from ACE CARDS System.
          </p>
        </div>
      `
    )

    return { success: result.success, result }
  } catch (err: any) {
    console.error("[ACE Email] Survey approval error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendSurveyRejectionEmail(surveyId: number, reason: string) {
  try {
    const supabase = await createClient()

    const { data: survey, error: surveyError } = await supabase
      .from("survey")
      .select(
        `
        id,
        survey_title,
        r_category (
          r_category_name
        ),
        school (
          school_name
        ),
        survey_author!inner (
          author (
            id,
            author_fname,
            author_lname,
            author_email
          )
        )
        `
      )
      .eq("id", surveyId)
      .single()

    if (surveyError || !survey) {
      console.error("[ACE Email] Survey not found:", surveyError?.message)
      return { success: false, error: "Survey not found" }
    }

    const authors = survey.survey_author?.map((sa: any) => sa.author) || []
    
    if (authors.length === 0) {
      return { success: false, error: "No authors found" }
    }

    const uploader = authors[0]
    if (!uploader.author_email) {
      return { success: false, error: "Uploader has no email" }
    }

    const result = await sendMailSafe(
      uploader.author_email,
      `Survey Rejected: ${survey.survey_title}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p>Dear ${uploader.author_fname} ${uploader.author_lname},</p>
          
          <p>We regret to inform you that your survey, <strong>${survey.survey_title}</strong>, has been <strong style="color: #dc2626;">REJECTED</strong> by the ACE CARDS review committee.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason for Rejection:</strong><br></p>
              <p>${reason}</p>
          </div>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from ACE CARDS System.
          </p>
        </div>
      `
    )

    return { success: result.success, result }
  } catch (err: any) {
    console.error("[ACE Email] Survey rejection error:", err)
    return { success: false, error: err.message }
  }
}