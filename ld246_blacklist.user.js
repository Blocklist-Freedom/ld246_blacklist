// ==UserScript==
// @name         屏蔽指定用户帖子
// @namespace    Violentmonkey Scripts
// @version      0.1
// @description
// @author       zxkmm
// @match        https://ld246.com/*
// @grant        none
// ==/UserScript==

/*notes
 * 头像区块 style class：article-list__user fn__flex fn__flex-center
 * 帖子作者div style class：avatar-small tooltipped__user
 * 帖子协作人 style class：avatar-small tooltipped__user article-list__participant      （！！！！！query不article-list__participant
 *
 * */

(function () {
  "use strict";

  const blockedUsers = ["science", "和其他用户。。。。。"];

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
