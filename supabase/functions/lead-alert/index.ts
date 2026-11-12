// Supabase Edge Function: lead-alert
// Triggered via Supabase Database Webhook on INSERT into public.leads
// Sends real-time notification to admissions counselors

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface LeadPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: {
    id: string;
    name: string;
    phone: string;
    state: string;
    admission_preference: string;
    estimated_score: number;
    is_minor: boolean;
    parent_guardian_name?: string;
    created_at: string;
  };
}

serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const payload: LeadPayload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response(JSON.stringify({ message: "No record found in payload" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log(`[Lead Alert] New Opt-In Lead: ${record.name} (${record.phone}) from ${record.state} - Score: ${record.estimated_score}/720`);

    // Optional webhook forwarding (e.g., to Slack, Discord, or CRM webhook if configured in Supabase Secrets)
    const webhookUrl = Deno.env.get("COUNSELOR_WEBHOOK_URL");
    if (webhookUrl) {
      const message = {
        text: `🎯 *New NEET 2027 Admission Lead!*
• *Student:* ${record.name} ${record.is_minor ? "(Minor - Authorized)" : ""}
• *Phone:* +91 ${record.phone}
• *State:* ${record.state}
• *Target Score:* ${record.estimated_score} / 720
• *Preference:* ${record.admission_preference}
• *Time:* ${new Date(record.created_at).toLocaleString("en-IN")}`
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      });
    }

    return new Response(
      JSON.stringify({ success: true, lead_id: record.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
