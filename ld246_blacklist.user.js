// ==UserScript==
// @name         屏蔽链滴用户
// @namespace    Violentmonkey Scripts
// @version      0.1.4
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
// @grant        GM_addStyle
// ==/UserScript==

/*notes
 * 头像区块 style class：article-list__user fn__flex fn__flex-center
 * 帖子作者div style class：avatar-small tooltipped__user
 * 帖子协作人 style class：avatar-small tooltipped__user article-list__participant      （！！！！！query不article-list__participant
 *
 *
 * */

(function () {
  "use strict";

  const blockedUsersKey = "blockedUsers";
  const remindWayKey = "remindWay";
  let blockedUsers = GM_getValue(blockedUsersKey, []);
  let remindWay = GM_getValue(remindWayKey, "opacity"); // init var aka default as opa

  //public shame list
  const publicShameUser = [];
  // const publicShameUser = ["science"];
  //public shame end
  //Main style
  const customStyle = `
  .block-it.block-it__hide {
    display: none;
  }

  .block-it.block-it__opacity {
    opacity: 0.1;
  }
  .block-it.block-it__opacity .article-list__abstract {
    display: none;
  }

  .block-it.block-it__blur {
    filter: blur(5px);
  }
  .block-it.block-it__blur:hover {
    filter: none;
  }

  .block-it .article-list__panel {
    padding: 5px 15px;
  }
  .block-it .article-list__title--view, .block-it .article-list__title>a {
    font-size: 14px;
  }
  .block-it .article-list__abstract {
    font-size: 12px;
  }
  .block-it .tooltipped__user {
    height: 12px;
    width: 12px;
  }
  .blocked-users-list {
    max-height: 400px;
    overflow-y: auto;
    mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
  }
  `;
  GM_addStyle(customStyle);

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

    uiContainer.style.color = "white";
    uiContainer.style.backgroundColor = "grey";

    uiContainer.style.display = "none";

    const toggleButton = document.createElement("button");
    toggleButton.textContent = "黑名单管理";
    toggleButton.style.position = "fixed";
    toggleButton.style.bottom = "10px";
    toggleButton.style.right = "0px";
    toggleButton.style.height = "40px";
    toggleButton.style.zIndex = "1001";

    toggleButton.style.color = "white";
    toggleButton.style.backgroundColor = "grey";

    toggleButton.addEventListener("click", () => {
      if (uiContainer.style.display === "none") {
        uiContainer.style.display = "block";
      } else {
        uiContainer.style.display = "none";
      }
    });

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "留空自动加当前人";
    input.style.marginRight = "10px";

    const addButton = document.createElement("button");
    addButton.textContent = "添加到黑名单";
    addButton.style.marginRight = "10px";
    addButton.addEventListener("click", () => {
      var username = input.value.trim();
      if (!username) {
        username = autoFetchUsername();
      }
      if (username && !blockedUsers.includes(username)) {
        blockedUsers.push(username);
        GM_setValue(blockedUsersKey, blockedUsers);
        updateBlockedUsersList();
        input.value = "";
      }
    });

    const blockedUsersList = document.createElement("ul");
    blockedUsersList.style.marginTop = "10px";
    blockedUsersList.style.marginBottom = "10px";
    blockedUsersList.style.paddingLeft = "20px";
    blockedUsersList.classList.add("blocked-users-list");

    const updateBlockedUsersList = () => {
      blockedUsersList.innerHTML = "";

      // 显示 publicShameUser
      publicShameUser.forEach((user) => {
        const listItem = document.createElement("li");
        listItem.textContent = user;
        const textBox = document.createElement("span");
        textBox.textContent = " （ 这位是🤡，无法删除）";
        listItem.appendChild(textBox);
        blockedUsersList.appendChild(listItem);
        listItem.style.marginBottom = "5px";
      });

      // 显示 blockedUsers
      blockedUsers.forEach((user, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = user;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "删除";
        deleteButton.style.marginLeft = "10px";
        deleteButton.addEventListener("click", () => {
          blockedUsers.splice(index, 1);
          GM_setValue(blockedUsersKey, blockedUsers);
          updateBlockedUsersList();
        });

        listItem.appendChild(deleteButton);
        blockedUsersList.appendChild(listItem);
        listItem.style.marginBottom = "5px";
      });
    };

    const remindWaySelect = document.createElement("select");
    remindWaySelect.style.marginLeft = "10px";
    const remindWays = [
      { value: "hide", text: "隐藏" },
      { value: "blur", text: "模糊(悬浮时取消)" },
      { value: "opacity", text: "白雾" },
    ];
    remindWays.forEach((way) => {
      const option = document.createElement("option");
      option.value = way.value;
      option.text = way.text;
      if (way.value === remindWay) {
        option.selected = true;
      }
      remindWaySelect.appendChild(option);
    });

    remindWaySelect.addEventListener("change", () => {
      remindWay = remindWaySelect.value;
      GM_setValue(remindWayKey, remindWay);
    });

    const label = document.createElement("label");
    label.textContent = "标记帖子方式: ";
    label.appendChild(remindWaySelect);

    uiContainer.appendChild(input);
    uiContainer.appendChild(addButton);
    uiContainer.appendChild(label);
    uiContainer.appendChild(blockedUsersList);
    document.body.appendChild(uiContainer);
    document.body.appendChild(toggleButton);

    updateBlockedUsersList();
  };

  createUI();

  const autoFetchUsername = () => {
    /**
     * notes

     *
     *
     * style class  `article__sideuser`
     * string elem `a`
     *
     */
    const sideuserElement = document.querySelector(".article__sideuser");

    if (sideuserElement) {
      const linkElement = sideuserElement.querySelector("a");

      if (linkElement) {
        const username = linkElement.textContent.trim();

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "50%";
        overlay.style.left = "50%";
        overlay.style.backgroundColor = "rgba(0, 0, 0)";
        overlay.style.color = "white";
        overlay.style.padding = "10px";
        overlay.style.borderRadius = "5px";
        overlay.style.zIndex = "9999";
        overlay.style.fontSize = "32px";
        overlay.style.textAlign = "center";
        overlay.textContent = `自动获取到这位用户: ${username}，请核实，已添加`;

        document.body.appendChild(overlay);

        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 1000);

        //^ overlay

        return username;
      }
    }

    return null;
  };

  const blockPosts = () => {
    const posts = document.querySelectorAll(".article-list__item");
    // console.log(!posts);
    if (!posts) return;
    posts.forEach((post) => {
      const authorElement = post.querySelector(
        ".article-list__user .tooltipped__user",
      );
      if (!authorElement) return;

      const authorName = authorElement.getAttribute("aria-name"); //fetch username
      if (!authorName) return;

      if (
        blockedUsers.includes(authorName) ||
        publicShameUser.includes(authorName)
      ) {
        post.classList.toggle("block-it", true);
        switch (remindWay) {
          case "hide":
            post.classList.toggle("block-it__hide", true);
            break;
          case "blur":
            post.classList.toggle("block-it__blur", true);
            /*
            post.style.filter = "blur(5px)";
            post.addEventListener("mouseenter", () => {
              post.style.filter = "none";
            });
            post.addEventListener("mouseleave", () => {
              post.style.filter = "blur(5px)";
            });*/
            break;
          case "opacity":
            post.classList.toggle("block-it__opacity", true);
        }
      }
    });
  };

  // 使用 MutationObserver 监听页面变化
  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        blockPosts();
        // console.log("------blocked------");
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // 初始执行一次
  blockPosts();
})();
