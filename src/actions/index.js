import api, { route } from "@forge/api";

export async function createGroup(payload) {
  const {groupName, description} = payload;

  if (!groupName) {
    console.log("createGroup: missing groupName");
    return {
      errors: [
        {
          message: `Group name is a required input.`,
        },
      ],
    };
  }

  const orgId = process.env.ORG_ID;
  const apiKey = process.env.ORG_API_KEY;
  const directoryId = process.env.DIRECTORY_ID;

  if (!orgId || !apiKey || !directoryId) {
    console.log("createGroup: ORG_ID, ORG_API_KEY or DIRECTORY_ID not set");
    return {
      errors: [
        {
          message: `ORG_ID, ORG_API_KEY or DIRECTORY_ID not set in environment variables`,
        },
      ],
    };
  }

  const url = `https://api.atlassian.com/admin/v2/orgs/${orgId}/directories/${directoryId}/groups`;

  try {
    const response = await api.fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: groupName,
        description:  description || "", // description is optional, default to empty string if not provided
      }),
    });

    if (response.ok) {
      const body = await response.json().catch(() => ({}));
      console.log(`Created group '${groupName}'`, body);
      return {groupId: body.id}
    } else {
      const body = await response.json().catch(() => ({}));
      console.log(
        `Failed to create group '${groupName}'`,
        response.status,
        body,
      );
      return {
        errors: [
          {
            message:
              body?.errors[0]?.detail ||
              `Failed to create group. Status code: ${response.status}`,
          },
        ],
      };
    }
  } catch (err) {
    console.log("createGroup error", err);
  }
}
