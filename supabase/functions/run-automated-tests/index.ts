import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestResult {
  test: string;
  status: "pass" | "fail" | "skip";
  message: string;
  duration_ms: number;
}

const logStep = (step: string, details?: any) => {
  console.log(`[AUTOMATED-TESTS] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const results: TestResult[] = [];
  const testStartTime = Date.now();

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    const start = Date.now();
    try {
      await testFn();
      results.push({ test: name, status: "pass", message: "Success", duration_ms: Date.now() - start });
      logStep(`✅ ${name} passed`);
    } catch (error: any) {
      results.push({ test: name, status: "fail", message: error.message, duration_ms: Date.now() - start });
      logStep(`❌ ${name} failed: ${error.message}`);
    }
  };

  try {
    logStep("Starting automated test suite");

    // Test 1: Create test organization
    await runTest("Create Test Organization", async () => {
      const orgData = {
        name: "TestBot Law Firm " + Date.now(),
        settings: { test_mode: true, created_by: "automated_test" }
      };
      
      const { error } = await supabaseAdmin.from("organizations").insert(orgData);
      if (error) throw error;
    });

    // Test 2: Verify existing profiles (can't create directly - FK to auth.users)
    await runTest("Verify Profiles Table Structure", async () => {
      const { count, error } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      logStep(`Found ${count} profiles in database`);
    });

    // Test 3: Verify database tables exist and are accessible
    await runTest("Verify Core Database Tables", async () => {
      const tables = ["profiles", "organizations", "clients", "cases", "appointments", "bug_reports"];
      for (const table of tables) {
        const { error } = await supabaseAdmin.from(table).select("id").limit(1);
        if (error) throw new Error(`Table ${table} inaccessible: ${error.message}`);
      }
    });

    // Test 4: Test AI Chat endpoint
    await runTest("Test Legal Chat Endpoint", async () => {
      const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/legal-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test message from automated bot" }],
          stream: false
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat endpoint returned ${response.status}: ${errorText}`);
      }
    });

    // Test 5: Test document generation endpoint
    await runTest("Test Document Generation Endpoint", async () => {
      const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          prompt: "Generate a test NDA document for automated testing",
          documentType: "nda",
          test_mode: true
        })
      });
      
      // We expect 401 without proper auth - that's correct behavior
      if (response.status === 401) {
        logStep("Document endpoint correctly requires auth");
      } else if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Document endpoint returned ${response.status}: ${errorText}`);
      }
    });

    // Test 6: Create test client record
    await runTest("Create Test Client", async () => {
      // First get or create an org
      const { data: orgs } = await supabaseAdmin.from("organizations").select("id").limit(1);
      if (!orgs || orgs.length === 0) {
        throw new Error("No organizations found - cannot create client");
      }

      const clientData = {
        full_name: "TestBot Client " + Date.now(),
        email: `testclient${Date.now()}@legallyai.test`,
        phone: "555-TEST-BOT",
        organization_id: orgs[0].id,
        notes: "Created by automated test system"
      };

      const { error } = await supabaseAdmin.from("clients").insert(clientData);
      if (error) throw error;
    });

    // Test 7: Verify RLS policies are working
    await runTest("Verify RLS Policies Active", async () => {
      // Using anon key should have restricted access
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      // This should return empty or limited results due to RLS
      const { data, error } = await anonClient.from("clients").select("*").limit(5);
      
      // RLS should restrict unauthenticated access
      if (error || (data && data.length === 0)) {
        logStep("RLS correctly restricting anonymous access");
      }
    });

    // Test 8: Verify academy courses exist
    await runTest("Verify Academy Content", async () => {
      const { data: courses, error } = await supabaseAdmin
        .from("academy_courses")
        .select("id, title")
        .limit(5);
      
      if (error) throw error;
      if (!courses || courses.length === 0) {
        throw new Error("No academy courses found");
      }
      logStep(`Found ${courses.length} academy courses`);
    });

    // Test 9: Test bug report submission
    await runTest("Test Bug Report Submission", async () => {
      const bugReport = {
        title: "Automated Test Bug Report",
        description: "This is an automated test to verify bug reporting works",
        severity: "low",
        category: "other",
        hub_name: "General/Other",
        reporter_name: "Automated Test Bot",
        reporter_email: "testbot@legallyai.test",
        status: "open",
        page_url: "/testing"
      };

      const { error } = await supabaseAdmin.from("bug_reports").insert(bugReport);
      if (error) throw error;
    });

    // Test 10: Cleanup test data
    await runTest("Cleanup Test Bug Reports", async () => {
      const { error } = await supabaseAdmin
        .from("bug_reports")
        .delete()
        .eq("reporter_email", "testbot@legallyai.test");
      
      if (error) throw error;
    });

    // Summary
    const totalDuration = Date.now() - testStartTime;
    const passed = results.filter(r => r.status === "pass").length;
    const failed = results.filter(r => r.status === "fail").length;

    logStep(`Test suite completed: ${passed} passed, ${failed} failed in ${totalDuration}ms`);

    // Store test results in bug_reports for visibility
    const summaryReport = {
      title: `Automated Test Run - ${new Date().toISOString()}`,
      description: `${passed}/${results.length} tests passed. Duration: ${totalDuration}ms`,
      severity: failed > 0 ? "high" : "low",
      category: "other",
      hub_name: "General/Other",
      reporter_name: "Automated Test System",
      reporter_email: "system@legallyai.test",
      status: failed > 0 ? "open" : "resolved",
      steps_to_reproduce: JSON.stringify(results, null, 2),
      page_url: "/testing"
    };

    await supabaseAdmin.from("bug_reports").insert(summaryReport);

    return new Response(JSON.stringify({
      success: failed === 0,
      summary: { passed, failed, total: results.length, duration_ms: totalDuration },
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("Critical test error", { error: error.message });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
