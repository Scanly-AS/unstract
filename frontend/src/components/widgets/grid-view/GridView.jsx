import { Card, Dropdown, Popconfirm, Typography } from "antd";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./GridView.css";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

function GridView({ listOfTools, handleEdit, handleDelete }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="grid-view-wrapper">
      <div className="grid-view-list">
        {listOfTools.map((item) => {
          return (
            <Card
              key={item?.tool_id}
              title={item?.tool_name}
              style={{ width: "100%" }}
              size="small"
              type="inner"
              hoverable
              onClick={() => navigate(`${item?.tool_id}`)}
              extra={
                <Dropdown
                  menu={{
                    items: [
                      {
                        label: "Edit",
                        key: "edit",
                        icon: <EditOutlined />,
                        onClick: (event) => handleEdit(event, item?.tool_id),
                      },
                      {
                        label: (
                          <Popconfirm
                            title={t("widgets.deleteTool")}
                            description={t("widgets.confirmDeleteTool")}
                            okText={t("widgets.yes")}
                            cancelText={t("widgets.no")}
                            icon={
                              <QuestionCircleOutlined
                                style={{
                                  color: "#dc4446",
                                }}
                              />
                            }
                            onConfirm={(event) => {
                              handleDelete(event, item?.tool_id);
                            }}
                          >
                            <Typography.Text type="danger">
                              <DeleteOutlined
                                style={{
                                  color: "#dc4446",
                                  marginInlineEnd: "8px",
                                }}
                              />
                              Delete
                            </Typography.Text>
                          </Popconfirm>
                        ),
                        key: "delete",
                        onClick: (event) => event.domEvent.stopPropagation(),
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                  onClick={(evt) => evt.stopPropagation()}
                >
                  <MoreOutlined />
                </Dropdown>
              }
            >
              <div className="grid-view-card-content">
                <Typography.Paragraph type="secondary">
                  {item?.description || "No description"}
                </Typography.Paragraph>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

GridView.propTypes = {
  listOfTools: PropTypes.array.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export { GridView };
