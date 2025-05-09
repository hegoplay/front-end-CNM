import AvatarImg from "@/components/AvatarImg";
import { Reaction } from "@/types/chat";
import { MessageReactionDto, UserReactionInfo } from "@/types/user";
import { BasicResponse } from "@/types/utils";
import { Modal } from "antd";
import React, { use, useEffect } from "react";

interface ReactionMessageComponentProps {
  reactions: Reaction[];
  messageId: string;
}

const ReactionMessageComponent: React.FC<ReactionMessageComponentProps> = ({
  reactions,
  messageId,
}) => {
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] =
    React.useState(false);
  const [messageReactionDto, setMessageReactionDto] = React.useState<
    MessageReactionDto | undefined
  >(undefined);
  const [currentEmoji, setCurrentEmoji] = React.useState<string | null>(null);
  let currentUserReactions : UserReactionInfo[] = [];

  if (!!messageReactionDto) {
    currentUserReactions = currentEmoji 
    ? messageReactionDto.reactions[currentEmoji] || []
    : [];
  }
  
  const reactionCounts = reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = reaction.users.length; // Đếm số users trong reaction.users
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    const fetchMessageReaction = async () => {
      try {
        const response = await fetch(`/api/messages/${messageId}/reaction/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = (await response.json()) as BasicResponse;
        console.log("Message reaction data: ", data);
        if (data.success) {
          setMessageReactionDto(data.data);
          const reactionCounts =  data.data.reactionCounts as Record<string, number>
          const [firstEmoji, firstCount] = Object.entries(reactionCounts)[0] || [];
          setCurrentEmoji(firstEmoji);
        } else {
          console.error("Error fetching message reaction:", data.message);
        }
      } catch (error) {
        console.error("Error fetching message reaction:", error);
      }
    };

    if (isReactionPopoverOpen) {
      fetchMessageReaction();
    }
    console.log("testing useEffect");
  }, [isReactionPopoverOpen]);

  return (
    <>
      <div
        className="flex gap-2 mt-1 cursor-pointer"
        onClick={() => setIsReactionPopoverOpen(true)}
      >
        {Object.entries(reactionCounts || {}).map(([emoji, count]) => (
          <span key={emoji} className="text-sm flex items-center ">
            {emoji} {count > 1 ? count : ""}
          </span>
        ))}
      </div>
      <Modal
        title="Biểu cảm"
        open={isReactionPopoverOpen}
        onCancel={() => setIsReactionPopoverOpen(false)}
        onOk={() => setIsReactionPopoverOpen(false)}
        footer={null}
        width={500}
        centered
      >
        {!messageReactionDto ? (
          <p>Loading...</p>
        ) : (
          <div className="h-100 flex">
            <div className="flex flex-1 flex-col bg-gray-100">
              {Object.entries(messageReactionDto.reactionCounts).map(
                ([emoji, count]) => (
                  <div 
                    key={emoji} 
                    className={`flex justify-between items-center px-3 py-1 cursor-pointer ${currentEmoji === emoji ? "bg-blue-200" : ""}`}
                    onClick={() => {
                      setCurrentEmoji(emoji);
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm">{count}</span>
                  </div>
                )
              )}
            </div>
            <div className="flex flex-2 flex-col">
            {currentUserReactions.map((reaction)=> (
              <div key={reaction.user.phoneNumber} className="flex items-center gap-2 p-2 ">
                <img src={reaction.user.baseImg} style={{width: 36, height: 36}}/>
                <span className="flex-1">{reaction.user.name}</span>
                <span className="text-sm">{reaction.count}</span>
              </div>
            ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReactionMessageComponent;
