// ==UserScript==
// @name         屏蔽链滴用户
// @namespace    Violentmonkey Scripts
// @version      0.1.3
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
     * html ref
     * <div class="fn__flex-1">
                        <div class="article__sideuser">
                            <a href="https://ld246.com/member/zxkmm">zxkmm</a>
                                <span class="fn__space5"></span>
                                <a href="https://ld246.com/one-time-pay/siyuan" target="_blank" class="tooltipped tooltipped__ne" aria-label="付费者"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" style="color:#c0c0c0">     <path d="M2.288 12.643l23.487 12.853c0.286 0.153 0.477 0.45 0.477 0.791 0 0.082-0.011 0.161-0.032 0.237l0.001-0.006c-0.119 0.395-0.479 0.678-0.905 0.678-0.004 0-0.009 0-0.013 0h-19.439c-0.958 0-1.766-0.684-1.885-1.595l-1.691-12.956z"></path>     <path d="M29.676 12.643l-1.691 12.957c-0.119 0.911-0.927 1.594-1.884 1.594h-19.442c-0.004 0-0.009 0-0.013 0-0.425 0-0.785-0.281-0.903-0.668l-0.002-0.007c-0.019-0.070-0.031-0.15-0.031-0.232 0-0.341 0.191-0.638 0.472-0.788l0.005-0.002 23.487-12.853z"></path>     <path d="M15.413 8.369l10.394 15.921c0.378 0.579 0.407 1.317 0.076 1.924-0.328 0.591-0.948 0.985-1.66 0.985 0 0-0.001 0-0.001 0h-17.617c-0.694 0-1.331-0.378-1.661-0.985-0.144-0.26-0.229-0.569-0.229-0.899 0-0.382 0.114-0.736 0.31-1.033l-0.004 0.007 10.394-15.921z"></path>     <path d="M15.396 8.403l11.659 15.921c0.401 0.579 0.432 1.317 0.081 1.924-0.361 0.594-1.005 0.985-1.741 0.985-0.008 0-0.017 0-0.025 0h-9.344l-0.63-18.83z"></path>     <path d="M13.868 6.478c0 0.946 0.767 1.712 1.712 1.712s1.712-0.767 1.712-1.712v0c0-0.945-0.766-1.712-1.712-1.712s-1.712 0.766-1.712 1.712v0zM28.577 10.818c0 0.945 0.766 1.712 1.712 1.712s1.712-0.766 1.712-1.712v0c0-0.945-0.766-1.712-1.712-1.712s-1.712 0.766-1.712 1.712v0zM0 10.822c0 0.945 0.766 1.712 1.712 1.712s1.712-0.766 1.712-1.712v0c0-0.945-0.766-1.712-1.712-1.712s-1.712 0.766-1.712 1.712v0z"></path> </svg></a>
                                <span class="fn__space5"></span>
                                <a href="https://ld246.com/sponsor" target="_blank" class="tooltipped tooltipped__ne" aria-label="支持者"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#ea4aaa" d="M16 30.685l-2.329-2.103q-3.981-3.606-5.784-5.333t-4.019-4.282-3.042-4.62-0.826-4.244q0-3.681 2.516-6.235t6.272-2.554q4.357 0 7.211 3.38 2.854-3.38 7.211-3.38 3.756 0 6.272 2.554t2.516 6.235q0 2.93-1.953 6.084t-4.244 5.484-7.474 6.986z"></path></svg></a>
                                <span class="fn__space5"></span>
                                <a href="https://ld246.com/sponsor" target="_blank" class="tooltipped tooltipped__ne" aria-label="捐赠者"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"> <path fill="#ea4aaa" d="M16.15 26.254q3.606-3.23 5.333-4.883t3.756-3.906 2.817-3.981 0.789-3.38q0-2.404-1.615-3.981t-4.019-1.577q-1.878 0-3.493 1.052t-2.216 2.704h-3.005q-0.601-1.653-2.216-2.704t-3.493-1.052q-2.404 0-4.019 1.577t-1.615 3.981q0 1.653 0.789 3.38t2.817 3.981 3.756 3.906 5.333 4.883l0.15 0.15zM23.211 1.315q3.756 0 6.272 2.554t2.516 6.235q0 2.178-0.826 4.244t-3.042 4.62-4.019 4.282-5.784 5.333l-2.329 2.103-2.329-2.028q-5.183-4.657-7.474-6.986t-4.244-5.484-1.953-6.085q0-3.681 2.516-6.235t6.272-2.554q4.357 0 7.211 3.38 2.854-3.38 7.211-3.38z"></path> </svg></a>
                        </div>
                        <div class="ft__fade ft__smaller">
                        </div>
                    </div>
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
