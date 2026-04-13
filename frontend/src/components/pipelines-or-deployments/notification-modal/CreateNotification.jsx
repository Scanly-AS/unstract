import { Button, Form, Input, Select, Space } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBackendErrorDetail } from "../../../helpers/GetStaticData";

const DEFAULT_FORM_DETAILS = {
  name: "",
  authorization_type: "BEARER",
  notification_type: "WEBHOOK",
  platform: "SLACK",
  authorization_header: "",
  authorization_key: "",
  is_active: false,
  max_retries: 0,
  pipeline: "",
  api: "",
  url: "",
};

const NOTIFICATION_TYPE_ITEMS = [
  {
    value: "WEBHOOK",
    label: "WEBHOOK",
  },
];

const PLATFORM_TYPES = [
  {
    value: "SLACK",
    label: "SLACK",
  },
  {
    value: "API",
    label: "API",
  },
];

const AUTHORIZATION_TYPES = [
  {
    value: "BEARER",
    label: "BEARER",
  },
  {
    value: "API_KEY",
    label: "API_KEY",
  },
  {
    value: "CUSTOM_HEADER",
    label: "CUSTOM_HEADER",
  },
  {
    value: "NONE",
    label: "NONE",
  },
];

function CreateNotification({
  setIsForm,
  type,
  id,
  isLoading,
  handleSubmit,
  handleUpdate,
  editDetails,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [formDetails, setFormDetails] = useState(DEFAULT_FORM_DETAILS);
  const [backendErrors, setBackendErrors] = useState(null);
  const [resetForm, setResetForm] = useState(false);

  useEffect(() => {
    if (editDetails) {
      setFormDetails(editDetails);
      setResetForm(true);
    }
  }, [editDetails]);

  useEffect(() => {
    if (resetForm) {
      form.resetFields();
      setResetForm(false);
    }
  }, [formDetails]);

  const handleInputChange = (changedValues, allValues) => {
    setFormDetails({ ...formDetails, ...allValues });
    const changedFieldName = Object.keys(changedValues)[0];
    form.setFields([
      {
        name: changedFieldName,
        errors: [],
      },
    ]);
    setBackendErrors((prevErrors) => {
      if (prevErrors) {
        const updatedErrors = prevErrors.errors.filter(
          (error) => error.attr !== changedFieldName,
        );
        return { ...prevErrors, errors: updatedErrors };
      }
      return null;
    });
  };

  const triggerSubmit = () => {
    const body = { ...formDetails };
    body[type] = id;

    if (editDetails) {
      handleUpdate(body, editDetails?.id);
    } else {
      handleSubmit(body);
    }
  };

  const handleAuthorizationTypeChange = (value) => {
    setFormDetails((prevDetails) => ({
      ...prevDetails,
      authorization_type: value,
      authorization_key: value === "NONE" ? "" : prevDetails.authorization_key,
      authorization_header:
        value === "CUSTOM_HEADER" ? prevDetails.authorization_header : "",
    }));
  };

  const formItems = [
    {
      label: t("pipelines.name"),
      name: "name",
      rules: [{ required: true, message: t("pipelines.pleaseEnterName") }],
      component: <Input />,
    },
    {
      label: t("pipelines.url"),
      name: "url",
      rules: [{ required: true, message: t("pipelines.pleaseEnterUrl") }],
      component: <Input />,
      tooltip: t("pipelines.urlHelp"),
    },
    {
      label: t("pipelines.notificationType"),
      name: "notification_type",
      component: <Select options={NOTIFICATION_TYPE_ITEMS} />,
      tooltip: t("pipelines.notificationTypeHelp"),
    },
    {
      label: t("pipelines.platformLabel"),
      name: "platform",
      component: <Select options={PLATFORM_TYPES} />,
      tooltip: t("pipelines.platformHelp"),
    },
    {
      label: t("pipelines.authorizationType"),
      name: "authorization_type",
      component: (
        <Select
          options={AUTHORIZATION_TYPES}
          onChange={handleAuthorizationTypeChange}
        />
      ),
      tooltip: t("pipelines.authorizationTypeHelp"),
    },
    {
      label: t("pipelines.authorizationHeader"),
      name: "authorization_header",
      component: <Input />,
      tooltip: t("pipelines.authorizationHeaderHelp"),
      rules:
        formDetails.authorization_type === "CUSTOM_HEADER"
          ? [
              {
                required: true,
                message: t("pipelines.authorizationHeaderRequired"),
              },
            ]
          : [],
      hidden: formDetails.authorization_type !== "CUSTOM_HEADER",
    },
    {
      label: t("pipelines.authorizationKey"),
      name: "authorization_key",
      component: <Input />,
      tooltip: t("pipelines.authorizationKeyHelp"),
      rules:
        formDetails.authorization_type !== "NONE"
          ? [
              {
                required: true,
                message: t("pipelines.authorizationKeyRequired"),
              },
            ]
          : [],
      hidden: formDetails.authorization_type === "NONE",
    },
    {
      label: t("pipelines.maxRetries"),
      name: "max_retries",
      component: <Input type="number" />,
      tooltip: t("pipelines.maxRetriesHelp"),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formDetails}
      onValuesChange={handleInputChange}
      onFinish={triggerSubmit}
    >
      {formItems.map(
        ({ label, name, rules, component, tooltip, hidden }) =>
          !hidden && (
            <Form.Item
              key={name}
              label={label}
              name={name}
              rules={rules}
              tooltip={tooltip || ""}
              validateStatus={
                getBackendErrorDetail(name, backendErrors) ? "error" : ""
              }
              help={getBackendErrorDetail(name, backendErrors)}
            >
              {component}
            </Form.Item>
          ),
      )}
      <Form.Item className="display-flex-right">
        <Space>
          <Button onClick={() => setIsForm(false)}>
            {t("pipelines.cancel")}
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {editDetails
              ? t("pipelines.updateNotification")
              : t("pipelines.createNotification")}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

CreateNotification.propTypes = {
  setIsForm: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  editDetails: PropTypes.object,
};

export { CreateNotification };
