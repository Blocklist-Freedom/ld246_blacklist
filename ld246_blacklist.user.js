// ==UserScript==
// @name         屏蔽链滴用户
// @namespace    Violentmonkey Scripts
// @version      0.5
// @description  屏蔽指定链滴用户的帖子
// @author       zxkmm
// @author       frostime
// @author       TCOTC
// @homepage     https://github.com/zxkmm/ld246_blacklist
// @supportURL   https://github.com/zxkmm/ld246_blacklist/issues
// @match        https://ld246.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

/*notes
 * 头像区块 style class：article-list__user fn__flex fn__flex-center
 * 帖子作者div style class：avatar-small tooltipped__user
 * 帖子协作人 style class：avatar-small tooltipped__user article-list__participant      （！！！！！query不article-list__participant
 *
 * */

(function () {
  "use strict";

  const blockedUsersKey = "blockedUsers";
  let blockedUsers = GM_getValue(blockedUsersKey, []);

  // 创建用户界面
  const createUI = () => {
    const uiContainer = document.createElement("div");
    uiContainer.style.position = "fixed";
    uiContainer.style.bottom = "50px";
    uiContainer.style.right = "0px";
    uiContainer.style.backgroundColor = "white";
    uiContainer.style.padding = "10px";
    uiContainer.style.border = "1px solid #ccc";
    uiContainer.style.zIndex = "1000";
    uiContainer.style.display = "none"; // 初始隐藏

    // ui
    uiContainer.style.color = "white";
    uiContainer.style.backgroundColor = "grey";
    //uiend


    const toggleButton = document.createElement("button");
    toggleButton.textContent = "显示/隐藏黑名单管理";
    toggleButton.style.position = "fixed";
    toggleButton.style.bottom = "10px";
    toggleButton.style.right = "0px";
    toggleButton.style.height = "40px";
    toggleButton.style.zIndex = "1001";

    //ui
    toggleButton.style.color = "white";
    toggleButton.style.backgroundColor = "grey";
    //uiend
    
    toggleButton.addEventListener("click", () => {
      if (uiContainer.style.display === "none") {
        uiContainer.style.display = "block";
      } else {
        uiContainer.style.display = "none";
      }
    });

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "输入用户名";

    const addButton = document.createElement("button");
    addButton.textContent = "添加到黑名单";
    addButton.addEventListener("click", () => {
      const username = input.value.trim();
      if (username && !blockedUsers.includes(username)) {
        blockedUsers.push(username);
        GM_setValue(blockedUsersKey, blockedUsers);
        updateBlockedUsersList();
        input.value = "";
      }
    });

    const blockedUsersList = document.createElement("ul");
    const updateBlockedUsersList = () => {
      blockedUsersList.innerHTML = "";
      blockedUsers.forEach((user, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = user;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "删除";
        deleteButton.addEventListener("click", () => {
          blockedUsers.splice(index, 1);
          GM_setValue(blockedUsersKey, blockedUsers);
          updateBlockedUsersList();
        });

        listItem.appendChild(deleteButton);
        blockedUsersList.appendChild(listItem);
      });
    };

    uiContainer.appendChild(input);
    uiContainer.appendChild(addButton);
    uiContainer.appendChild(blockedUsersList);
    document.body.appendChild(uiContainer);
    document.body.appendChild(toggleButton);

    updateBlockedUsersList();
  };

  createUI();

  let attempts = 0;
  const intervalId = setInterval(() => {
    const posts = document.querySelectorAll(".article-list__item");
    posts.forEach((post) => {
      const authorName = post
        .querySelector(".article-list__user .tooltipped__user")
        .getAttribute("aria-name"); //fetch username

      if (blockedUsers.includes(authorName)) {
        //main worker
        // remind way
        // post.style.display = "none"; // hid
        // post.style.backgroundColor = "red"; // blk
        post.style.opacity = "0.1"; //opa
        let abs = post.querySelector('.article-list__abstract');
        if (abs) abs.style.display = 'none';
        // remind way over
      }
    });

    attempts++;
    if (attempts >= 10) {
      //TODO not hard coded
      clearInterval(intervalId);
    }
  }, 1000);
})();
