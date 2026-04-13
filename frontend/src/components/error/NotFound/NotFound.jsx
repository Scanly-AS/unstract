import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Result
      status="404"
      title={t("errors.pageNotFound")}
      subTitle={t("errors.pageNotFoundSubtitle")}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {t("errors.goBack")}
        </Button>
      }
    />
  );
}

export { NotFound };
