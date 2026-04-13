import { Result } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

function GenericError() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState({});
  const [id, setId] = useState(null);
  const { t } = useTranslation();
  useEffect(() => {
    // Simulating fetching JSON data with key-value pairs
    const jsonData = {
      IDM: {
        title: t("errors.IDM_title"),
        subtitle: t("errors.IDM_subtitle"),
      },
      INF: {
        title: t("errors.INF_title"),
        subtitle: t("errors.INF_subtitle"),
      },
      UMM: {
        title: t("errors.UMM_title"),
        subtitle: t("errors.UMM_subtitle"),
      },
      USF: {
        title: t("errors.USF_title", {
          domain: searchParams.get("domain"),
        }),
        subtitle: t("errors.USF_subtitle"),
      },
      USR: {
        title: t("errors.USR_title"),
        subtitle: t("errors.USR_subtitle"),
      },
      INE001: {
        title: t("errors.INE001_title"),
        subtitle: t("errors.INE001_subtitle"),
      },
      INE002: {
        title: t("errors.INE002_title"),
        subtitle: t("errors.INE002_subtitle"),
      },
      INE003: {
        title: t("errors.INE003_title"),
        subtitle: t("errors.INE003_subtitle"),
      },
      INS: {
        title: t("errors.INS_title"),
        subtitle: t("errors.INS_subtitle"),
      },

      // Add more key-value pairs as needed
    };
    const msgId = searchParams.get("code");

    setId(msgId);
    setMessages(jsonData);
  }, []);

  return (
    <Result
      status="403"
      title={
        id && messages[id] ? messages[id].title : t("errors.genericDefault")
      }
      subTitle={
        id && messages[id]
          ? messages[id].subtitle
          : t("errors.genericDefaultSubtitle")
      }
    />
  );
}

export { GenericError };
