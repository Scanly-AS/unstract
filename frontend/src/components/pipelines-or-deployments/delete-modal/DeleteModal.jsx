import { Modal } from "antd";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const DeleteModal = ({ open, setOpen, deleteRecord }) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("pipelines.confirmDelete")}
      centered
      open={open}
      onOk={deleteRecord}
      onCancel={() => setOpen(false)}
      okText={t("pipelines.delete")}
      width={500}
    ></Modal>
  );
};

DeleteModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  deleteRecord: PropTypes.func.isRequired,
};

export { DeleteModal };
