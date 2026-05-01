import React, { useEffect, useState } from "react";

import { view, events, invoke } from "@forge/bridge";
import ForgeReconciler, {
  Form,
  useForm,
  Stack,
  Text,
  useProductContext,
  ErrorMessage,
  Textfield,
  Box,
  UserPicker,
  Select,
  EmptyState,
  Label,
  RequiredAsterisk,
} from "@forge/react";

const AddUsersToGroupForm = ({ context, isValidating }) => {
  // Parse the default user IDs from the form if they exist (comma-separated string)
  const defaultUserIds = context.extension.data.inputs?.userAccountIds
    ? context.extension.data.inputs.userAccountIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "")
    : [];

  const formInstance = useForm({
    defaultValues: { userAccountIds: defaultUserIds, groupId: null },
    disabled: isValidating,
  });
  const { register, getValues, formState } = formInstance;

  const onChange = (input) => {
    const updatedFormData = { ...getValues(), ...input };
    console.log("Form data updated:", updatedFormData);
    const finalData = { groupId: updatedFormData?.groupId };

    // Convert selected users array to comma-separated string of account IDs
    // Check if userAccountIds exists and is an array before processing
    let accountIdsString = "";
    if (
      Array.isArray(updatedFormData.userAccountIds) &&
      updatedFormData.userAccountIds.length > 0
    ) {
      const firstItem = updatedFormData.userAccountIds[0];
      if (typeof firstItem === "string") {
        // Array of strings — join directly
        accountIdsString = updatedFormData.userAccountIds.join(",");
      } else {
        // Array of objects — extract the id from each
        accountIdsString = updatedFormData.userAccountIds
          .map((user) => user.id)
          .join(",");
      }
    } else {
      accountIdsString = updatedFormData.userAccountIds;
    }

    console.log("Submitting form with data:", {
      ...finalData,
      userAccountIds: accountIdsString,
    });
    view.submit({ ...finalData, userAccountIds: accountIdsString });
  };

  const { onChange: usersOnChange, ...usersRegisterProps } = register(
    "userAccountIds",
    {
      required: { value: true, message: "At least one user is required" },
      disabled: isValidating,
    },
  );

  const { onChange: groupOnChange, ...groupRegisterProps } = register(
    "groupId",
    {
      required: { value: true, message: "Group Id is required" },
      disabled: isValidating,
    },
  );

  return (
    <Box>
      <Form>
        <Stack space="space.100">
          <Label labelFor="select">
            Select Users
            <RequiredAsterisk />
          </Label>
          <UserPicker
            {...usersRegisterProps}
            isMulti={true}
            onChange={(selectedUsers) => {
              usersOnChange(selectedUsers);
              onChange({ userAccountIds: selectedUsers });
            }}
          />
          {formState.errors.userAccountIds?.message && (
            <ErrorMessage>
              {formState.errors.userAccountIds?.message}
            </ErrorMessage>
          )}

          <Label labelFor="textfield">
            Group Id
            <RequiredAsterisk />
          </Label>
          <Textfield
            {...groupRegisterProps}
            defaultValue={context.extension.data.inputs.groupId || ""}
            placeholder="Enter group ID"
            onChange={(e) => {
              groupOnChange(e);
              onChange({ groupId: e.target.value });
            }}
          />
          {formState.errors.groupId?.message && (
            <ErrorMessage>{formState.errors.groupId?.message}</ErrorMessage>
          )}
        </Stack>
      </Form>
    </Box>
  );
};

const GroupForm = ({ context, isValidating }) => {
  const formInstance = useForm({
    defaultValues: context.extension.data.inputs,
    disabled: isValidating,
  });
  const { handleSubmit, register, getValues, formState } = formInstance;

  const onChange = (input) => {
    const updatedFormData = { ...getValues(), ...input };
    console.log("Form data updated:", updatedFormData);
    view.submit(updatedFormData);
  };

  const onSubmit = (data) => {
    view.submit(data);
  };

  const { onChange: groupOnChange, ...groupRegisterProps } = register(
    "groupName",
    {
      required: { value: true, message: "Group name is required" },
      disabled: isValidating,
    },
  );

  const { onChange: descriptionOnChange, ...descriptionRegisterProps } =
    register("description", {
      disabled: isValidating,
    });

  return (
    <Box>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack space="space.100">
          <Label labelFor="textfield">
            Group name
            <RequiredAsterisk />
          </Label>
          <Textfield
            {...groupRegisterProps}
            onChange={(e) => {
              groupOnChange(e);
              onChange({ groupName: e.target.value });
            }}
          />
          {formState.errors.groupName?.message && (
            <ErrorMessage>{formState.errors.groupName?.message}</ErrorMessage>
          )}

          <Label labelFor="textfield">Group description</Label>
          <Textfield
            {...descriptionRegisterProps}
            onChange={(e) => {
              descriptionOnChange(e);
              onChange({ description: e.target.value });
            }}
          />
          {formState.errors.description?.message && (
            <ErrorMessage>{formState.errors.description?.message}</ErrorMessage>
          )}
        </Stack>
      </Form>
    </Box>
  );
};

export const App = () => {
  const context = useProductContext();
  const [isValidating, setIsValidating] = useState(false);

  // This effect sets up a listener for the 'AUTOMATION_ACTION_VALIDATE_RULE_EVENT' event.
  useEffect(() => {
    const handleValidateRuleEvent = ({ isValidating }) => {
      setIsValidating(isValidating);
    };
    const subscription = events.on(
      "AUTOMATION_ACTION_VALIDATE_RULE_EVENT",
      handleValidateRuleEvent,
    );
    return () => subscription.then((sub) => sub.unsubscribe());
  }, []);

  if (!context) return <Text>Loading...</Text>;

  const { moduleKey } = context;
  if (moduleKey === "create-group-action") {
    return <GroupForm context={context} isValidating={isValidating} />;
  }
  if (moduleKey === "add-users-to-group-action") {
    return (
      <AddUsersToGroupForm context={context} isValidating={isValidating} />
    );
  }
  return (
    <EmptyState
      header={`Oops! Seems like you have wandered on an unsupported module`}
      description={`Make sure your admin has set up the automation rule correctly with the supported actions for : ${moduleKey}`}
    />
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
