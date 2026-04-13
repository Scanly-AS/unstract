import { CheckCircleFilled } from "@ant-design/icons";
import { Button, Card, Col, Layout, Row, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConnectEmbedding from "../../assets/connect_embedding.svg";
import ConnectLLM from "../../assets/connect_llm.svg";
import ConnectVectorDb from "../../assets/connect_vector_db.svg";
import ConnectTextExtractor from "../../assets/connect_x2text.svg";
import logo from "../../assets/UnstractLogoBlack.svg";
import { homePagePath, onboardCompleted } from "../../helpers/GetStaticData.js";
import { useSessionStore } from "../../store/session-store.js";
import { AddSourceModal } from "../input-output/add-source-modal/AddSourceModal.jsx";
import { CustomButton } from "../widgets/custom-button/CustomButton.jsx";
import "./onBoard.css";
const { Content } = Layout;

function OnBoard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sessionDetails } = useSessionStore();
  const { orgName, adapters } = sessionDetails;
  const [openAddSourcesModal, setOpenAddSourcesModal] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [type, setType] = useState(null);
  const homePageUrl = `/${orgName}/${homePagePath}`;
  const [adaptersList, setAdaptersList] = useState(adapters || []);
  useEffect(() => {
    if (onboardCompleted(adaptersList)) {
      navigate(homePageUrl);
    }
  }, [adaptersList]);

  const steps = [
    {
      id: 1,
      title: t("onboard.connectLLM"),
      icon: ConnectLLM,
      type: "llm",
      description: t("onboard.connectLLMDesc"),
    },
    {
      id: 2,
      title: t("onboard.connectVectorDB"),
      icon: ConnectVectorDb,
      type: "vector_db",
      description: t("onboard.connectVectorDBDesc"),
    },
    {
      id: 3,
      title: t("onboard.chooseEmbedding"),
      icon: ConnectEmbedding,
      type: "embedding",
      description: t("onboard.chooseEmbeddingDesc"),
    },
    {
      id: 4,
      title: t("onboard.connectTextExtractor"),
      icon: ConnectTextExtractor,
      type: "x2text",
      description: t("onboard.connectTextExtractorDesc"),
    },
  ];

  const showOpenAddSourcesModal = (type) => {
    setType(type);
    setOpenAddSourcesModal(true);
  };

  const addNewItem = (row, isEdit) => {
    const newAdapter = row?.adapter_type.toLowerCase();
    setAdaptersList([...adaptersList, newAdapter]);
  };

  return (
    <>
      <Content className="onboard-content">
        <div>
          <img src={logo} alt="Logo" className="landing-logo" />
          <h1 className="uppercase-text">{t("onboard.stepsAway")}</h1>
          <Space direction="vertical">
            {steps.map((step, index) => (
              <Card key={step.id} className="card-style">
                <div className="card-container">
                  <div className="circle">
                    <div className="circle-number">{step.id}</div>
                  </div>
                </div>
                <Row align="middle">
                  <Col span={3} align="" justify="">
                    <div className="">
                      <img
                        src={step.icon}
                        alt="Logo"
                        className="icon-overlay"
                      />
                    </div>
                  </Col>
                  <Col span={17}>
                    <Space direction="vertical" style={{ marginTop: "-5px" }}>
                      <h3 className="text-title-style">{step.title}</h3>
                      <Typography.Text className="text-description-style">
                        {step.description}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col span={4} align="center" justify="center">
                    {adaptersList?.includes(step.type) ? (
                      <div>
                        <CheckCircleFilled className="configured-icon" />
                        <span className="configured-text">
                          {t("onboard.configured")}
                        </span>
                      </div>
                    ) : (
                      <Button
                        className="button-style"
                        onClick={() => showOpenAddSourcesModal(step.type)}
                      >
                        {t("onboard.connect")}
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
          <div className="later-div-style">
            <div className="help-text">
              {t("onboard.needHelp")}&nbsp;
              <a
                href="https://docs.unstract.com/"
                target="_blank"
                rel="noreferrer"
                className="link-color"
              >
                {t("onboard.quickStartGuide")}&nbsp;
              </a>
              {t("onboard.toHelp")}
            </div>
            <CustomButton type="primary" onClick={() => navigate(homePageUrl)}>
              {t("onboard.completeLater")}
            </CustomButton>
          </div>
        </div>
      </Content>
      <AddSourceModal
        open={openAddSourcesModal}
        setOpen={setOpenAddSourcesModal}
        type={type}
        addNewItem={addNewItem}
        editItemId={editItemId}
        setEditItemId={setEditItemId}
      />
    </>
  );
}

export { OnBoard };
