import api, { route } from "@forge/api";

export async function createGroup(payload) {
  const { groupName, description } = payload;

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
        description: description || "", // description is optional, default to empty string if not provided
      }),
    });

    if (response.ok) {
      const body = await response.json().catch(() => ({}));
      console.log(`Created group '${groupName}'`, body);
      return { groupId: body.id };
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

// Add selected users to an Atlassian group using the Org Admin API
export async function addUsersToGroup(payload) {
  // Parse comma-separated user account IDs from string
  const userAccountIdsString = payload.userAccountIds;
  const groupId = payload.groupId;

  // Validate and parse the comma-separated user IDs string
  if (!userAccountIdsString || typeof userAccountIdsString !== "string") {
    console.log("addUsersToGroup: missing or invalid userAccountIds");
    return {
      errors: [
        {
          message: `At least one user must be selected.`,
        },
      ],
    };
  }

  // Split the comma-separated string into an array and filter out empty values
  const userAccountIds = userAccountIdsString
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");

  if (userAccountIds.length === 0) {
    console.log("addUsersToGroup: no valid user IDs after parsing");
    return {
      errors: [
        {
          message: `At least one user must be selected.`,
        },
      ],
    };
  }

  if (!groupId) {
    console.log("addUsersToGroup: missing groupId");
    return {
      errors: [
        {
          message: `Group selection is required.`,
        },
      ],
    };
  }

  const orgId = process.env.ORG_ID;
  const apiKey = process.env.ORG_API_KEY;
  const directoryId = process.env.DIRECTORY_ID;

  // Check that required environment variables are set
  if (!orgId || !apiKey || !directoryId) {
    console.log("addUsersToGroup: ORG_ID, ORG_API_KEY or DIRECTORY_ID not set");
    return {
      errors: [
        {
          message: `ORG_ID, ORG_API_KEY or DIRECTORY_ID not set in environment variables`,
        },
      ],
    };
  }

  const baseUrl = `https://api.atlassian.com/admin/v2/orgs/${orgId}/directories/${directoryId}/groups/${groupId}/memberships`;
  const errors = [];
  let successCount = 0;

  // Attempt to add each user to the group
  for (const userAccountId of userAccountIds) {
    try {
      const response = await api.fetch(baseUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          accountId: userAccountId,
        }),
      });

      if (response.ok) {
        successCount++;
        console.log(
          `Successfully added user ${userAccountId} to group ${groupId}`,
        );
      } else {
        const body = await response.json().catch(() => ({}));
        const errorMessage =
          body?.errors?.[0]?.detail ||
          `Failed to add user. Status: ${response.status}`;
        console.log(
          `Failed to add user ${userAccountId} to group`,
          response.status,
          body,
        );
        errors.push({
          message: `Failed to add user: ${errorMessage}`,
        });
      }
    } catch (err) {
      console.log(`Error adding user ${userAccountId} to group:`, err);
      errors.push({
        message: `Error adding user to group: ${err.message}`,
      });
    }
  }

  // If there were any errors, return them
  if (errors.length > 0) {
    return {
      errors: errors,
    };
  }

  console.log(`Successfully added ${successCount} user(s) to group ${groupId}`);
}
