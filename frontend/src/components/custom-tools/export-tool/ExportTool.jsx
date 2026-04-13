import {
  DeleteOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  List,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Typography,
} from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./ExportTool.css";

import { SpinnerLoader } from "../../widgets/spinner-loader/SpinnerLoader";

const SHARE_ALL = "share_all";
const SHARE_CUSTOM = "share_custom";

function ExportTool({
  open,
  setOpen,
  toolDetails,
  loading,
  allUsers,
  onApply,
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [sharingOption, setSharingOption] = useState(SHARE_ALL);
  const { t } = useTranslation();

  useEffect(() => {
    const createdByUserId = toolDetails?.created_by?.toString();
    if (!toolDetails?.shared_users) {
      const filteredUsers = allUsers.filter((user) => {
        const userId = user?.id?.toString();
        return !selectedUsers.includes(userId) && createdByUserId !== userId;
      });
      setFilteredUserList(filteredUsers);
      return;
    }

    const promptStudioUsers = toolDetails?.prompt_studio_users?.map((user) =>
      user?.id?.toString(),
    );

    const filteredUsers = allUsers.filter((user) => {
      const userId = user?.id?.toString();
      return (
        !selectedUsers.includes(userId) &&
        !promptStudioUsers.includes(userId) &&
        createdByUserId !== userId
      );
    });
    setFilteredUserList(filteredUsers);
    setSharingOption(toolDetails.shared_to_org ? SHARE_ALL : SHARE_CUSTOM);
  }, [toolDetails, allUsers, selectedUsers]);

  useEffect(() => {
    if (!toolDetails?.shared_users) {
      return;
    }
    const createdByUserId = toolDetails?.created_by?.toString();
    const promptStudioUsers = toolDetails?.prompt_studio_users?.map((user) =>
      user?.id?.toString(),
    );
    setSelectedUsers(
      toolDetails.shared_users
        .filter((user) => {
          const userId = user?.id?.toString();
          return (
            !promptStudioUsers.includes(userId) && createdByUserId !== userId
          );
        })
        .map((user) => user?.id?.toString()),
    );
  }, [toolDetails]);

  const handleDeleteUser = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.filter((user) => user !== userId),
    );
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onChange = (e) => {
    setSharingOption(e.target.value);
  };

  const shareWithUsers = () => {
    if (sharingOption === SHARE_ALL) {
      return (
        <Typography.Text>{t("customTools.sharedWithEveryone")}</Typography.Text>
      );
    }
    return (
      <>
        <List
          dataSource={selectedUsers.map((userId) => {
            const user = allUsers.find(
              (u) => u?.id.toString() === userId.toString(),
            );
            return {
              id: user?.id,
              email: user?.email,
            };
          })}
          renderItem={(item) => (
            <List.Item
              extra={
                <div onClick={(event) => event.stopPropagation()} role="none">
                  <Popconfirm
                    key={`${item?.id}-delete`}
                    title={t("customTools.deleteUser")}
                    description={t("customTools.confirmRemoveUser", {
                      email: item?.email,
                    })}
                    okText={t("common.yes")}
                    cancelText={t("common.no")}
                    icon={<QuestionCircleOutlined />}
                    onConfirm={(event) => handleDeleteUser(item?.id)}
                  >
                    <Typography.Text>
                      <DeleteOutlined className="action-icon-buttons" />
                    </Typography.Text>
                  </Popconfirm>
                </div>
              }
            >
              <List.Item.Meta
                title={
                  <>
                    <Avatar
                      className="shared-user-avatar"
                      icon={<UserOutlined />}
                    />
                    <Typography.Text className="export-username">
                      {item?.email}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
        <Typography>{t("customTools.exportedNote")}</Typography>
      </>
    );
  };

  return (
    toolDetails && (
      <Modal
        title={t("customTools.exportSettings")}
        open={open}
        onCancel={() => setOpen(false)}
        maskClosable={false}
        centered
        closable={true}
        okText={t("customTools.apply")}
        onOk={() =>
          onApply(selectedUsers, toolDetails, sharingOption === SHARE_ALL)
        }
        className="share-permission-modal"
      >
        {loading ? (
          <SpinnerLoader />
        ) : (
          <>
            {allUsers.length > 1 && (
              <Radio.Group
                onChange={onChange}
                value={sharingOption}
                className="export-per-radio"
              >
                <Radio value={SHARE_ALL}>
                  {t("customTools.shareWithEveryone")}
                </Radio>
                <Radio value={SHARE_CUSTOM}>
                  {t("customTools.customShare")}
                </Radio>
              </Radio.Group>
            )}
            {sharingOption !== SHARE_ALL && (
              <Select
                filterOption={filterOption}
                showSearch
                size={"middle"}
                placeholder={t("customTools.search")}
                className="export-permission-search"
                onChange={(selectedUser) => {
                  const isUserSelected = selectedUsers.includes(selectedUser);
                  if (!isUserSelected) {
                    setSelectedUsers([...selectedUsers, selectedUser]);
                  }
                }}
                options={filteredUserList.map((user) => ({
                  label: user?.email,
                  value: user?.id,
                }))}
                value={null} // null value needed here so that value wont get populated in input
              >
                {filteredUserList.map((user) => {
                  return (
                    <Select.Option key={user?.id} value={user?.id}>
                      {user?.email}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
            <Typography.Title level={5}>
              {t("customTools.sharedWith")}
            </Typography.Title>
            {shareWithUsers()}
          </>
        )}
      </Modal>
    )
  );
}

ExportTool.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  toolDetails: PropTypes.object,
  loading: PropTypes.bool,
  allUsers: PropTypes.array,
  onApply: PropTypes.func,
};

export { ExportTool };
