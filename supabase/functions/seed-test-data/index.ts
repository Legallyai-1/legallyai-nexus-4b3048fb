import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Test personas for comprehensive coverage
const TEST_PERSONAS = [
  // Individual users (300)
  { type: 'individual', tier: 'free', persona: 'Free User - Document Seeker', count: 150 },
  { type: 'individual', tier: 'premium', persona: 'Premium User - Power User', count: 100 },
  { type: 'individual', tier: 'free', persona: 'Free User - Curious Browser', count: 50 },
  
  // Lawyers (200)
  { type: 'lawyer', tier: 'pro', persona: 'Solo Practitioner - Family Law', size: 'solo', count: 50 },
  { type: 'lawyer', tier: 'pro', persona: 'Solo Practitioner - Criminal Defense', size: 'solo', count: 30 },
  { type: 'lawyer', tier: 'pro', persona: 'Solo Practitioner - Estate Planning', size: 'solo', count: 20 },
  { type: 'lawyer', tier: 'free', persona: 'New Lawyer - Trial User', size: 'solo', count: 50 },
  { type: 'lawyer', tier: 'pro', persona: 'Experienced Attorney - DUI Specialist', size: 'solo', count: 30 },
  { type: 'lawyer', tier: 'pro', persona: 'Immigration Lawyer', size: 'solo', count: 20 },
  
  // Law Firms (150)
  { type: 'law_firm', tier: 'pro', persona: 'Small Firm - 2-5 Lawyers', size: 'small', count: 40 },
  { type: 'law_firm', tier: 'pro', persona: 'Medium Firm - 6-20 Lawyers', size: 'medium', count: 30 },
  { type: 'law_firm', tier: 'pro', persona: 'Large Firm - 21-100 Lawyers', size: 'large', count: 20 },
  { type: 'law_firm', tier: 'pro', persona: 'Enterprise Firm - 100+ Lawyers', size: 'enterprise', count: 10 },
  { type: 'law_firm', tier: 'free', persona: 'New Firm - Evaluating Platform', size: 'small', count: 50 },
  
  // Clients (200)
  { type: 'client', tier: 'free', persona: 'Client - Divorce Case', count: 40 },
  { type: 'client', tier: 'free', persona: 'Client - Child Custody', count: 40 },
  { type: 'client', tier: 'free', persona: 'Client - Criminal Defense', count: 30 },
  { type: 'client', tier: 'free', persona: 'Client - Estate Planning', count: 30 },
  { type: 'client', tier: 'free', persona: 'Client - Employment Issue', count: 30 },
  { type: 'client', tier: 'free', persona: 'Client - DUI Case', count: 30 },
  
  // Employees (100)
  { type: 'employee', tier: 'free', persona: 'Paralegal', count: 40 },
  { type: 'employee', tier: 'free', persona: 'Legal Secretary', count: 30 },
  { type: 'employee', tier: 'free', persona: 'Office Manager', count: 20 },
  { type: 'employee', tier: 'free', persona: 'Receptionist', count: 10 },
  
  // Students (50)
  { type: 'student', tier: 'free', persona: '1L Law Student', count: 15 },
  { type: 'student', tier: 'free', persona: '2L Law Student', count: 15 },
  { type: 'student', tier: 'premium', persona: '3L - Bar Prep', count: 10 },
  { type: 'student', tier: 'free', persona: 'Pre-Law Student', count: 10 },
];

// Hubs to test
const HUBS = [
  'Lee Legal AI', 'CustodiAI', 'DefendrAI', 'DriveSafeAI', 'MaryAI',
  'LegacyAI', 'Freedom AI', 'WorkplaceAI', 'PraxisAI', 'ScholarAI',
  'JobBoardAI', 'ProBonoAI', 'LoanAI'
];

// Test scenarios per hub
const TEST_SCENARIOS = {
  'Lee Legal AI': [
    { name: 'Chat with AI', steps: ['Open chat', 'Ask legal question', 'Verify response'], expected: 'AI responds with legal guidance' },
    { name: 'Generate Document', steps: ['Click generate', 'Fill form', 'Submit'], expected: 'Document generated successfully' },
    { name: 'Voice Input', steps: ['Click mic', 'Speak question', 'Verify transcription'], expected: 'Speech converted to text' },
  ],
  'CustodiAI': [
    { name: 'Create Custody Case', steps: ['Navigate to custody', 'Fill intake form', 'Save case'], expected: 'Custody case created' },
    { name: 'Generate Parenting Plan', steps: ['Select case', 'Click generate plan', 'Review document'], expected: 'Parenting plan generated' },
    { name: 'Calculate Child Support', steps: ['Enter income data', 'Add children', 'Calculate'], expected: 'Support amount calculated' },
    { name: 'Schedule Exchange', steps: ['Open calendar', 'Add exchange event', 'Save'], expected: 'Exchange scheduled' },
  ],
  'DefendrAI': [
    { name: 'Traffic Ticket Defense', steps: ['Enter ticket info', 'Get defense strategy', 'Generate motion'], expected: 'Defense strategy provided' },
    { name: 'Criminal Case Intake', steps: ['Fill case details', 'Upload documents', 'Submit'], expected: 'Case created' },
    { name: 'Plea Simulator', steps: ['Enter case facts', 'Run simulation', 'Review outcomes'], expected: 'Outcome predictions shown' },
  ],
  'DriveSafeAI': [
    { name: 'DUI Case Entry', steps: ['Enter arrest details', 'Input BAC', 'Save case'], expected: 'DUI case created' },
    { name: 'Hearing Simulation', steps: ['Select case', 'Start simulation', 'Complete'], expected: 'Simulation completed' },
    { name: 'DMV Hearing Prep', steps: ['Review checklist', 'Generate documents', 'Download'], expected: 'Documents ready' },
  ],
  'MaryAI': [
    { name: 'Prenuptial Agreement', steps: ['Fill form', 'Add assets', 'Generate'], expected: 'Prenup generated' },
    { name: 'Divorce Filing', steps: ['Enter case info', 'Select type', 'Generate documents'], expected: 'Divorce docs ready' },
    { name: 'Alimony Calculator', steps: ['Enter incomes', 'Add factors', 'Calculate'], expected: 'Alimony calculated' },
  ],
  'LegacyAI': [
    { name: 'Create Will', steps: ['Enter beneficiaries', 'Add assets', 'Generate will'], expected: 'Will document created' },
    { name: 'Living Trust', steps: ['Fill trust form', 'Add trustees', 'Generate'], expected: 'Trust document ready' },
    { name: 'Inheritance Simulation', steps: ['Enter estate', 'Run scenarios', 'View results'], expected: 'Distribution shown' },
  ],
  'Freedom AI': [
    { name: 'Parole Check-in', steps: ['Log check-in', 'Add notes', 'Submit'], expected: 'Check-in recorded' },
    { name: 'Violation Tracker', steps: ['Enter violation', 'Add documentation', 'Save'], expected: 'Violation tracked' },
    { name: 'Rights Information', steps: ['Browse rights', 'Search topic', 'Read info'], expected: 'Information displayed' },
  ],
  'WorkplaceAI': [
    { name: 'Employment Contract', steps: ['Fill form', 'Add terms', 'Generate'], expected: 'Contract generated' },
    { name: 'Termination Letter', steps: ['Enter reason', 'Add details', 'Generate'], expected: 'Letter created' },
    { name: 'EEOC Complaint', steps: ['Fill complaint', 'Add evidence', 'Submit'], expected: 'Complaint ready' },
  ],
  'PraxisAI': [
    { name: 'Create Organization', steps: ['Enter firm info', 'Add details', 'Save'], expected: 'Org created' },
    { name: 'Add Employee', steps: ['Enter employee', 'Set role', 'Invite'], expected: 'Employee added' },
    { name: 'Time Tracking', steps: ['Log time', 'Add case', 'Save entry'], expected: 'Time logged' },
    { name: 'Generate Invoice', steps: ['Select client', 'Add items', 'Generate'], expected: 'Invoice created' },
  ],
  'ScholarAI': [
    { name: 'Browse Courses', steps: ['Open academy', 'Browse categories', 'View course'], expected: 'Courses displayed' },
    { name: 'Take Quiz', steps: ['Start quiz', 'Answer questions', 'Submit'], expected: 'Quiz graded' },
    { name: 'Bar Prep', steps: ['Access bar prep', 'Study materials', 'Practice test'], expected: 'Materials available' },
  ],
  'JobBoardAI': [
    { name: 'Post Job', steps: ['Create posting', 'Add requirements', 'Publish'], expected: 'Job posted' },
    { name: 'Search Jobs', steps: ['Enter criteria', 'Filter results', 'View jobs'], expected: 'Jobs displayed' },
    { name: 'Apply for Job', steps: ['Select job', 'Upload resume', 'Submit'], expected: 'Application sent' },
  ],
  'ProBonoAI': [
    { name: 'Find Pro Bono', steps: ['Search opportunities', 'Filter by area', 'View details'], expected: 'Opportunities shown' },
    { name: 'Volunteer Match', steps: ['Create profile', 'Set preferences', 'Get matches'], expected: 'Matches provided' },
  ],
  'LoanAI': [
    { name: 'Loan Application', steps: ['Fill application', 'Upload docs', 'Submit'], expected: 'Application submitted' },
    { name: 'Loan Calculator', steps: ['Enter amount', 'Set terms', 'Calculate'], expected: 'Payment shown' },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Seed test scenarios
    const scenariosToInsert = [];
    for (const [hubName, scenarios] of Object.entries(TEST_SCENARIOS)) {
      for (const scenario of scenarios) {
        scenariosToInsert.push({
          hub_name: hubName,
          scenario_name: scenario.name,
          steps: scenario.steps,
          expected_result: scenario.expected,
          user_types: ['individual', 'lawyer', 'law_firm', 'client', 'employee', 'student'],
          priority: 2,
          is_automated: false
        });
      }
    }

    const { error: scenarioError } = await supabaseClient
      .from('test_scenarios')
      .upsert(scenariosToInsert, { onConflict: 'hub_name,scenario_name' });

    if (scenarioError) {
      console.error('Error seeding scenarios:', scenarioError);
    }

    // Generate test user profiles (without actual auth users)
    const testUsersToInsert = [];
    let userIndex = 0;

    for (const persona of TEST_PERSONAS) {
      for (let i = 0; i < persona.count; i++) {
        userIndex++;
        const hubsToTest = HUBS.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 5) + 3);
        
        testUsersToInsert.push({
          test_persona: `${persona.persona} #${userIndex}`,
          user_type: persona.type,
          subscription_tier: persona.tier,
          organization_size: persona.size || null,
          hubs_to_test: hubsToTest,
          test_scenarios: [],
          tests_completed: [],
          issues_found: 0
        });
      }
    }

    const { data: insertedUsers, error: userError } = await supabaseClient
      .from('test_users')
      .insert(testUsersToInsert)
      .select();

    if (userError) {
      console.error('Error seeding test users:', userError);
      throw userError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${testUsersToInsert.length} test user profiles and ${scenariosToInsert.length} test scenarios`,
        stats: {
          test_users: testUsersToInsert.length,
          test_scenarios: scenariosToInsert.length,
          hubs_covered: HUBS.length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
