import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Volleyer",
};

const MessagesPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <p className="text-gray-600">This is the messages page.</p>
    </div>
  );
};

export default MessagesPage;
