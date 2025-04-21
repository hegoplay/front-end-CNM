import { MemberDto } from "@/types/chat";
import { Button, message, Modal, Select } from "antd";
import { useState } from "react";

interface LeaveRoomButtonProps {
  userMember: MemberDto | null;
  conversationInfo: { participantsDetails: MemberDto[] };
  leaveRoomCallback: (newLeader: string | undefined) => Promise<void>;
  isShowLeaderModal?: boolean;
  // kiểu dữ liệu cho useState
  setIsShowLeaderModal: (isShow: boolean) => void;
  // setIsShowLeaderModal?: (isShow: boolean) => ;
}

const LeaveRoomModel: React.FC<LeaveRoomButtonProps> = ({
  userMember,
  conversationInfo,
  leaveRoomCallback,
  isShowLeaderModal,
  setIsShowLeaderModal, // Hàm để cập nhật trạng thái modal
}) => {
  const [selectedLeader, setSelectedLeader] = useState<MemberDto | null>(null);
  // const [isShowLeaderModal, setIsShowLeaderModal] = useState(false);

  // Hàm hiển thị modal
  const handleShowLeaderModal = () => {
    setIsShowLeaderModal(true);
  };

  // Hàm xử lý xác nhận chọn leader
  const handleModalOk = async () => {
    if (!selectedLeader) {
      message.error("Vui lòng chọn một thành viên làm leader mới!");
      return;
    }
    try{
      await leaveRoomCallback(selectedLeader.phoneNumber); // Gọi callback với đối tượng MemberDto
    message.success(`Đã chọn ${selectedLeader.name || selectedLeader.phoneNumber} làm leader mới!`);
    setIsShowLeaderModal(false);
    setSelectedLeader(null); // Reset sau khi xác nhận
    }
    catch (error) {
      message.error("Có lỗi xảy ra khi chọn leader mới!");
      console.error("Error selecting new leader:", error);
    }
  };

  // Hàm hủy modal
  const handleModalCancel = () => {
    setIsShowLeaderModal(false);
    setSelectedLeader(null); // Reset khi hủy
  };

  // Hàm xử lý rời phòng
  const handleLeaveRoom = () => {
    const isConfirmed = window.confirm("Bạn có muốn rời khỏi phòng không?");
    if (isConfirmed) {
      if (userMember?.isLeader && conversationInfo.participantsDetails.length > 3) {
        handleShowLeaderModal();
      } else {
        leaveRoomCallback(undefined); // Không phải leader, rời phòng trực tiếp
      }
    } else {
      console.log("Người dùng đã hủy!");
    }
  };

  return (
    <div>
      <Modal
        title="Chọn Leader Mới"
        open={isShowLeaderModal}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        centered
      >
        <p className="mb-4">
          Vui lòng chọn <strong>một thành viên</strong> để làm leader mới trước khi rời phòng:
        </p>
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn một thành viên"
          onChange={(phoneNumber: string) => {
            const selected = conversationInfo.participantsDetails.find(
              (member) => member.phoneNumber === phoneNumber
            );
            setSelectedLeader(selected || null); // Lưu toàn bộ MemberDto
          }}
          value={selectedLeader?.phoneNumber || undefined} // Hiển thị phoneNumber trong Select
          showSearch
          filterOption={(input, option) =>
            (option?.value as string ?? '').toLowerCase().includes(input.toLowerCase())
          }
          
        >
          {conversationInfo.participantsDetails
            .filter((member) => member.phoneNumber !== userMember?.phoneNumber)
            .map((member) => (
              <Select.Option key={member.phoneNumber} value={member.phoneNumber}>
                {`${member.name} (${member.phoneNumber})`}
              </Select.Option>
            ))}
        </Select>
      </Modal>
    </div>
  );
};

export default LeaveRoomModel;