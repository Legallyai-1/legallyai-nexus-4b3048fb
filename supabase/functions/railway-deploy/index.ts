import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAILWAY_API_URL = "https://backboard.railway.app/graphql/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const railwayToken = Deno.env.get("RAILWAY_API_TOKEN");
    const projectId = Deno.env.get("RAILWAY_PROJECT_ID");
    const environmentId = Deno.env.get("RAILWAY_ENVIRONMENT_ID"); // Optional

    if (!railwayToken) {
      return new Response(
        JSON.stringify({ error: "RAILWAY_API_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "RAILWAY_PROJECT_ID not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action } = await req.json();
    console.log(`Railway action requested: ${action}`);

    let query: string;
    let variables: Record<string, unknown>;

    switch (action) {
      case "getProject":
        query = `
          query GetProject($projectId: String!) {
            project(id: $projectId) {
              id
              name
              description
              createdAt
              environments {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              services {
                edges {
                  node {
                    id
                    name
                    icon
                  }
                }
              }
            }
          }
        `;
        variables = { projectId };
        break;

      case "getDeployments":
        query = `
          query GetDeployments($projectId: String!, $first: Int) {
            deployments(first: $first, input: { projectId: $projectId }) {
              edges {
                node {
                  id
                  status
                  createdAt
                  staticUrl
                  service {
                    name
                  }
                  environment {
                    name
                  }
                }
              }
            }
          }
        `;
        variables = { projectId, first: 10 };
        break;

      case "triggerDeploy":
        // Get the first service and environment if not specified
        const projectQuery = `
          query GetProjectForDeploy($projectId: String!) {
            project(id: $projectId) {
              services {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              environments {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        `;
        
        const projectResponse = await fetch(RAILWAY_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${railwayToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: projectQuery,
            variables: { projectId },
          }),
        });

        const projectData = await projectResponse.json();
        console.log("Project data for deploy:", JSON.stringify(projectData));

        if (projectData.errors) {
          return new Response(
            JSON.stringify({ error: projectData.errors[0].message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const services = projectData.data?.project?.services?.edges || [];
        const environments = projectData.data?.project?.environments?.edges || [];

        if (services.length === 0) {
          return new Response(
            JSON.stringify({ error: "No services found in project" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const serviceId = services[0].node.id;
        const envId = environmentId || (environments.length > 0 ? environments[0].node.id : null);

        if (!envId) {
          return new Response(
            JSON.stringify({ error: "No environment found in project" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        query = `
          mutation ServiceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
            serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
          }
        `;
        variables = { environmentId: envId, serviceId };
        break;

      case "getStatus":
        query = `
          query GetProjectStatus($projectId: String!) {
            project(id: $projectId) {
              id
              name
              deployments(first: 1) {
                edges {
                  node {
                    id
                    status
                    createdAt
                    staticUrl
                  }
                }
              }
            }
          }
        `;
        variables = { projectId };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: getProject, getDeployments, triggerDeploy, getStatus" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Executing Railway GraphQL query for action: ${action}`);

    const response = await fetch(RAILWAY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${railwayToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    console.log(`Railway response for ${action}:`, JSON.stringify(data));

    if (data.errors) {
      return new Response(
        JSON.stringify({ error: data.errors[0].message, details: data.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: data.data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Railway deploy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
