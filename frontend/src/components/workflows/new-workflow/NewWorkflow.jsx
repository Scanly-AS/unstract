import { Form, Input, Modal } from "antd";
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBackendErrorDetail } from "../../../helpers/GetStaticData";

const { TextArea } = Input;

function NewWorkflow({
  name = "",
  description = "",
  onDone = () => {},
  onClose = () => {},
  loading = {},
  toggleModal = () => {},
  openModal = {},
  backendErrors,
  setBackendErrors,
}) {
  const { t } = useTranslation();
  const [disableCreation, setDisableCreation] = useState(true);
  const nameRef = useRef(name);
  const descriptionRef = useRef(description);
  const [form] = Form.useForm();

  function updateName({ target: { value } }) {
    nameRef.current = value.trim();
    updateCreationStatus();
  }
  function updateDescription({ target: { value } }) {
    descriptionRef.current = value.trim();
    updateCreationStatus();
  }
  function updateCreationStatus() {
    const isNameEmpty = !nameRef.current;
    const isDescriptionEmpty = !descriptionRef.current;
    setDisableCreation(isNameEmpty || isDescriptionEmpty);
  }

  function onCancel() {
    toggleModal(false);
    onClose();
  }

  function onCreate() {
    onDone(nameRef.current, descriptionRef.current);
  }

  const handleInputChange = (changedValues) => {
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

  return (
    <Modal
      title={name ? t("workflows.editWorkflow") : t("workflows.newWorkflow")}
      open={openModal}
      onCancel={onCancel}
      onOk={onCreate}
      centered
      maskClosable={false}
      okText={
        name ? t("workflows.editWorkflow") : t("workflows.createWorkflow")
      }
      width="400px"
      okButtonProps={{ disabled: disableCreation, loading: loading }}
    >
      <Form
        name="workflowForm"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onValuesChange={handleInputChange}
      >
        <Form.Item
          label={t("workflows.workflowName")}
          name="workflow_name"
          rules={[{ required: true, message: t("workflows.pleaseEnterName") }]}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          validateStatus={
            getBackendErrorDetail("workflow_name", backendErrors) ? "error" : ""
          }
          help={getBackendErrorDetail("workflow_name", backendErrors)}
        >
          <Input defaultValue={nameRef.current} onChange={updateName} />
        </Form.Item>
        <Form.Item
          label={t("workflows.description")}
          name="workflow_description"
          rules={[
            { required: true, message: t("workflows.pleaseEnterDescription") },
          ]}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          validateStatus={
            getBackendErrorDetail("workflow_description", backendErrors)
              ? "error"
              : ""
          }
          help={getBackendErrorDetail("workflow_description", backendErrors)}
        >
          <TextArea
            defaultValue={descriptionRef.current}
            autoSize={{ minRows: 4, maxRows: 6 }}
            onChange={updateDescription}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

NewWorkflow.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  loading: PropTypes.bool,
  onDone: PropTypes.func,
  onClose: PropTypes.func,
  openModal: PropTypes.bool,
  toggleModal: PropTypes.func,
  setBackendErrors: PropTypes.func,
  backendErrors: PropTypes.object,
};

export { NewWorkflow };
