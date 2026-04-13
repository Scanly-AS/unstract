import { CopyOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

function CopyPromptOutputBtn({ isDisabled, copyToClipboard }) {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("customTools.copyPromptOutput")}>
      <Button
        size="small"
        type="text"
        className="prompt-card-action-button"
        onClick={copyToClipboard}
        disabled={isDisabled}
      >
        <CopyOutlined className="prompt-card-actions-head" />
      </Button>
    </Tooltip>
  );
}

CopyPromptOutputBtn.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  copyToClipboard: PropTypes.func.isRequired,
};

export { CopyPromptOutputBtn };
