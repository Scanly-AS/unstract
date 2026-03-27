import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Spin, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

import { OrganizationIcon } from "../../assets";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useAlertStore } from "../../store/alert-store.js";
import { useSessionStore } from "../../store/session-store.js";

function Profile() {
  const navigate = useNavigate();
  const { sessionDetails } = useSessionStore();
  const { setAlertDetails } = useAlertStore();
  const axiosPrivate = useAxiosPrivate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!sessionDetails.orgId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axiosPrivate({
          url: `/api/v1/unstract/${sessionDetails.orgId}/users/profile/`,
          method: "GET",
        });
        setProfileData(response.data?.user);
      } catch {
        setAlertDetails({
          type: "error",
          content: t("profile.couldNotRefresh"),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [sessionDetails.orgId, axiosPrivate, setAlertDetails]);

  const handleCopy = async (text, label) => {
    if (!text) {
      setAlertDetails({
        type: "error",
        content: t("profile.noCopyAvailable", { label }),
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setAlertDetails({
        type: "success",
        content: t("profile.copiedToClipboard", { label }),
      });
    } catch {
      setAlertDetails({
        type: "error",
        content: t("profile.failedToCopy", { label }),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        {/* Secondary header bar - outside white container */}
        <div className="profile-secondary-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
          <Typography.Text strong className="profile-header-title">
            {t("profile.title")}
          </Typography.Text>
        </div>
        <div className="profile-outer-container">
          <div className="profile-loading">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  const userName = profileData?.display_name || sessionDetails.display_name;
  const email = profileData?.email || sessionDetails.email;
  const orgName = profileData?.organization_name || sessionDetails.orgName;
  const orgId = profileData?.organization_id || sessionDetails.orgId;
  const role = profileData?.role || sessionDetails.role;

  return (
    <div className="profile-page">
      {/* Secondary header bar - outside white container */}
      <div className="profile-secondary-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <Typography.Text strong className="profile-header-title">
          {t("profile.title")}
        </Typography.Text>
      </div>
      {/* White container with cards only */}
      <div className="profile-outer-container">
        <div className="profile-content">
          <Row gutter={[16, 16]}>
            {/* User Information Card */}
            <Col xs={24} md={12}>
              <Card className="profile-card">
                <Space size={12} className="card-header">
                  <div className="card-icon-circle user-icon">
                    <UserOutlined />
                  </div>
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong className="card-title">
                      {t("profile.userInformation")}
                    </Typography.Text>
                    <Typography.Text type="secondary" className="card-subtitle">
                      {t("profile.personalDetails")}
                    </Typography.Text>
                  </Space>
                </Space>
                <Space
                  direction="vertical"
                  size={16}
                  className="card-content width-100"
                >
                  <div className="field-group">
                    <Typography.Text type="secondary" className="field-label">
                      {t("profile.fullName")}
                    </Typography.Text>
                    <div className="field-box">
                      <Typography.Text className="field-value">
                        {userName}
                      </Typography.Text>
                      <UserOutlined className="field-icon" />
                    </div>
                  </div>
                  <div className="field-group">
                    <Typography.Text type="secondary" className="field-label">
                      {t("profile.emailAddress")}
                    </Typography.Text>
                    <div className="field-box">
                      <Typography.Text className="field-value">
                        {email}
                      </Typography.Text>
                      <MailOutlined className="field-icon" />
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Organization Card */}
            <Col xs={24} md={12}>
              <Card className="profile-card">
                <Space size={12} className="card-header">
                  <div className="card-icon-circle org-icon">
                    <OrganizationIcon />
                  </div>
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong className="card-title">
                      {t("profile.organization")}
                    </Typography.Text>
                    <Typography.Text type="secondary" className="card-subtitle">
                      {t("profile.workspaceInfo")}
                    </Typography.Text>
                  </Space>
                </Space>
                <Space
                  direction="vertical"
                  size={16}
                  className="card-content width-100"
                >
                  <div className="field-group">
                    <Typography.Text type="secondary" className="field-label">
                      {t("profile.organizationName")}
                    </Typography.Text>
                    <div className="field-box">
                      <Typography.Text className="field-value">
                        {orgName}
                      </Typography.Text>
                    </div>
                  </div>
                  <div className="field-group">
                    <Typography.Text type="secondary" className="field-label">
                      {t("profile.organizationId")}
                    </Typography.Text>
                    <div className="field-with-action">
                      <div className="field-box">
                        <Typography.Text className="field-value org-id">
                          {orgId}
                        </Typography.Text>
                      </div>
                      <Tooltip
                        title={
                          orgId ? t("profile.copyOrgId") : t("profile.noOrgId")
                        }
                      >
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          className="copy-button"
                          onClick={() => handleCopy(orgId, "Organization ID")}
                          disabled={!orgId}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  {role && (
                    <div className="field-group">
                      <Typography.Text type="secondary" className="field-label">
                        {t("profile.yourRole")}
                      </Typography.Text>
                      <Typography.Text strong className="role-badge">
                        <CheckCircleOutlined />
                        {role}
                      </Typography.Text>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export { Profile };
