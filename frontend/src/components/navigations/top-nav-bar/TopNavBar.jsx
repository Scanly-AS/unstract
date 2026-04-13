import {
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Dropdown,
  Image,
  Row,
  Space,
  Typography,
} from "antd";
import axios from "axios";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { UnstractLogo } from "../../../assets/index.js";
import {
  getBaseUrl,
  homePagePath,
  onboardCompleted,
} from "../../../helpers/GetStaticData.js";
import useLogout from "../../../hooks/useLogout.js";
import { changeLanguage, LANGUAGES } from "../../../i18n/i18n.js";
import "../../../layouts/page-layout/PageLayout.css";
import { useSessionStore } from "../../../store/session-store.js";
import "./TopNavBar.css";
import config from "../../../config";
import { useExceptionHandler } from "../../../hooks/useExceptionHandler.jsx";
import { useAlertStore } from "../../../store/alert-store.js";
import { ConfirmModal } from "../../widgets/confirm-modal/ConfirmModal.jsx";

let TrialDaysInfo;
try {
  const mod = await import(
    "../../../plugins/unstract-subscription/components/TrialDaysInfo.jsx"
  );
  TrialDaysInfo = mod.default;
} catch {
  // Plugin not found
}

let selectedProductStore;
let selectedProduct;

try {
  selectedProductStore = await import(
    "../../../plugins/store/select-product-store.js"
  );
} catch {
  // Ignore if hook not available
}

let PlatformDropdown;
try {
  const mod = await import(
    "../../../plugins/platform-dropdown/PlatformDropDown.jsx"
  );
  PlatformDropdown = mod.PlatformDropdown;
} catch {
  // Plugin not found
}

let WhispererLogo;
try {
  const mod = await import("../../../plugins/assets/llmWhisperer/index.js");
  WhispererLogo = mod.WhispererLogo;
} catch {
  // Ignore if hook not available
}

const CustomLogo = ({ onClick, className }) => {
  // Use Ant Design Image and config.logoUrl
  if (config.logoUrl) {
    return (
      <Image
        src={config.logoUrl}
        preview={false}
        className={className}
        onClick={onClick}
        alt="logo"
        width={120}
        style={{
          cursor: onClick ? "pointer" : undefined,
          background: "transparent",
        }}
        onError={() => {
          // If image fails to load, component will re-render and use UnstractLogo
          // since we'll set config.logoUrl to null
          if (config.logoUrl) {
            // Only modify if it's not already null to avoid infinite re-renders
            config.logoUrl = null;
          }
        }}
      />
    );
  }
  return <UnstractLogo className={className} onClick={onClick} />;
};
let APIHubLogo;
try {
  const mod = await import("../../../plugins/assets/verticals/index.js");
  APIHubLogo = mod.APIHubLogo;
} catch {
  // Ignore if hook not available
}

let unstractSubscriptionPlan;
let unstractSubscriptionPlanStore;
let UNSTRACT_SUBSCRIPTION_PLANS;
let UnstractPricingMenuLink;
try {
  unstractSubscriptionPlanStore = await import(
    "../../../plugins/store/unstract-subscription-plan-store"
  );
  const constantsMod = await import(
    "../../../plugins/unstract-subscription/helper/constants"
  );
  UNSTRACT_SUBSCRIPTION_PLANS = constantsMod.UNSTRACT_SUBSCRIPTION_PLANS;
  const menuMod = await import(
    "../../../plugins/unstract-subscription/components/UnstractPricingMenuLink.jsx"
  );
  UnstractPricingMenuLink = menuMod.UnstractPricingMenuLink;
} catch {
  // Plugin unavailable.
}

function TopNavBar({ isSimpleLayout, topNavBarOptions }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { sessionDetails } = useSessionStore();
  const { orgName, allOrganization, orgId, isLoggedIn } = sessionDetails;
  const baseUrl = getBaseUrl();
  const onBoardUrl = `${baseUrl}/${orgName}/onboard`;
  const logout = useLogout();
  const [showOnboardBanner, setShowOnboardBanner] = useState(false);
  const [reviewPageHeader, setReviewPageHeader] = useState("");
  const { setAlertDetails } = useAlertStore();
  const handleException = useExceptionHandler();
  const location = useLocation();

  if (selectedProductStore?.useSelectedProductStore) {
    selectedProduct = selectedProductStore.useSelectedProductStore(
      (state) => state?.selectedProduct,
    );
  }

  try {
    if (unstractSubscriptionPlanStore?.useUnstractSubscriptionPlanStore) {
      unstractSubscriptionPlan =
        unstractSubscriptionPlanStore?.useUnstractSubscriptionPlanStore(
          (state) => state?.unstractSubscriptionPlan,
        );
    }
  } catch {
    // Plugin hook may throw during initialization
  }

  const shouldDisableRouting = useMemo(() => {
    if (!unstractSubscriptionPlan || !UNSTRACT_SUBSCRIPTION_PLANS) {
      return false;
    }

    return unstractSubscriptionPlan?.remainingDays <= 0;
  }, [unstractSubscriptionPlan]);

  // Detect product from URL path as a fallback when selectedProduct is not set
  // (e.g., incognito/unauthenticated users visiting verticals pages)
  const isVerticalsRoute = location.pathname.startsWith("/verticals");
  const effectiveProduct =
    selectedProduct || (isVerticalsRoute ? "verticals" : null);
  const isUnstract = !(effectiveProduct && effectiveProduct !== "unstract");
  const isAPIHub = effectiveProduct === "verticals";
  const isStaff = sessionDetails?.isStaff || sessionDetails?.is_staff;
  const isOpenSource = orgName === "mock_org";

  // Check user role and whether the onboarding is incomplete
  useEffect(() => {
    const { role } = sessionDetails;
    const isReviewer = role === "unstract_reviewer";
    const isSupervisor = role === "unstract_supervisor";

    setShowOnboardBanner(
      !onboardCompleted(sessionDetails?.adapters) &&
        !isReviewer &&
        !isSupervisor,
    );
  }, [sessionDetails]);

  // Determine review page header
  useEffect(() => {
    const pathSegments = location.pathname.split("review");
    if (pathSegments.length > 1) {
      if (pathSegments[1].includes("/approve")) {
        setReviewPageHeader(t("reviewHeader.approve"));
      } else if (pathSegments[1].includes("/download_and_sync")) {
        setReviewPageHeader(t("reviewHeader.downloadAndSync"));
      } else {
        setReviewPageHeader(t("reviewHeader.review"));
      }
    } else {
      setReviewPageHeader(null);
    }
    if (location.pathname.includes("/simple_review")) {
      setReviewPageHeader(t("reviewHeader.simpleReview"));
    }
  }, [location, t]);

  // Switch organization
  const handleContinue = useCallback(async (selectedOrg) => {
    const requestOptions = {
      method: "POST",
      url: `/api/v1/organization/${selectedOrg}/set`,
      headers: {
        "X-CSRFToken": sessionDetails?.csrfToken,
      },
    };
    try {
      await axios(requestOptions);
      navigate("/");
      window.location.reload();
    } catch (err) {
      setAlertDetails(handleException(err));
    }
  }, []);

  // Prepare org list for switching
  const cascadeOptions = useMemo(() => {
    return allOrganization?.map((org) => {
      return {
        key: org?.id,
        label:
          org?.id === sessionDetails?.orgId ? (
            <div
              onClick={() =>
                setAlertDetails({
                  type: "error",
                  content: t("nav.alreadyInOrg", {
                    orgName: org?.display_name,
                  }),
                })
              }
            >
              {org?.display_name}
            </div>
          ) : (
            <ConfirmModal
              handleConfirm={() => handleContinue(org?.id)}
              content={t("nav.switchToOrg", {
                orgName: org?.display_name,
              })}
            >
              <div>{org?.display_name}</div>
            </ConfirmModal>
          ),
      };
    });
  }, [allOrganization, handleContinue, t]);

  // Language sub-menu items
  const languageMenuItems = useMemo(() => {
    return LANGUAGES.map((lang) => ({
      key: lang.code,
      label: (
        <div
          onClick={() => changeLanguage(lang.code)}
          style={{
            fontWeight: i18n.language === lang.code ? "bold" : "normal",
          }}
        >
          {lang.label}
        </div>
      ),
    }));
  }, [i18n.language]);

  // Build dropdown menu items
  const items = useMemo(() => {
    const handleLogin = () => {
      const baseUrl = getBaseUrl();
      const newURL = baseUrl + "/api/v1/login";
      window.location.href = newURL;
    };

    const handleClick = isLoggedIn ? logout : handleLogin;
    const icon = isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />;
    const label = isLoggedIn ? t("nav.logout") : t("nav.login");

    return [
      // Profile
      isUnstract &&
        !isSimpleLayout && {
          key: "1",
          label: (
            <Button
              onClick={() => navigate(`/${orgName}/profile`)}
              className="logout-button"
              disabled={shouldDisableRouting}
              type="text"
            >
              <UserOutlined /> {t("nav.profile")}
            </Button>
          ),
        },
      // Switch Organization
      allOrganization?.length > 1 && {
        key: "3",
        label: (
          <Dropdown
            placeholder="Switch Organization"
            menu={{
              items: cascadeOptions,
              selectable: true,
              selectedKeys: [orgId],
              className: "switch-org-menu",
            }}
            placement="left"
          >
            <div className="ant-dropdown-trigger">
              <UserSwitchOutlined /> {t("nav.switchOrg")}
            </div>
          </Dropdown>
        ),
      },
      // Language toggle
      {
        key: "9",
        label: (
          <Dropdown
            menu={{
              items: languageMenuItems,
              selectable: true,
              selectedKeys: [i18n.language],
            }}
            placement="left"
          >
            <div className="ant-dropdown-trigger">
              <GlobalOutlined />{" "}
              {LANGUAGES.find((l) => l.code === i18n.language)?.label ||
                "Norsk"}
            </div>
          </Dropdown>
        ),
      },
      // Pricing
      isUnstract &&
        UnstractPricingMenuLink &&
        sessionDetails?.isAdmin &&
        !sessionDetails?.provider && {
          key: "7",
          label: <UnstractPricingMenuLink orgName={orgName} />,
        },
      // Custom Plans
      isUnstract &&
        isStaff &&
        !isOpenSource && {
          key: "8",
          label: (
            <Button
              onClick={() => navigate(`/${orgName}/admin/custom-plans`)}
              className="logout-button"
              type="text"
            >
              <SettingOutlined /> {t("nav.customPlans")}
            </Button>
          ),
        },
      // Login/Logout
      {
        key: "2",
        label: (
          <Button
            onClick={handleClick}
            icon={icon}
            className="logout-button"
            type="text"
          >
            {label}
          </Button>
        ),
      },
    ].filter(Boolean);
  }, [
    isUnstract,
    isSimpleLayout,
    allOrganization,
    cascadeOptions,
    orgName,
    orgId,
    shouldDisableRouting,
    t,
    i18n.language,
    languageMenuItems,
  ]);

  // Function to get the initials from the user name
  const getInitials = useCallback((name) => {
    const names = name?.split(" ");
    return names
      ?.map((n) => n.charAt(0))
      ?.join("")
      ?.toUpperCase();
  }, []);

  return (
    <Row align="middle" className="topNav">
      <Col span={6} className="platform-switch-container">
        {isUnstract ? (
          <CustomLogo
            className="topbar-logo cursor-pointer"
            onClick={() =>
              navigate(`/${sessionDetails?.orgName}/${homePagePath}`)
            }
          />
        ) : isAPIHub ? (
          APIHubLogo && <APIHubLogo className="topbar-logo" />
        ) : (
          WhispererLogo && <WhispererLogo className="topbar-logo" />
        )}
        {reviewPageHeader && (
          <span className="page-identifier">
            <span className="custom-tools-header-v-divider" />
            <span className="page-heading">{reviewPageHeader}</span>
          </span>
        )}
        {PlatformDropdown && <PlatformDropdown />}
      </Col>

      {isSimpleLayout ? (
        <Col span={14} />
      ) : (
        <Col span={14} className="top-nav-alert-col">
          {isUnstract && showOnboardBanner && (
            <Alert
              type="error"
              message={
                <>
                  <span className="top-nav-alert-msg">
                    {t("nav.onboardIncomplete")}
                  </span>
                  <a href={onBoardUrl} className="top-nav-alert-link">
                    {t("nav.completeOnboard")}
                  </a>
                </>
              }
              showIcon
            />
          )}
        </Col>
      )}

      <Col span={4}>
        <Row justify="end" align="middle">
          <Space>
            {topNavBarOptions}
            {isUnstract && TrialDaysInfo && <TrialDaysInfo />}
            <Dropdown
              menu={{ items, className: "user-profile-menu" }}
              placement="bottomLeft"
              arrow
              className="top-navbar-dp"
            >
              <div className="top-navbar-dp">
                {sessionDetails?.picture ? (
                  <Image
                    className="navbar-img"
                    height="100%"
                    width="100%"
                    preview={false}
                    src={sessionDetails?.picture}
                  />
                ) : (
                  <Typography.Text className="initials">
                    {getInitials(sessionDetails?.name)}
                  </Typography.Text>
                )}
              </div>
            </Dropdown>
          </Space>
        </Row>
      </Col>
    </Row>
  );
}

TopNavBar.propTypes = {
  isSimpleLayout: PropTypes.bool,
  topNavBarOptions: PropTypes.node,
};

CustomLogo.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
};

export { TopNavBar };
