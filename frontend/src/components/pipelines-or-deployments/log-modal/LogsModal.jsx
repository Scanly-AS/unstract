import { Button, Modal, Table } from "antd";
import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAxiosPrivate } from "../../../hooks/useAxiosPrivate.js";
import { useExceptionHandler } from "../../../hooks/useExceptionHandler.jsx";
import { useAlertStore } from "../../../store/alert-store.js";
import { useSessionStore } from "../../../store/session-store.js";
import "./LogsModel.css";
import CustomMarkdown from "../../helpers/custom-markdown/CustomMarkdown.jsx";

const LogsModal = ({
  open,
  setOpen,
  logRecord,
  totalLogs,
  fetchExecutionLogs,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [logDescModalOpen, setLogDescModalOpen] = useState(false);
  const [logDetails, setLogDetails] = useState([]);
  const { sessionDetails } = useSessionStore();
  const { setAlertDetails } = useAlertStore();
  const axiosPrivate = useAxiosPrivate();
  const handleException = useExceptionHandler();
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogDetails = async (logId, page = 1, pageSize = 10) => {
    const requestOptions = {
      method: "GET",
      url: `/api/v1/unstract/${sessionDetails?.orgId}/workflow/execution/${logId}/logs/`,
      headers: {
        "X-CSRFToken": sessionDetails?.csrfToken,
      },
      params: {
        page: page,
        page_size: pageSize,
      },
    };
    axiosPrivate(requestOptions)
      .then((res) => {
        const logDetails = res?.data?.results?.map((item) => ({
          id: item?.id,
          log: <CustomMarkdown text={item?.data?.log} />,
          type: item?.data?.type,
          stage: item?.data?.stage,
          level: item?.data?.level,
          event_time: item?.event_time,
        }));
        setLogDetails(logDetails);
        setTotalCount(res?.data?.count);
      })
      .catch((err) => {
        setAlertDetails(handleException(err));
      });
  };

  const handleLogIdClick = (logId) => {
    setSelectedLogId(logId);
    fetchLogDetails(logId);
    setLogDescModalOpen(true);
  };

  const logColumns = [
    {
      title: t("pipelines.executedAt"),
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: t("pipelines.executionId"),
      dataIndex: "execution_id",
      key: "execution_id",
      render: (text, record) => {
        return (
          <Button
            type="link"
            onClick={() => handleLogIdClick(record?.execution_id)}
          >
            {text}
          </Button>
        );
      },
    },
    {
      title: t("pipelines.status"),
      dataIndex: "status",
      key: "status",
      render: (level) => <span className={level?.toLowerCase()}>{level}</span>,
    },
  ];

  const logDetailsColumns = [
    {
      title: t("pipelines.eventTime"),
      dataIndex: "event_time",
      key: "event_time",
    },
    {
      title: t("pipelines.eventStage"),
      dataIndex: "stage",
      key: "stage",
    },
    {
      title: t("pipelines.logLevel"),
      dataIndex: "level",
      key: "level",
      render: (level) => <span className={level?.toLowerCase()}>{level}</span>,
    },
    {
      title: t("pipelines.log"),
      dataIndex: "log",
      key: "log",
    },
  ];

  return (
    <>
      <Modal
        title={t("pipelines.executionLogs")}
        centered
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="80%"
      >
        <Table
          columns={logColumns}
          dataSource={logRecord}
          rowKey="id"
          align="left"
          loading={loading}
          pagination={{
            total: totalLogs,
            onChange: (page, pageSize) => {
              fetchExecutionLogs(page, pageSize);
            },
          }}
        />
      </Modal>

      <Modal
        title={t("pipelines.executionLogDetails", { selectedLogId })}
        centered
        open={logDescModalOpen}
        onCancel={() => setLogDescModalOpen(false)}
        footer={null}
        width="80%"
        wrapClassName="modal-body"
      >
        <Table
          columns={logDetailsColumns}
          dataSource={logDetails}
          rowKey="id"
          align="left"
          pagination={{
            pageSize: 10,
            total: totalCount,
            onChange: (page, pageSize) => {
              fetchLogDetails(selectedLogId, page, pageSize);
            },
          }}
        />
      </Modal>
    </>
  );
};

LogsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  logRecord: PropTypes.array.isRequired,
  totalLogs: PropTypes.number.isRequired,
  fetchExecutionLogs: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export { LogsModal };
