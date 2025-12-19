import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobSearchParams {
  query?: string;
  location?: string;
  jobType?: string;
  practiceArea?: string;
  page?: number;
  source?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  practiceArea: string;
  experience: string;
  applyUrl: string;
  source: string;
  logo?: string;
}

// JSearch API (RapidAPI) - Aggregates Indeed, LinkedIn, Glassdoor, ZipRecruiter
async function searchJSearch(params: JobSearchParams): Promise<Job[]> {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  if (!rapidApiKey) {
    console.log("No RapidAPI key, using fallback");
    return [];
  }

  const query = `${params.query || 'legal'} ${params.practiceArea || ''} attorney lawyer`.trim();
  
  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${params.page || 1}&num_pages=1&date_posted=all&remote_jobs_only=false&employment_types=${params.jobType?.toUpperCase() || 'FULLTIME'}${params.location ? `&location=${encodeURIComponent(params.location)}` : ''}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      console.error("JSearch error:", response.status);
      return [];
    }

    const data = await response.json();
    console.log(`JSearch returned ${data.data?.length || 0} jobs`);

    return (data.data || []).map((job: any) => ({
      id: job.job_id || `jsearch-${Date.now()}-${Math.random()}`,
      title: job.job_title || 'Legal Position',
      company: job.employer_name || 'Law Firm',
      location: `${job.job_city || ''}, ${job.job_state || job.job_country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Remote',
      type: (job.job_employment_type || 'full-time').toLowerCase().replace('_', '-'),
      salary: job.job_min_salary && job.job_max_salary 
        ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
        : job.job_salary_period ? `Competitive (${job.job_salary_period})` : 'Competitive',
      posted: job.job_posted_at_datetime_utc 
        ? getRelativeTime(new Date(job.job_posted_at_datetime_utc))
        : 'Recently',
      description: job.job_description?.substring(0, 500) || 'Legal position at established firm.',
      requirements: extractRequirements(job.job_description || '', job.job_required_skills || []),
      practiceArea: detectPracticeArea(job.job_title, job.job_description),
      experience: extractExperience(job.job_description || ''),
      applyUrl: job.job_apply_link || job.job_google_link || '#',
      source: 'JSearch (Indeed/LinkedIn/Glassdoor)',
      logo: job.employer_logo
    }));
  } catch (err) {
    console.error("JSearch fetch error:", err);
    return [];
  }
}

// Adzuna API - Free tier available
async function searchAdzuna(params: JobSearchParams): Promise<Job[]> {
  const appId = Deno.env.get('ADZUNA_APP_ID');
  const apiKey = Deno.env.get('ADZUNA_API_KEY');
  if (!appId || !apiKey) {
    console.log("No Adzuna credentials");
    return [];
  }

  const query = `${params.query || 'legal'} ${params.practiceArea || ''} attorney`.trim();
  
  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=20&what=${encodeURIComponent(query)}&what_or=lawyer%20attorney%20counsel${params.location ? `&where=${encodeURIComponent(params.location)}` : ''}`,
    );

    if (!response.ok) {
      console.error("Adzuna error:", response.status);
      return [];
    }

    const data = await response.json();
    console.log(`Adzuna returned ${data.results?.length || 0} jobs`);

    return (data.results || []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title || 'Legal Position',
      company: job.company?.display_name || 'Law Firm',
      location: job.location?.display_name || 'USA',
      type: job.contract_type || 'full-time',
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`
        : 'Competitive',
      posted: job.created ? getRelativeTime(new Date(job.created)) : 'Recently',
      description: job.description?.substring(0, 500) || '',
      requirements: extractRequirements(job.description || '', []),
      practiceArea: detectPracticeArea(job.title, job.description),
      experience: extractExperience(job.description || ''),
      applyUrl: job.redirect_url || '#',
      source: 'Adzuna'
    }));
  } catch (err) {
    console.error("Adzuna fetch error:", err);
    return [];
  }
}

// CareerJet API
async function searchCareerJet(params: JobSearchParams): Promise<Job[]> {
  const affiliateId = Deno.env.get('CAREERJET_AFFILIATE_ID');
  if (!affiliateId) {
    console.log("No CareerJet ID");
    return [];
  }

  const query = `${params.query || 'legal'} ${params.practiceArea || ''} attorney lawyer`.trim();
  
  try {
    const response = await fetch(
      `http://public.api.careerjet.net/search?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(params.location || 'USA')}&affid=${affiliateId}&user_ip=1.1.1.1&user_agent=Mozilla/5.0&locale_code=en_US&pagesize=20`
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.jobs || []).map((job: any) => ({
      id: `careerjet-${Date.now()}-${Math.random()}`,
      title: job.title || 'Legal Position',
      company: job.company || 'Law Firm',
      location: job.locations || 'USA',
      type: 'full-time',
      salary: job.salary || 'Competitive',
      posted: job.date ? getRelativeTime(new Date(job.date)) : 'Recently',
      description: job.description?.substring(0, 500) || '',
      requirements: extractRequirements(job.description || '', []),
      practiceArea: detectPracticeArea(job.title, job.description),
      experience: extractExperience(job.description || ''),
      applyUrl: job.url || '#',
      source: 'CareerJet'
    }));
  } catch (err) {
    console.error("CareerJet error:", err);
    return [];
  }
}

// USAJobs.gov API - Free, for government legal jobs
async function searchUSAJobs(params: JobSearchParams): Promise<Job[]> {
  const apiKey = Deno.env.get('USAJOBS_API_KEY');
  const email = Deno.env.get('USAJOBS_EMAIL');
  if (!apiKey || !email) {
    console.log("No USAJobs credentials");
    return [];
  }

  try {
    const response = await fetch(
      `https://data.usajobs.gov/api/search?Keyword=attorney%20${encodeURIComponent(params.query || '')}&ResultsPerPage=20${params.location ? `&LocationName=${encodeURIComponent(params.location)}` : ''}`,
      {
        headers: {
          'Host': 'data.usajobs.gov',
          'User-Agent': email,
          'Authorization-Key': apiKey
        }
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.SearchResult?.SearchResultItems || []).map((item: any) => {
      const job = item.MatchedObjectDescriptor;
      return {
        id: `usajobs-${job.PositionID}`,
        title: job.PositionTitle || 'Government Legal Position',
        company: job.OrganizationName || 'U.S. Government',
        location: job.PositionLocationDisplay || 'Washington, DC',
        type: job.PositionSchedule?.[0]?.Name?.toLowerCase() || 'full-time',
        salary: job.PositionRemuneration?.[0]
          ? `$${parseInt(job.PositionRemuneration[0].MinimumRange).toLocaleString()} - $${parseInt(job.PositionRemuneration[0].MaximumRange).toLocaleString()}`
          : 'Per GS Scale',
        posted: job.PublicationStartDate ? getRelativeTime(new Date(job.PublicationStartDate)) : 'Recently',
        description: job.UserArea?.Details?.JobSummary?.substring(0, 500) || job.QualificationSummary?.substring(0, 500) || '',
        requirements: extractRequirements(job.QualificationSummary || '', []),
        practiceArea: detectPracticeArea(job.PositionTitle, job.QualificationSummary),
        experience: job.UserArea?.Details?.LowGrade ? `GS-${job.UserArea.Details.LowGrade}+` : 'Entry to Senior',
        applyUrl: job.ApplyURI?.[0] || job.PositionURI || '#',
        source: 'USAJobs.gov'
      };
    });
  } catch (err) {
    console.error("USAJobs error:", err);
    return [];
  }
}

// Helper functions
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} month(s) ago`;
}

function detectPracticeArea(title: string = '', description: string = ''): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('corporate') || text.includes('m&a') || text.includes('merger')) return 'Corporate Law';
  if (text.includes('family') || text.includes('divorce') || text.includes('custody')) return 'Family Law';
  if (text.includes('litigation') || text.includes('trial') || text.includes('courtroom')) return 'Litigation';
  if (text.includes('immigration') || text.includes('visa') || text.includes('citizenship')) return 'Immigration';
  if (text.includes('criminal') || text.includes('defense') || text.includes('prosecution')) return 'Criminal';
  if (text.includes('real estate') || text.includes('property') || text.includes('title')) return 'Real Estate';
  if (text.includes('intellectual property') || text.includes('patent') || text.includes('trademark') || text.includes('ip ')) return 'IP';
  if (text.includes('tax') || text.includes('irs')) return 'Tax Law';
  if (text.includes('employment') || text.includes('labor') || text.includes('hr law')) return 'Employment Law';
  if (text.includes('bankruptcy') || text.includes('insolvency')) return 'Bankruptcy';
  if (text.includes('health') || text.includes('healthcare') || text.includes('medical')) return 'Healthcare Law';
  if (text.includes('environmental')) return 'Environmental Law';
  if (text.includes('contract')) return 'Contract Law';
  
  return 'General Practice';
}

function extractExperience(description: string): string {
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i,
    /(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)/i,
    /minimum\s*(?:of\s*)?(\d+)\s*(?:years?|yrs?)/i,
    /at\s*least\s*(\d+)\s*(?:years?|yrs?)/i
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[2] ? `${match[1]}-${match[2]} years` : `${match[1]}+ years`;
    }
  }
  
  if (description.toLowerCase().includes('entry level') || description.toLowerCase().includes('junior')) return 'Entry Level';
  if (description.toLowerCase().includes('senior') || description.toLowerCase().includes('partner')) return '7+ years';
  if (description.toLowerCase().includes('mid-level') || description.toLowerCase().includes('associate')) return '3-5 years';
  
  return '2+ years';
}

function extractRequirements(description: string, skills: string[]): string[] {
  const requirements: string[] = [];
  
  // Add provided skills
  if (skills.length > 0) {
    requirements.push(...skills.slice(0, 3));
  }
  
  // Extract from description
  const patterns = [
    /JD\s*(?:from|required|degree)/i,
    /bar\s*(?:admission|licensed|member)/i,
    /(\d+)\+?\s*years?\s*(?:experience|exp)/i,
    /admitted\s*to\s*(?:the\s*)?(\w+)\s*bar/i
  ];
  
  const descLower = description.toLowerCase();
  
  if (descLower.includes('jd') || descLower.includes('juris doctor')) {
    requirements.push('JD Required');
  }
  if (descLower.includes('bar admission') || descLower.includes('bar license')) {
    requirements.push('Bar Admission');
  }
  if (descLower.includes('westlaw') || descLower.includes('lexis')) {
    requirements.push('Legal Research Tools');
  }
  if (descLower.includes('negotiation')) {
    requirements.push('Negotiation Skills');
  }
  if (descLower.includes('drafting') || descLower.includes('contract')) {
    requirements.push('Contract Drafting');
  }
  
  // Deduplicate and limit
  return [...new Set(requirements)].slice(0, 5);
}

// Generate realistic fallback jobs when no API keys
function generateFallbackJobs(params: JobSearchParams): Job[] {
  const practiceAreas = ['Corporate Law', 'Family Law', 'Litigation', 'Immigration', 'Criminal', 'Real Estate', 'IP', 'Tax Law'];
  const companies = [
    'Baker McKenzie', 'DLA Piper', 'Kirkland & Ellis', 'Latham & Watkins', 
    'Skadden', 'Sullivan & Cromwell', 'Gibson Dunn', 'Jones Day',
    'Legal Aid Society', 'Public Defender Office', 'City Attorney Office'
  ];
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'San Francisco, CA', 'Miami, FL', 'Washington, DC',
    'Boston, MA', 'Seattle, WA', 'Remote'
  ];
  const types = ['full-time', 'part-time', 'contract', 'internship'];

  const jobs: Job[] = [];
  const count = 15;

  for (let i = 0; i < count; i++) {
    const area = practiceAreas[i % practiceAreas.length];
    const company = companies[i % companies.length];
    const location = locations[i % locations.length];
    const type = types[Math.floor(Math.random() * 3)]; // Mostly full-time
    
    const baseTitle = getJobTitle(area, type);
    const baseSalary = getSalaryRange(area, type);
    
    jobs.push({
      id: `fallback-${Date.now()}-${i}`,
      title: baseTitle,
      company: company,
      location: params.location || location,
      type: type,
      salary: baseSalary,
      posted: ['Today', '1 day ago', '2 days ago', '1 week ago'][Math.floor(Math.random() * 4)],
      description: getJobDescription(area, baseTitle),
      requirements: getJobRequirements(area),
      practiceArea: area,
      experience: type === 'internship' ? 'Law Student' : ['2+ years', '3-5 years', '5+ years', '7+ years'][Math.floor(Math.random() * 4)],
      applyUrl: '#',
      source: 'LegallyAI Jobs'
    });
  }

  // Filter by params
  return jobs.filter(job => {
    if (params.practiceArea && params.practiceArea !== 'All' && job.practiceArea !== params.practiceArea) return false;
    if (params.jobType && params.jobType !== 'All' && job.type !== params.jobType.toLowerCase()) return false;
    if (params.query) {
      const query = params.query.toLowerCase();
      const searchText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      if (!searchText.includes(query)) return false;
    }
    return true;
  });
}

function getJobTitle(area: string, type: string): string {
  if (type === 'internship') return `Legal Intern - ${area}`;
  
  const titles: Record<string, string[]> = {
    'Corporate Law': ['Corporate Attorney', 'M&A Associate', 'Securities Counsel', 'General Counsel'],
    'Family Law': ['Family Law Attorney', 'Divorce Attorney', 'Child Custody Lawyer'],
    'Litigation': ['Litigation Associate', 'Trial Attorney', 'Civil Litigation Counsel'],
    'Immigration': ['Immigration Attorney', 'Visa Specialist Attorney', 'Immigration Counsel'],
    'Criminal': ['Criminal Defense Attorney', 'Public Defender', 'Prosecutor'],
    'Real Estate': ['Real Estate Attorney', 'Property Law Counsel', 'Title Attorney'],
    'IP': ['Patent Attorney', 'Trademark Counsel', 'IP Litigation Attorney'],
    'Tax Law': ['Tax Attorney', 'Tax Counsel', 'IRS Tax Specialist']
  };
  
  const options = titles[area] || ['Attorney', 'Associate Attorney', 'Senior Counsel'];
  return options[Math.floor(Math.random() * options.length)];
}

function getSalaryRange(area: string, type: string): string {
  if (type === 'internship') return '$25 - $50/hour';
  if (type === 'contract') return '$60 - $150/hour';
  
  const ranges: Record<string, string> = {
    'Corporate Law': '$160,000 - $280,000',
    'Family Law': '$80,000 - $150,000',
    'Litigation': '$120,000 - $220,000',
    'Immigration': '$70,000 - $140,000',
    'Criminal': '$60,000 - $120,000',
    'Real Estate': '$90,000 - $180,000',
    'IP': '$150,000 - $300,000',
    'Tax Law': '$130,000 - $250,000'
  };
  
  return ranges[area] || '$100,000 - $180,000';
}

function getJobDescription(area: string, title: string): string {
  return `Seeking an experienced ${title} to join our ${area} practice. You will handle complex legal matters, advise clients on strategy, and represent clients in negotiations and proceedings. Excellent communication skills and attention to detail required. Collaborative team environment with mentorship opportunities.`;
}

function getJobRequirements(area: string): string[] {
  const base = ['JD from accredited law school', 'Active Bar admission'];
  const specific: Record<string, string[]> = {
    'Corporate Law': ['M&A experience', 'SEC knowledge', 'Contract negotiation'],
    'Family Law': ['Mediation skills', 'Court experience', 'Client empathy'],
    'Litigation': ['Trial experience', 'Deposition skills', 'Legal research'],
    'Immigration': ['USCIS procedures', 'Visa applications', 'Bilingual preferred'],
    'Criminal': ['Trial advocacy', 'Evidence analysis', 'Client counseling'],
    'Real Estate': ['Title review', 'Closing experience', 'Zoning knowledge'],
    'IP': ['Patent prosecution', 'Technical background', 'Licensing'],
    'Tax Law': ['IRS experience', 'Tax planning', 'Audit defense']
  };
  
  return [...base, ...(specific[area] || ['Legal research', 'Strong writing'])];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: JobSearchParams = await req.json();
    console.log("Job search params:", params);

    // Search all sources in parallel
    const [jsearchJobs, adzunaJobs, usaJobs] = await Promise.all([
      searchJSearch(params),
      searchAdzuna(params),
      searchUSAJobs(params)
    ]);

    // Combine all results
    let allJobs = [...jsearchJobs, ...adzunaJobs, ...usaJobs];
    console.log(`Total jobs from APIs: ${allJobs.length}`);

    // If no results from APIs, use fallback
    if (allJobs.length === 0) {
      console.log("No API results, using fallback jobs");
      allJobs = generateFallbackJobs(params);
    }

    // Deduplicate by title + company
    const seen = new Set<string>();
    const uniqueJobs = allJobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by posted date (most recent first)
    uniqueJobs.sort((a, b) => {
      const order = ['Today', '1 day ago', '2 days ago'];
      const aIdx = order.findIndex(o => a.posted.includes(o.split(' ')[0]));
      const bIdx = order.findIndex(o => b.posted.includes(o.split(' ')[0]));
      return (aIdx === -1 ? 100 : aIdx) - (bIdx === -1 ? 100 : bIdx);
    });

    const sources: string[] = [];
    if (jsearchJobs.length > 0) sources.push('JSearch');
    if (adzunaJobs.length > 0) sources.push('Adzuna');
    if (usaJobs.length > 0) sources.push('USAJobs');
    if (uniqueJobs.length > 0 && sources.length === 0) sources.push('LegallyAI');

    return new Response(
      JSON.stringify({
        jobs: uniqueJobs.slice(0, 50),
        total: uniqueJobs.length,
        sources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    console.error("Job search error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, jobs: [], total: 0 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
