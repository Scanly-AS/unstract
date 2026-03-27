import {
  BranchesOutlined,
  DoubleRightOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Image,
  Layout,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import apiDeploy from "../../../assets/api-deployments.svg";
import ConnectorsIcon from "../../../assets/connectors.svg";
import CustomTools from "../../../assets/custom-tools-icon.svg";
import DashboardIcon from "../../../assets/dashboard.svg";
import EmbeddingIcon from "../../../assets/embedding.svg";
import etl from "../../../assets/etl.svg";
import LlmIcon from "../../../assets/llm.svg";
import PlatformSettingsIcon from "../../../assets/platform-settings.svg";
import task from "../../../assets/task.svg";
import TerminalIcon from "../../../assets/terminal.svg";
import TextExtractorIcon from "../../../assets/text-extractor.svg";
import VectorDbIcon from "../../../assets/vector-db.svg";
import Workflows from "../../../assets/Workflows.svg";
import {
  getLocalStorageValue,
  setLocalStorageValue,
} from "../../../helpers/localStorage";
import { useSessionStore } from "../../../store/session-store";

import "./SideNavBar.css";
import "../../settings/settings/Settings.css";

const { Sider } = Layout;

let getMenuItem;
try {
  getMenuItem = await import("../../../plugins/app-deployment/getMenuItem");
} catch {
  // Plugin unavailable.
}

let sideMenu;
try {
  sideMenu = await import("../../../plugins/hooks/useSideMenu");
} catch {
  // Plugin unavailable.
}

let unstractSubscriptionPlan;
let unstractSubscriptionPlanStore;
let UNSTRACT_SUBSCRIPTION_PLANS;
try {
  unstractSubscriptionPlanStore = await import(
    "../../../plugins/store/unstract-subscription-plan-store"
  );
  const unstractSubscriptionConstants = await import(
    "../../../plugins/unstract-subscription/helper/constants"
  );
  UNSTRACT_SUBSCRIPTION_PLANS =
    unstractSubscriptionConstants?.UNSTRACT_SUBSCRIPTION_PLANS;
} catch {
  // Plugin unavailable.
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

let agenticPromptStudioEnabled = false;
try {
  await import("../../../plugins/agentic-prompt-studio");
  agenticPromptStudioEnabled = true;
} catch {
  // Plugin unavailable
}

let manualReviewSettingsEnabled = false;
try {
  await import("../../../plugins/manual-review/settings/Settings.jsx");
  manualReviewSettingsEnabled = true;
} catch {
  // Plugin unavailable
}

const getSettingsMenuItems = (orgName, isAdmin, t) => [
  {
    key: "platform",
    label: t("settingsMenu.platformSettings"),
    path: `/${orgName}/settings/platform`,
  },
  ...(isAdmin
    ? [
        {
          key: "platformApiKeys",
          label: t("settingsMenu.platformApiKeys"),
          path: `/${orgName}/settings/platform-api-keys`,
        },
      ]
    : []),
  {
    key: "users",
    label: t("settingsMenu.userManagement"),
    path: `/${orgName}/users`,
  },
  {
    key: "triad",
    label: t("settingsMenu.defaultTriad"),
    path: `/${orgName}/settings/triad`,
  },
  ...(manualReviewSettingsEnabled
    ? [
        {
          key: "review",
          label: t("settingsMenu.hitlSettings"),
          path: `/${orgName}/settings/review`,
        },
      ]
    : []),
];

const getActiveSettingsKey = () => {
  const currentPath = globalThis.location.pathname;
  if (currentPath.includes("/settings/platform-api-keys")) {
    return "platformApiKeys";
  }
  if (currentPath.includes("/settings/platform")) {
    return "platform";
  }
  if (currentPath.includes("/users")) {
    return "users";
  }
  if (currentPath.includes("/settings/triad")) {
    return "triad";
  }
  if (currentPath.includes("/settings/review")) {
    return "review";
  }
  return "platform";
};

const SettingsPopoverContent = ({ orgName, navigate, isAdmin, t }) => {
  const settingsMenuItems = getSettingsMenuItems(orgName, isAdmin, t);
  const currentActiveKey = getActiveSettingsKey();

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="settings-sidebar-popover">
      {settingsMenuItems.map((menuItem) => (
        <button
          key={menuItem.key}
          type="button"
          className={`settings-menu-item ${
            currentActiveKey === menuItem.key ? "active" : ""
          }`}
          onClick={() => handleMenuClick(menuItem.path)}
        >
          {menuItem.label}
        </button>
      ))}
    </nav>
  );
};

SettingsPopoverContent.propTypes = {
  orgName: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

const HITL_MENU_KEYS = [
  { key: "review", labelKey: "hitlMenu.review", subPath: "/review" },
  {
    key: "approve",
    labelKey: "hitlMenu.approve",
    subPath: "/review/approve",
    supervisorOnly: true,
  },
  {
    key: "download",
    labelKey: "hitlMenu.downloadSync",
    subPath: "/review/download_and_sync",
    supervisorOnly: true,
  },
];

const getHITLMenuItems = (orgName, role, t) => {
  const isSupervisorOrAdmin = [
    "unstract_supervisor",
    "unstract_admin",
  ].includes(role);
  return HITL_MENU_KEYS.filter(
    (item) => !item.supervisorOnly || isSupervisorOrAdmin,
  ).map((item) => ({
    key: item.key,
    label: t(item.labelKey),
    path: `/${orgName}${item.subPath}`,
  }));
};

const getActiveHITLKey = (orgName) => {
  const currentPath = globalThis.location.pathname;
  const base = `/${orgName}/review`;
  if (currentPath.startsWith(`${base}/approve`)) {
    return "approve";
  }
  if (currentPath.startsWith(`${base}/download_and_sync`)) {
    return "download";
  }
  if (currentPath.startsWith(base)) {
    return "review";
  }
  return "review";
};

const HITLPopoverContent = ({ orgName, role, navigate, t }) => {
  const hitlMenuItems = getHITLMenuItems(orgName, role, t);
  const currentActiveKey = getActiveHITLKey(orgName);

  return (
    <nav className="settings-sidebar-popover">
      {hitlMenuItems.map((menuItem) => (
        <button
          key={menuItem.key}
          type="button"
          className={`settings-menu-item ${
            currentActiveKey === menuItem.key ? "active" : ""
          }`}
          onClick={() => navigate(menuItem.path)}
        >
          {menuItem.label}
        </button>
      ))}
    </nav>
  );
};

HITLPopoverContent.propTypes = {
  orgName: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const SideNavBar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sessionDetails } = useSessionStore();
  const { orgName, flags, role } = sessionDetails;

  const [isPinned, setIsPinned] = useState(() =>
    getLocalStorageValue("sidebarPinned", false),
  );
  const collapseTimeoutRef = useRef(null);

  const clearCollapseTimeout = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    setLocalStorageValue("sidebarPinned", isPinned);
    if (isPinned) {
      clearCollapseTimeout();
      setCollapsed(false);
    }
    return clearCollapseTimeout;
  }, [isPinned, setCollapsed]);

  const handleMouseEnter = () => {
    clearCollapseTimeout();
    if (!isPinned) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      collapseTimeoutRef.current = setTimeout(() => setCollapsed(true), 300);
    }
  };

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    if (newPinned) {
      setCollapsed(false);
    }
  };

  try {
    if (unstractSubscriptionPlanStore?.useUnstractSubscriptionPlanStore) {
      unstractSubscriptionPlan =
        unstractSubscriptionPlanStore?.useUnstractSubscriptionPlanStore(
          (state) => state?.unstractSubscriptionPlan,
        );
    }
  } catch (_error) {
    // Do nothing
  }

  if (selectedProductStore?.useSelectedProductStore) {
    selectedProduct = selectedProductStore.useSelectedProductStore(
      (state) => state?.selectedProduct,
    );
  }

  let menu;
  if (sideMenu?.useSideMenu) {
    menu = sideMenu.useSideMenu();
  }

  const unstractMenuItems = [
    {
      id: 1,
      mainTitle: t("sidebar.build"),
      subMenu: [
        {
          id: 1.1,
          title: t("sidebar.promptStudio"),
          description: t("sidebar.promptStudioDesc"),
          image: CustomTools,
          path: `/${orgName}/tools`,
          active: globalThis.location.pathname.startsWith(`/${orgName}/tools`),
        },
        {
          id: 1.3,
          title: t("sidebar.workflows"),
          description: t("sidebar.workflowsDesc"),
          icon: BranchesOutlined,
          image: Workflows,
          path: `/${orgName}/workflows`,
          active: globalThis.location.pathname.startsWith(
            `/${orgName}/workflows`,
          ),
        },
      ],
    },
    {
      id: 2,
      mainTitle: t("sidebar.manage"),
      subMenu: [
        {
          id: 2.2,
          title: t("sidebar.apiDeployments"),
          description: t("sidebar.apiDeploymentsDesc"),
          image: apiDeploy,
          path: `/${orgName}/api`,
          active: globalThis.location.pathname.startsWith(`/${orgName}/api`),
        },
        {
          id: 2.3,
          title: t("sidebar.etlPipelines"),
          description: t("sidebar.etlPipelinesDesc"),
          image: etl,
          path: `/${orgName}/etl`,
          active: globalThis.location.pathname.startsWith(`/${orgName}/etl`),
        },
        {
          id: 2.4,
          title: t("sidebar.taskPipelines"),
          description: t("sidebar.taskPipelinesDesc"),
          image: task,
          path: `/${orgName}/task`,
          active: globalThis.location.pathname.startsWith(`/${orgName}/task`),
        },
        {
          id: 1.5,
          title: t("sidebar.logs"),
          description: t("sidebar.logsDesc"),
          image: TerminalIcon,
          path: `/${orgName}/logs`,
          active: globalThis.location.pathname.startsWith(`/${orgName}/logs`),
        },
      ],
    },
    {
      id: 3,
      mainTitle: t("sidebar.settings"),
      subMenu: [
        {
          id: 3.1,
          title: t("sidebar.llms"),
          description: t("sidebar.llmsDesc"),
          icon: BranchesOutlined,
          image: LlmIcon,
          path: `/${orgName}/settings/llms`,
          active: globalThis.location.pathname.startsWith(
            `/${orgName}/settings/llms`,
          ),
        },
        {
          id: 3.2,
          title: t("sidebar.vectorDbs"),
          description: t("sidebar.vectorDbsDesc"),
          image: VectorDbIcon,
          path: `/${orgName}/settings/vectorDbs`,
          active: globalThis.location.pathname.startsWith(
            `/${orgName}/settings/vectorDbs`,
          ),
        },
        {
          id: 3.3,
          title: t("sidebar.embedding"),
          description: t("sidebar.embeddingDesc"),
          image: EmbeddingIcon,
          path: `/${orgName}/settings/embedding`,
          active: globalThis.location.pathname.startsWith(
            `/${orgName}/settings/embedding`,
          ),
        },
        {
          id: 3.4,
          title: t("sidebar.textExtractor"),
          description: t("sidebar.textExtractorDesc"),
          image: TextExtractorIcon,
          path: `/${orgName}/settings/textExtractor`,
          active: globalThis.location.pathname.startsWith(
            `/${orgName}/settings/textExtractor`,
          ),
        },
        {
          id: 3.5,
          title: t("sidebar.connectors"),
          description: t("sidebar.connectorsDesc"),
          image: ConnectorsIcon,
          path: `/${orgName}/settings/connectors`,
          active: globalThis.location.pathname.startsWith(
            `/${orgName}/settings/connectors`,
          ),
        },
        {
          id: 3.6,
          title: t("sidebar.platform"),
          description: t("sidebar.platformDesc"),
          image: PlatformSettingsIcon,
          path: `/${orgName}/settings/platform`,
          active:
            globalThis.location.pathname === `/${orgName}/settings` ||
            globalThis.location.pathname === `/${orgName}/settings/platform` ||
            globalThis.location.pathname ===
              `/${orgName}/settings/platform-api-keys` ||
            globalThis.location.pathname === `/${orgName}/settings/triad` ||
            globalThis.location.pathname === `/${orgName}/settings/review` ||
            globalThis.location.pathname === `/${orgName}/users`,
        },
      ],
    },
  ];

  // Dashboard menu item (available for both OSS and cloud)
  unstractMenuItems[1].subMenu.unshift({
    id: 2.0,
    title: t("sidebar.dashboard"),
    description: t("sidebar.dashboardDesc"),
    image: DashboardIcon,
    path: `/${orgName}/dashboard`,
    active: globalThis.location.pathname.startsWith(`/${orgName}/dashboard`),
  });

  // If selectedProduct is verticals and menu is null, don't show any sidebar items
  const data =
    selectedProduct === "verticals" && menu === null
      ? []
      : menu || unstractMenuItems;

  if (getMenuItem && flags?.app_deployment) {
    data[1]?.subMenu?.splice(1, 0, getMenuItem.default(orgName));
  }

  // Memoize isUnstract calculation to avoid redundant computation
  const isUnstract = useMemo(
    () => !(selectedProduct && selectedProduct !== "unstract"),
    [selectedProduct],
  );

  // Add Agentic Prompt Studio menu item if plugin is available and product is unstract
  if (agenticPromptStudioEnabled && isUnstract) {
    data[0]?.subMenu?.splice(1, 0, {
      id: 1.2,
      title: t("sidebar.agenticPromptStudio"),
      description: t("sidebar.agenticPromptStudioDesc"),
      image: CustomTools,
      path: `/${orgName}/agentic-prompt-studio`,
      active: globalThis.location.pathname.startsWith(
        `/${orgName}/agentic-prompt-studio`,
      ),
      tag: "BETA",
    });
  }

  // Add HITL Review section if plugin is available and user has HITL role
  const isHITLRole = [
    "unstract_reviewer",
    "unstract_supervisor",
    "unstract_admin",
  ].includes(role);
  if (manualReviewSettingsEnabled && isHITLRole && isUnstract) {
    const reviewTitle = t("sidebar.review");
    const hasReviewSection = data.some(
      (item) => item.mainTitle === reviewTitle,
    );
    const settingsTitle = t("sidebar.settings");
    const settingsIndex = data.findIndex(
      (item) => item.mainTitle === settingsTitle,
    );
    if (!hasReviewSection && settingsIndex !== -1) {
      data.splice(settingsIndex, 0, {
        id: 2.5,
        mainTitle: reviewTitle,
        subMenu: [
          {
            id: 2.51,
            title: t("sidebar.hitl"),
            description: t("sidebar.hitlDesc"),
            isHITL: true,
            path: `/${orgName}/review`,
            active: globalThis.location.pathname.startsWith(
              `/${orgName}/review`,
            ),
          },
        ],
      });
    }
  }

  const shouldDisableAll = useMemo(() => {
    if (
      !unstractSubscriptionPlan ||
      !UNSTRACT_SUBSCRIPTION_PLANS ||
      !isUnstract
    ) {
      return false;
    }

    return unstractSubscriptionPlan?.remainingDays < 0;
  }, [unstractSubscriptionPlan, isUnstract]);

  data?.forEach((mainMenuItem) => {
    mainMenuItem?.subMenu?.forEach((subMenuItem) => {
      subMenuItem.disable = shouldDisableAll;
    });
  });

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="side-bar"
      width={240}
      collapsedWidth={65}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-content-wrapper">
        <div className="main-slider">
          <div className="slider-wrap">
            {data?.map((item, index) => (
              <div key={item?.id}>
                {!collapsed && (
                  <Typography className="sidebar-main-heading">
                    {item?.mainTitle}
                  </Typography>
                )}
                <Space direction="vertical" className="menu-item-body">
                  {item?.subMenu?.map((el) => {
                    // HITL item has a hover menu
                    if (el.isHITL) {
                      const handleHITLClick = () => {
                        if (!el.disable) {
                          navigate(el.path);
                        }
                      };

                      const hitlContent = (
                        <Tooltip title={collapsed ? el.title : ""}>
                          <Space
                            className={`space-styles ${
                              el.active ? "space-styles-active" : ""
                            } ${el.disable ? "space-styles-disable" : ""}`}
                            onClick={handleHITLClick}
                            data-testid={`sidebar-${el.title
                              ?.toLowerCase()
                              ?.replaceAll(/\s+/g, "-")}`}
                          >
                            <FileProtectOutlined className="sidebar-antd-icon" />
                            {!collapsed && (
                              <div>
                                <Typography className="sidebar-item-text fs-14">
                                  {el.title}
                                </Typography>
                                <Typography className="sidebar-item-text fs-11">
                                  {el.description}
                                </Typography>
                              </div>
                            )}
                          </Space>
                        </Tooltip>
                      );

                      if (el.disable) {
                        return <div key={el.id}>{hitlContent}</div>;
                      }

                      return (
                        <Popover
                          key={el.id}
                          content={
                            <HITLPopoverContent
                              orgName={orgName}
                              role={role}
                              navigate={navigate}
                              t={t}
                            />
                          }
                          trigger="hover"
                          placement="rightTop"
                          arrow={false}
                          overlayClassName="settings-popover-overlay"
                        >
                          {hitlContent}
                        </Popover>
                      );
                    }

                    // Platform item has a hover menu and click navigates to platform settings
                    if (el.id === 3.6) {
                      const handlePlatformClick = () => {
                        if (!el.disable) {
                          navigate(el.path);
                        }
                      };

                      const platformContent = (
                        <Tooltip title={collapsed ? el.title : ""}>
                          <Space
                            className={`space-styles ${
                              el.active ? "space-styles-active" : ""
                            } ${el.disable ? "space-styles-disable" : ""}`}
                            onClick={handlePlatformClick}
                            data-testid={`sidebar-${el.title
                              ?.toLowerCase()
                              ?.replaceAll(/\s+/g, "-")}`}
                          >
                            <Image
                              src={el.image}
                              alt="side_icon"
                              className="menu-item-icon"
                              preview={false}
                            />
                            {!collapsed && (
                              <div>
                                <Typography className="sidebar-item-text fs-14">
                                  {el.title}
                                </Typography>
                                <Typography className="sidebar-item-text fs-11">
                                  {el.description}
                                </Typography>
                              </div>
                            )}
                          </Space>
                        </Tooltip>
                      );

                      // Don't show popover when disabled
                      if (el.disable) {
                        return <div key={el.id}>{platformContent}</div>;
                      }

                      return (
                        <Popover
                          key={el.id}
                          content={
                            <SettingsPopoverContent
                              orgName={orgName}
                              navigate={navigate}
                              isAdmin={sessionDetails?.isAdmin}
                              t={t}
                            />
                          }
                          trigger="hover"
                          placement="rightTop"
                          arrow={false}
                          overlayClassName="settings-popover-overlay"
                        >
                          {platformContent}
                        </Popover>
                      );
                    }

                    return (
                      <Tooltip key={el.id} title={collapsed ? el.title : ""}>
                        <Space
                          className={`space-styles ${
                            el.active ? "space-styles-active" : ""
                          } ${el.disable ? "space-styles-disable" : ""}`}
                          onClick={() => {
                            if (!el.disable) {
                              navigate(el.path);
                            }
                          }}
                          data-testid={`sidebar-${el.title
                            ?.toLowerCase()
                            ?.replaceAll(/\s+/g, "-")}`}
                        >
                          <Image
                            src={el.image}
                            alt="side_icon"
                            className="menu-item-icon"
                            preview={false}
                          />
                          {!collapsed && (
                            <div>
                              <Typography className="sidebar-item-text fs-14">
                                {el.title}
                                {el.tag && (
                                  <Tag
                                    color="blue"
                                    className="sidebar-menu-tag"
                                  >
                                    {el.tag}
                                  </Tag>
                                )}
                              </Typography>
                              <Typography className="sidebar-item-text fs-11">
                                {el.description}
                              </Typography>
                            </div>
                          )}
                        </Space>
                      </Tooltip>
                    );
                  })}
                </Space>
                {index < data.length - 1 && (
                  <Divider className="sidebar-divider" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {!collapsed && (
        <Button
          type="text"
          className="sidebar-toggle-container"
          onClick={togglePin}
          aria-pressed={isPinned}
          aria-label={
            isPinned ? t("sidebar.unpinSidebar") : t("sidebar.pinSidebar")
          }
          icon={
            <DoubleRightOutlined
              className={`sidebar-toggle-icon${isPinned ? " pinned" : ""}`}
            />
          }
        />
      )}
    </Sider>
  );
};

SideNavBar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
};

export default SideNavBar;
