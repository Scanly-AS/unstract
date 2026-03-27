import { Input, Table, Tooltip, Typography } from "antd";
import "./LogsTable.css";
import {
  CloseCircleFilled,
  HourglassOutlined,
  InfoCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { logsStaticContent } from "../../../helpers/GetStaticData";
import { useSessionStore } from "../../../store/session-store";
import { EmptyState } from "../../widgets/empty-state/EmptyState";

// Search filter dropdown component for execution ID column
const SearchFilterDropdown = ({ value, onChange, t }) => (
  <div className="search-container">
    <Input
      placeholder={t("logging.searchExecutionId")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="search-input"
    />
  </div>
);

SearchFilterDropdown.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

// Search filter icon component
const SearchFilterIcon = ({ isActive }) => (
  <SearchOutlined className={isActive ? "search-filter-icon-active" : ""} />
);

SearchFilterIcon.propTypes = {
  isActive: PropTypes.bool,
};

const LogsTable = ({
  tableData,
  loading,
  pagination,
  setPagination,
  setOrdering,
  activeTab,
  executionIdSearch,
  setExecutionIdSearch,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sessionDetails } = useSessionStore();
  const columns = [
    {
      title: t("logging.executedAt"),
      dataIndex: "executedAt",
      key: "executedAt",
      showSorterTooltip: { target: "full-header" },
      sorter: true,
      render: (_, record) => (
        <Tooltip title={record.executedAtWithSeconds}>
          {record.executedAt}
        </Tooltip>
      ),
    },
    {
      title: t("logging.executionId"),
      dataIndex: "executionId",
      key: "executionId",
      filterDropdown: (
        <SearchFilterDropdown
          value={executionIdSearch}
          onChange={setExecutionIdSearch}
          t={t}
        />
      ),
      filterIcon: <SearchFilterIcon isActive={!!executionIdSearch} />,
      render: (text) => (
        <Typography.Link
          className="title-name-redirect"
          onClick={() => navigate(`${activeTab}/${text}`)}
        >
          {text}
        </Typography.Link>
      ),
    },
    {
      title: t("logging.executionName"),
      dataIndex: "pipelineName",
      key: "executionName",
      render: (_, record) =>
        activeTab === "WF" ? (
          <Typography.Text strong>{record?.workflowName}</Typography.Text>
        ) : (
          <>
            <Typography.Text strong>{record?.pipelineName}</Typography.Text>
            <br />
            <Typography.Text type="secondary" className="p-or-d-typography">
              from {record?.workflowName}
            </Typography.Text>
          </>
        ),
    },
    {
      title: t("logging.status"),
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <span>
          <Tooltip title={t("logging.successfulFiles")}>
            <span className="status-container">
              <InfoCircleFilled className="gen-index-success" />{" "}
              {record?.successfulFiles}
            </span>
          </Tooltip>
          <Tooltip title={t("logging.failedFiles")}>
            <span className="status-container">
              <CloseCircleFilled className="gen-index-fail" />{" "}
              {record?.failedFiles}
            </span>
          </Tooltip>
          <Tooltip title={t("logging.queuedFiles")}>
            {record?.totalFiles -
              (record?.successfulFiles + record?.failedFiles) >
              0 && (
              <span className="status-container">
                <HourglassOutlined className="gen-index-progress" />{" "}
                {record?.totalFiles -
                  (record?.successfulFiles + record?.failedFiles)}
              </span>
            )}
          </Tooltip>
        </span>
      ),
    },
    {
      title: t("logging.filesProcessed"),
      dataIndex: "filesProcessed",
      key: "filesProcessed",
      render: (_, record) => `${record?.processed}/${record?.totalFiles}`,
    },
    {
      title: t("logging.executionTime"),
      dataIndex: "executionTime",
      key: "executionTime",
      sorter: true,
      render: (_, record) => record?.execution_time || "-",
    },
  ];

  const handleTableChange = (pagination, _filters, sorter) => {
    setPagination((prev) => {
      return { ...prev, ...pagination };
    });

    if (sorter.order) {
      const fieldMap = {
        executedAt: "created_at",
        executionTime: "execution_time",
      };
      const backendField = fieldMap[sorter.field] || sorter.field;
      const order =
        sorter.order === "ascend" ? backendField : `-${backendField}`;
      setOrdering(order);
      setPagination((prev) => {
        return { ...prev, ...pagination, current: 1 };
      });
    } else {
      setOrdering(null);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total, range) =>
          t("logging.paginationRange", {
            start: range[0],
            end: range[1],
            total,
          }),
      }}
      bordered
      size="small"
      loading={loading}
      onChange={handleTableChange}
      sortDirections={["ascend", "descend", "ascend"]}
      locale={{
        emptyText: (
          <EmptyState
            text={`Currently you have no ${logsStaticContent[activeTab].addBtn}`}
            btnText={`Add ${logsStaticContent[activeTab].addBtn}`}
            handleClick={() =>
              navigate(
                `/${sessionDetails?.orgName}/${logsStaticContent[activeTab].route}`,
              )
            }
          />
        ),
      }}
    />
  );
};

LogsTable.propTypes = {
  tableData: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.object,
  setPagination: PropTypes.func,
  setOrdering: PropTypes.func,
  activeTab: PropTypes.string,
  executionIdSearch: PropTypes.string,
  setExecutionIdSearch: PropTypes.func,
};

export { LogsTable };
