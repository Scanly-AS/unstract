import { Input, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

import "./EditToolInfo.css";

function EditToolInfo() {
  const { t } = useTranslation();
  return (
    <div>
      <br />
      <div>
        <Space direction="vertical" className="custom-space">
          <Typography.Text>{t("customTools.toolName")}</Typography.Text>
          <Input />
        </Space>
      </div>
      <br />
      <div>
        <Space direction="vertical" className="custom-space">
          <Typography.Text>{t("customTools.authorOrgName")}</Typography.Text>
          <Input />
        </Space>
      </div>
      <br />
      <div>
        <Space direction="vertical" className="custom-space">
          <Typography.Text>{t("customTools.description")}</Typography.Text>
          <Input.TextArea rows={3} />
        </Space>
      </div>
      <br />
      <div>
        <Space direction="vertical" className="custom-space">
          <Typography.Text>{t("customTools.searchIcons")}</Typography.Text>
          <div>
            <Input />
            <Typography.Text
              type="secondary"
              className="edit-tool-info-helper-text"
            >
              {t("customTools.chooseIcons")}{" "}
              <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noreferrer"
              >
                fonts.google.com/icons
              </a>
            </Typography.Text>
          </div>
        </Space>
      </div>
      <br />
    </div>
  );
}

export { EditToolInfo };
