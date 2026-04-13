import { PlayCircleFilled, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { PROMPT_RUN_TYPES } from "../../../helpers/GetStaticData";
import usePromptRun from "../../../hooks/usePromptRun";
import { useCustomToolStore } from "../../../store/custom-tool-store";

function RunAllPrompts() {
  const { selectedDoc, isMultiPassExtractLoading, isPublicSource } =
    useCustomToolStore();
  const { handlePromptRunRequest } = usePromptRun();
  const { t } = useTranslation();

  return (
    <Space>
      <Tooltip title={t("customTools.runAllPromptsCurrent")}>
        <Button
          icon={<PlayCircleOutlined className="prompt-card-actions-head" />}
          onClick={() =>
            handlePromptRunRequest(
              PROMPT_RUN_TYPES.RUN_ALL_PROMPTS_ALL_LLMS_ONE_DOC,
              null,
              null,
              selectedDoc?.document_id,
            )
          }
          disabled={isMultiPassExtractLoading || isPublicSource}
        />
      </Tooltip>
      <Tooltip title={t("customTools.runAllPromptsAll")}>
        <Button
          icon={<PlayCircleFilled className="prompt-card-actions-head" />}
          onClick={() =>
            handlePromptRunRequest(
              PROMPT_RUN_TYPES.RUN_ALL_PROMPTS_ALL_LLMS_ALL_DOCS,
              null,
              null,
              null,
            )
          }
          disabled={isMultiPassExtractLoading || isPublicSource}
        />
      </Tooltip>
    </Space>
  );
}

export { RunAllPrompts };
