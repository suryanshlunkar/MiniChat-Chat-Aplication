import React, { useState, useContext } from "react";
import ChatContext from "../Context/chat-context";
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';
import SideDrawer from '../components/miscellaneous/SideDrawer';
import { Box } from '@chakra-ui/react';

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = useContext(ChatContext);

  return (
    <div style={{ width: "100%", backgroundColor: "white", color: "black" }}>
      {user && <SideDrawer />}
      <Box d="flex" justifyContent="space-between" width="100%" height="90.5vh" padding="12px">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Box>
    </div>
  );
};

export default ChatPage;
