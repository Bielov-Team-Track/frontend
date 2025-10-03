import { Avatar, Button } from "@/components/ui";
import { Comment } from "@/lib/models/Comment";
import { getFormattedDate } from "@/lib/utils/date";
import {
  FaTrash as DeleteIcon,
  FaEdit as EditIcon,
  FaReply,
  FaSmileWink,
} from "react-icons/fa";

type CommentItemProps = {
  comment: Comment;
};

const CommentItem = ({ comment }: CommentItemProps) => {
  // TODO: Implement edit and delete functionality
  const handleEdit = () => {
    // Implement edit functionality here
  };

  const handleDelete = () => {
    // Implement delete functionality here
  };

  return (
    comment &&
    comment.user && (
      <div>
        <div className="bg-stone-900/60 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-4">
              <Avatar profile={comment.user} />
              <div className="flex gap-4 items-center">
                <span>
                  {comment.user.name} {comment.user.surname}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="icon"
                    size="sm"
                    color="secondary"
                    className="!px-0 !py-0"
                    leftIcon={<EditIcon></EditIcon>}
                    onClick={handleEdit}
                  />
                  <Button
                    variant="icon"
                    size="sm"
                    color="accent"
                    className="!px-0 !py-0"
                    leftIcon={<DeleteIcon></DeleteIcon>}
                    onClick={handleDelete}
                  />
                </div>
              </div>
            </div>
            <div className="text-sm text-neutral/40">
              {getFormattedDate(comment.createdAt)}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-neutral/40">
              {comment.updatedAt && comment.updatedAt !== comment.createdAt
                ? " (edited)"
                : ""}
            </span>

            <p>{comment.content}</p>
          </div>
        </div>
        <div>
          <Button
            color="neutral"
            leftIcon={<FaSmileWink />}
            size="sm"
            variant="icon"
          ></Button>
          <Button
            color="neutral"
            variant="ghost"
            size="sm"
            leftIcon={<FaReply />}
          >
            reply
          </Button>
        </div>
      </div>
    )
  );
};

export default CommentItem;
