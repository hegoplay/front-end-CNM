import { ConversationDetailDto } from '@/types/chat';
import React from 'react';
import SectionBox from './SectionBox';
import AvatarImg from '@/components/AvatarImg';
import styles from './RightMoreConversation.module.css';

interface Props {
  conversationInfo: ConversationDetailDto;
}

const RightMoreConversation: React.FC<Props> = ({ conversationInfo }) => {
  const [showMedia, setShowMedia] = React.useState(false);
  const [showFiles, setShowFiles] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState('');

  // Hàm kiểm tra URL có phải là video dựa vào phần mở rộng
  const isVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  // Mở modal khi nhấp vào ảnh
  const openModal = (url: string) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage('');
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'file';
  };

  return (
    <div className="flex flex-col w-80 overflow-y-scroll bg-gray-100 border-1 border-gray-200 gap-2">
      <SectionBox>
        <p
          style={{ marginBottom: 0, fontWeight: 600, textAlign: 'center' }}
          className="text-sm"
        >
          {conversationInfo.type === 'PRIVATE' ? 'Thông tin hội thoại' : 'Thông tin nhóm'}
        </p>
      </SectionBox>
      <SectionBox className="items-center">
        <>
          <AvatarImg imgUrl={conversationInfo.conversationImgUrl || '/avatar.jpg'} />
          <span className="font-bold text-sm">{conversationInfo.conversationName}</span>
        </>
      </SectionBox>
      {/* show media */}
      <SectionBox>
        <div className="flex flex-col gap-2">
          {/* Nút toggle hiển thị media */}
          <div
            onClick={() => setShowMedia(!showMedia)}
            className="w-full flex cursor-pointer"
          >
            <p
              style={{ margin: 0, fontWeight: 600 }}
              className="text-sm text-black hover:text-blue-800"
            >
              {showMedia ? 'Ẩn Media' : 'Hiển thị Media'}
            </p>
          </div>
          {/* Hiển thị danh sách media khi showMedia là true */}
          {showMedia && (
            <div className="grid grid-cols-3 gap-2">
              {conversationInfo.messageDetails && conversationInfo.messageDetails.length > 0 ? (
                conversationInfo.messageDetails
                  .filter((msg) => msg.type === 'MEDIA' && !msg.isRecalled ) // Lọc chỉ tin nhắn có type là "MEDIA"
                  .map((msg, index) => (
                    <div key={index} className="size-24 overflow-hidden rounded-lg">
                      {isVideo(msg.content) ? (
                        <video
                          src={msg.content}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={msg.content}
                          alt={`Media ${index}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openModal(msg.content)} // Mở modal khi nhấp
                        />
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500">Không có media để hiển thị.</p>
              )}
            </div>
          )}
        </div>
      </SectionBox>

      {/* Hiển thị danh sách file */}
      <SectionBox>
        <div className="flex flex-col gap-2">
          {/* Nút toggle hiển thị file */}
          <div
            onClick={() => setShowFiles(!showFiles)}
            className="w-full flex cursor-pointer"
          >
            <p
              style={{ margin: 0, fontWeight: 600 }}
              className="text-sm text-black hover:text-blue-800"
            >
              {showFiles ? 'Ẩn File' : 'Hiển thị File'}
            </p>
          </div>
          {/* Hiển thị danh sách file khi showFiles là true */}
          {showFiles && (
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {conversationInfo.messageDetails && conversationInfo.messageDetails.length > 0 ? (
                conversationInfo.messageDetails
                  .filter((msg) => msg.type === 'FILE' && !msg.isRecalled) // Lọc tin nhắn FILE
                  .map((msg, index) => (
                    <a
                      key={index}
                      href={msg.content}
                      download
                      className={styles.fileLink}
                      title={getFileName(msg.content)}
                    >
                      {getFileName(msg.content)}
                    </a>
                  ))
              ) : (
                <p className="text-sm text-gray-500">Không có file để hiển thị.</p>
              )}
            </div>
          )}
        </div>
      </SectionBox>


      {/* Modal phóng to ảnh */}
      {isModalOpen && (
        <div
          className={`${styles.modal} ${isModalOpen ? styles.modalOpen : styles.modalClose}`}
          onClick={closeModal} // Đóng modal khi nhấp vào nền
        >
          <div className={styles.modalContent}>
            <img
              src={selectedImage}
              alt="Zoomed media"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Đóng modal"
            >
              <span style={{ color: 'white', margin:4 }}>X</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightMoreConversation;