import Resolver from "@forge/resolver";
import api from "@forge/api";

const resolver = new Resolver();

resolver.define("getGroups", async (req) => {
  const orgId = process.env.ORG_ID;
  const apiKey = process.env.ORG_API_KEY;
  const directoryId = process.env.DIRECTORY_ID;

  // Validate that required environment variables are set
  if (!orgId || !apiKey || !directoryId) {
    console.log("getGroups: ORG_ID, ORG_API_KEY or DIRECTORY_ID not set");
    return {
      groups: [],
      error:
        "ORG_ID, ORG_API_KEY or DIRECTORY_ID not set in environment variables",
    };
  }

  const url = `https://api.atlassian.com/admin/v2/orgs/${orgId}/directories/${directoryId}/groups`;

  try {
    const response = await api.fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const body = await response.json();
      // Map the response to a simpler format for the frontend
      const groups = (body.data || body.groups || []).map((group) => ({
        id: group.group_id || group.id,
        name: group.name,
      }));
      console.log(`Successfully fetched ${groups.length} groups`);
      return { groups: groups };
    } else {
      const body = await response.json().catch(() => ({}));
      console.log("Failed to fetch groups", response.status, body);
      return {
        groups: [],
        error: `Failed to fetch groups. Status: ${response.status}`,
      };
    }
  } catch (err) {
    console.log("Error fetching groups:", err);
    return {
      groups: [],
      error: `Error fetching groups: ${err.message}`,
    };
  }
});

export const handler = resolver.getDefinitions();
