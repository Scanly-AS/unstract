import { InfoCircleOutlined } from "@ant-design/icons";
import { Space, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

function PromptsReorderTitle() {
  const { t } = useTranslation();
  return (
    <Space>
      <Typography.Text>{t("customTools.reorderPromptsTitle")}</Typography.Text>
      <Tooltip title={t("customTools.reorderPromptsDragDrop")}>
        <InfoCircleOutlined />
      </Tooltip>
    </Space>
  );
}

export { PromptsReorderTitle };
