import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Input, Modal, Space, Switch, Table, Tooltip, Typography } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useAxiosPrivate } from "../../../hooks/useAxiosPrivate";
import { useAlertStore } from "../../../store/alert-store";
import { useSessionStore } from "../../../store/session-store";
import { CustomButton } from "../../widgets/custom-button/CustomButton.jsx";
import SpaceWrapper from "../../widgets/space-wrapper/SpaceWrapper.jsx";
import { SpinnerLoader } from "../../widgets/spinner-loader/SpinnerLoader.jsx";
import { DeleteModal } from "../delete-modal/DeleteModal.jsx";
import "./ManageKeys.css";
import { useExceptionHandler } from "../../../hooks/useExceptionHandler.jsx";

const ManageKeys = ({
  isDialogOpen,
  setDialogOpen,
  apiKeys,
  setApiKeys,
  selectedApiRow,
  apiService,
  type,
}) => {
  const { t } = useTranslation();
  const { sessionDetails } = useSessionStore();
  const axiosPrivate = useAxiosPrivate();
  const handleException = useExceptionHandler();
  const [isTableLoading, setIsTableLoading] = useState(false);
  const { setAlertDetails } = useAlertStore();
  const [isNewKey, setIsNewKey] = useState(false);
  const [isEditKey, setIsEditKey] = useState(false);
  const [formDetails, setFormDetails] = useState({});
  const [canAdd, setCanAdd] = useState(false);
  const [selectedKeyRow, setSelectedKeyRow] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  useEffect(() => {
    if (isNewKey) {
      setFormDetails({
        description: "",
        [type]: selectedApiRow?.id,
        is_active: true,
      });
    } else {
      setFormDetails({});
    }
  }, [isNewKey]);

  useEffect(() => {
    if (isEditKey) {
      setFormDetails({
        description: selectedKeyRow?.description,
        [type]: selectedApiRow?.id,
        is_active: selectedKeyRow?.is_active,
      });
    } else {
      setFormDetails({});
    }
  }, [isEditKey]);

  const closeAddKey = () => {
    setIsNewKey(false);
    setIsEditKey(false);
    setCanAdd(false);
  };

  const addTableData = (newKeyRow) => {
    setApiKeys((prev) => {
      const prevData = [...prev];
      prevData.push(newKeyRow);
      return prevData;
    });
  };

  const updateTableData = (id, updatedRow) => {
    setApiKeys((prevRecords) => {
      return prevRecords.map((record) => {
        if (record.id === id) {
          return updatedRow;
        }
        return record;
      });
    });
  };

  const deleteTableData = (id) => {
    setApiKeys((prevRecords) => {
      return prevRecords.filter((record) => record.id !== id);
    });
  };

  const createKey = () => {
    apiService
      .createApiKey(selectedApiRow?.id, formDetails)
      .then((res) => {
        addTableData(res?.data);
        setAlertDetails({
          type: "success",
          content: t("deployments.keyAddedSuccess"),
        });
      })
      .catch((err) => {
        setAlertDetails(handleException(err));
      })
      .finally(() => {
        closeAddKey();
      });
  };

  const updateKey = () => {
    apiService
      .updateApiKey(selectedKeyRow?.id, formDetails)
      .then((res) => {
        updateTableData(selectedKeyRow?.id, res?.data);
        setAlertDetails({
          type: "success",
          content: t("deployments.keyUpdatedSuccess"),
        });
      })
      .catch((err) => {
        setAlertDetails(handleException(err));
      })
      .finally(() => {
        closeAddKey();
      });
  };

  const openAddModal = () => {
    setIsNewKey(true);
    setIsEditKey(false);
  };

  const openEditModal = (record) => {
    setSelectedKeyRow(record);
    setIsEditKey(true);
    setIsNewKey(false);
  };

  const showDeleteModal = (record) => {
    setSelectedKeyRow(record);
    setOpenDeleteModal(true);
  };

  const deleteApiKey = () => {
    apiService
      .deleteApiKey(selectedKeyRow?.id)
      .then((res) => {
        deleteTableData(selectedKeyRow?.id);
        setAlertDetails({
          type: "success",
          content: t("deployments.keyDeletedSuccess"),
        });
      })
      .catch((err) => {
        setAlertDetails(handleException(err));
      })
      .finally(() => {
        setOpenDeleteModal(false);
      });
  };

  const onChangeHandler = (propertyName, value) => {
    const body = {
      [propertyName]: value,
    };
    if (value?.trim().length > 0) {
      setCanAdd(true);
    } else {
      setCanAdd(false);
    }
    setFormDetails({ ...formDetails, ...body });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const updateKeyStatus = (record) => {
    setIsTableLoading(true);
    record.is_active = !record?.is_active;
    const requestOptions = {
      method: "PUT",
      url: `/api/v1/unstract/${sessionDetails?.orgId}/api/keys/${record?.id}/`,
      headers: {
        "X-CSRFToken": sessionDetails?.csrfToken,
      },
      data: record,
    };

    axiosPrivate(requestOptions)
      .then((res) => {
        setAlertDetails({
          type: "success",
          content: t("deployments.statusUpdatedSuccess"),
        });
      })
      .catch((err) => {
        setAlertDetails(handleException(err));
      })
      .finally(() => {
        setIsTableLoading(false);
      });
  };

  const copyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setAlertDetails({
          type: "success",
          content: t("deployments.apiKeyCopied"),
        });
      })
      .catch((error) => {
        setAlertDetails({
          type: "error",
          content: t("deployments.copyFailed"),
        });
      });
  };

  const columns = [
    {
      title: t("deployments.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("deployments.apiKey"),
      dataIndex: "api_key",
      key: "api_key",
      render: (_, record) => (
        <Space direction="horizontal" className="action-items">
          <div>
            <Tooltip
              title={t("deployments.clickToCopy")}
              className="cursorPointer"
              onClick={() => copyText(record?.api_key)}
            >
              <CopyOutlined />
            </Tooltip>
          </div>
          <div>
            <Typography.Text>{record?.api_key}</Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: t("deployments.active"),
      key: "is_active",
      dataIndex: "is_active",
      align: "center",
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.is_active}
          onChange={(e) => {
            updateKeyStatus(record);
          }}
        />
      ),
    },
    {
      title: t("deployments.actions"),
      key: "pipeline_id",
      align: "center",
      render: (_, record) => (
        <>
          <Space className="actions" onClick={() => openEditModal(record)}>
            <Tooltip title={t("deployments.editKey")} className="cursorPointer">
              <EditOutlined />
            </Tooltip>
          </Space>
          <Space className="actions" onClick={() => showDeleteModal(record)}>
            <Tooltip
              title={t("deployments.deleteKey")}
              className="cursorPointer"
            >
              <DeleteOutlined />
            </Tooltip>
          </Space>
        </>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={t("deployments.manageKeys")}
        centered
        maskClosable={false}
        open={isDialogOpen}
        onCancel={handleCloseDialog}
        width={700}
        footer={null}
      >
        <div className="display-flex-right new-key-btn">
          <CustomButton
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={openAddModal}
          >
            {t("deployments.newKey")}
          </CustomButton>
        </div>
        <div className="keys-table">
          <Table
            size="small"
            dataSource={apiKeys}
            columns={columns}
            rowKey="id"
            loading={{
              indicator: <SpinnerLoader />,
              spinning: isTableLoading,
            }}
            pagination={{ defaultPageSize: 5 }}
          />
        </div>
      </Modal>
      {(isNewKey || isEditKey) && (
        <Modal
          title={
            isNewKey ? t("deployments.addKey") : t("deployments.updateKey")
          }
          centered
          open={isNewKey || isEditKey}
          onOk={isNewKey ? createKey : updateKey}
          okText={isNewKey ? t("deployments.add") : t("deployments.update")}
          okButtonProps={{ disabled: !canAdd }}
          onCancel={closeAddKey}
        >
          <SpaceWrapper>
            <Typography>{t("deployments.description")}</Typography>
            <Input
              placeholder="Description"
              name="description"
              onChange={(e) => onChangeHandler("description", e.target.value)}
              value={formDetails.description || ""}
            ></Input>
          </SpaceWrapper>
        </Modal>
      )}
      {openDeleteModal && (
        <DeleteModal
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          deleteRecord={deleteApiKey}
        />
      )}
    </>
  );
};

ManageKeys.propTypes = {
  isDialogOpen: PropTypes.bool.isRequired,
  setDialogOpen: PropTypes.func.isRequired,
  apiKeys: PropTypes.array.isRequired,
  setApiKeys: PropTypes.func.isRequired,
  selectedApiRow: PropTypes.object.isRequired,
  apiService: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

export { ManageKeys };
