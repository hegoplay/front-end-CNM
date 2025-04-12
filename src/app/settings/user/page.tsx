"use client";

import React, { useEffect, useLayoutEffect } from "react";
import css from "./UserPageConfig.module.css";
// import UserInfoBox from '@/components/chatContent/search/userInfoBox'
import UserInfoForm from "@/components/chatContent/search/userInfoForm";
import UserConfig from "@/components/settings/UserConfig";
import { useUser } from "@/context/UserContext";
import { Flex, Spin } from "antd";

const UserSetupPage: React.FC = () => {
  const { userInfo } = useUser();

  // define a function to handle the user info

  useEffect(() => {
    console.log(userInfo);
  }, [userInfo]);


  return (
    <>
      <div id={css.mainContent}>
        {!userInfo ? <p>Wating...</p> : <UserConfig {...userInfo} />}
      </div>
    </>
  );
};

export default UserSetupPage;
