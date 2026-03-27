import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Modal, Space, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Users.css";

import { useTranslation } from "react-i18next";
import { useAxiosPrivate } from "../../../hooks/useAxiosPrivate";
import { useExceptionHandler } from "../../../hooks/useExceptionHandler.jsx";
import usePostHogEvents from "../../../hooks/usePostHogEvents.js";
import { IslandLayout } from "../../../layouts/island-layout/IslandLayout.jsx";
import { useAlertStore } from "../../../store/alert-store";
import { useSessionStore } from "../../../store/session-store";
import { CustomButton } from "../../widgets/custom-button/CustomButton.jsx";
import { SpinnerLoader } from "../../widgets/spinner-loader/SpinnerLoader.jsx";
import { TopBar } from "../../widgets/top-bar/TopBar.jsx";

function Users() {
  const axiosPrivate = useAxiosPrivate();
  const { sessionDetails } = useSessionStore();
  const navigate = useNavigate();
  const handleException = useExceptionHandler();
  const { setPostHogCustomEvent } = usePostHogEvents();
  const { t } = useTranslation();

  const [userList, setUserList] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState(userList);
  const { setAlertDetails } = useAlertStore();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState();
  const [isTableLoading, setIsTableLoading] = useState(false);

  const { Text } = Typography;

  const showModal = () => {
    setOpen(true);
  };
  const removeUser = (emailToRemove) => {
    const newUserList = userList.filter((user) => user.email !== emailToRemove);
    setUserList(newUserList);
  };

  const handleDelete = async () => {
    const requestOptions = {
      method: "DELETE",
      url: `/api/v1/unstract/${sessionDetails?.orgId}/users/`,
      data: { emails: [selectedUserEmail?.email] },
      headers: {
        "X-CSRFToken": sessionDetails?.csrfToken,
        "Content-Type": "application/json",
      },
    };
    setConfirmLoading(true);
    axiosPrivate(requestOptions)
      .then((res) => {
        setConfirmLoading(false);
        setOpen(false);
        removeUser(selectedUserEmail.email);
      })
      .catch((err) => {
        setAlertDetails(handleException(err, t("users.failedToDelete")));
        setConfirmLoading(false);
        setOpen(false);
      });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const getAllUsers = async () => {
    try {
      setIsTableLoading(true);
      const requestOptions = {
        method: "GET",
        url: `/api/v1/unstract/${sessionDetails?.orgId}/users/`,
      };
      const response = await axiosPrivate(requestOptions);
      const users = response?.data?.members || [];
      setUserList(
        users.map((user) => ({
          key: user.id,
          email: user.email,
          role: user.role,
        })),
      );
    } catch (err) {
      setAlertDetails(handleException(err, t("users.failedToLoad")));
    } finally {
      setIsTableLoading(false);
    }
  };

  const actionItems = [
    {
      key: "1",
      label: (
        <Space
          direction="horizontal"
          className="action-items"
          onClick={() =>
            navigate(`/${sessionDetails?.orgName}/users/edit`, {
              state: selectedUserEmail,
            })
          }
        >
          <div>
            <EditOutlined />
          </div>
          <div>
            <Typography.Text>{t("users.edit")}</Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      key: "2",
      label: (
        <Space
          direction="horizontal"
          className="action-items"
          onClick={showModal}
        >
          <div>
            <DeleteOutlined />
          </div>
          <div>
            <Typography.Text>{t("users.delete")}</Typography.Text>
          </div>
        </Space>
      ),
    },
  ];
  const baseColumns = [
    {
      title: t("users.email"),
      dataIndex: "email",
    },
    {
      title: t("users.role"),
      dataIndex: "role",
    },
  ];

  const actionColumn = {
    title: t("users.actions"),
    align: "center",
    render: (_, record) => (
      <Dropdown
        menu={{ items: actionItems }}
        trigger={["click"]}
        placement="bottomLeft"
      >
        <EllipsisOutlined
          rotate={90}
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedUserEmail(record)}
        />
      </Dropdown>
    ),
  };

  const columns = !sessionDetails?.provider
    ? [...baseColumns, actionColumn]
    : baseColumns;

  const handleInviteUsers = () => {
    navigate(`/${sessionDetails?.orgName}/users/invite`);

    try {
      setPostHogCustomEvent("intent_add_user", {
        info: "Clicked on '+ Invite User' button",
      });
    } catch (err) {
      // If an error occurs while setting custom posthog event, ignore it and continue
    }
  };
  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    setFilteredUserList(userList);
  }, [userList]);

  return (
    <>
      <TopBar
        enableSearch={true}
        title={t("users.manageUsers")}
        searchData={userList}
        setFilteredUserList={setFilteredUserList}
      >
        {!sessionDetails?.provider && (
          <CustomButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleInviteUsers}
          >
            {t("users.inviteUser")}
          </CustomButton>
        )}
        <Button
          shape="circle"
          icon={<ReloadOutlined />}
          onClick={getAllUsers}
          className="user-reload-button"
        />
      </TopBar>
      <div className="user-bg-col">
        <IslandLayout>
          <div className="user-table">
            <Table
              columns={columns}
              dataSource={filteredUserList}
              size="small"
              loading={{
                indicator: <SpinnerLoader />,
                spinning: isTableLoading,
              }}
            />
          </div>
        </IslandLayout>
      </div>
      <Modal
        title={t("users.deleteUser")}
        open={open}
        onOk={handleDelete}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        centered
        className="delete-user-modal"
      >
        <Typography>{t("users.confirmDelete")}</Typography>
        <Text strong>{selectedUserEmail?.email}</Text>
      </Modal>
    </>
  );
}

export { Users };
