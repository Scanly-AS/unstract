import { InboxOutlined } from "@ant-design/icons";
import { Modal, message, Typography, Upload } from "antd";
import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AdapterSelectionModal } from "../adapter-selection-modal/AdapterSelectionModal";
import "./ImportTool.css";

const { Dragger } = Upload;
const { Text } = Typography;

function ImportTool({ open, setOpen, onImport, loading }) {
  const [fileList, setFileList] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [showAdapterSelection, setShowAdapterSelection] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const { t } = useTranslation();

  const handleUploadChange = (info) => {
    setFileList(info.fileList);
  };

  const handleImport = () => {
    if (fileList.length === 0) {
      message.error(t("customTools.pleaseSelectFile"));
      return;
    }

    const file = fileList[0].originFileObj || fileList[0];
    parseProjectFile(file);
  };

  const parseProjectFile = (file) => {
    setParseLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);

        // Validate required structure
        const requiredKeys = ["tool_metadata", "tool_settings", "prompts"];
        if (!requiredKeys.every((key) => projectData[key])) {
          message.error(t("customTools.invalidStructure"));
          setParseLoading(false);
          return;
        }

        setProjectData(projectData);
        setShowAdapterSelection(true);
        setParseLoading(false);
      } catch (error) {
        message.error(t("customTools.invalidJSON"));
        setParseLoading(false);
      }
    };

    reader.onerror = () => {
      message.error(t("customTools.failedToReadFile"));
      setParseLoading(false);
    };

    reader.readAsText(file);
  };

  const handleAdapterSelection = ({ selectedAdapters, projectData }) => {
    const file = fileList[0].originFileObj || fileList[0];
    onImport(file, selectedAdapters);
  };

  const handleCancel = () => {
    setFileList([]);
    setProjectData(null);
    setShowAdapterSelection(false);
    setParseLoading(false);
    setOpen(false);
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".json",
    beforeUpload: () => false, // Prevent automatic upload
    fileList,
    onChange: handleUploadChange,
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <Modal
      title={t("customTools.importProject")}
      open={open}
      onOk={handleImport}
      onCancel={handleCancel}
      confirmLoading={loading || parseLoading}
      okText={t("customTools.import")}
      cancelText={t("common.cancel")}
      width={600}
    >
      <div className="import-tool-content">
        <Text type="secondary" className="import-tool-description">
          {t("customTools.importDescription")}
        </Text>

        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t("customTools.clickOrDrag")}</p>
          <p className="ant-upload-hint">{t("customTools.singleJSONOnly")}</p>
        </Dragger>
      </div>

      <AdapterSelectionModal
        open={showAdapterSelection}
        setOpen={setShowAdapterSelection}
        onConfirm={handleAdapterSelection}
        loading={loading}
        projectData={projectData}
      />
    </Modal>
  );
}

ImportTool.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export { ImportTool };
