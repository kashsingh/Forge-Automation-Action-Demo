import React, { useEffect, useState } from "react";

import { view, events } from "@forge/bridge";
import ForgeReconciler, {
  Form,
  useForm,
  Stack,
  Text,
  useProductContext,
  ErrorMessage,
  Textfield,
  Box,
  EmptyState,
  Label,
  RequiredAsterisk,
} from "@forge/react";

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

  const { onChange: descriptionOnChange, ...descriptionRegisterProps } = register(
    "description",
    {
      disabled: isValidating,
    },
  );

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

          <Label labelFor="textfield">
            Group description
          </Label>
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
