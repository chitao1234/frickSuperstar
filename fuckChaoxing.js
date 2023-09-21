// ==UserScript==
// @name         fuck cx
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  try to fkcx!
// @author       NIMAMA
// @include        https://mooc1.chaoxing.com/mycourse/studentstudy*
// @include        https://mooc1.chaoxing.com/ananas/modules/video/index.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chaoxing.com
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const INTERVAL = 2000 + Math.random() * 3000
    const TIMEOUT = 1500
    if (window.location.href.includes("studentstudy")) {
        console.log("Father start!")
        const IFRAME_ID = 'iframe'
        const VIDEO_IFRAME_SELECTOR = "#ext-gen1049 > iframe"
        const STATUS_SELECTOR = "#ext-gen1051"
        const STATUS_SELECTOR_SECONDARY = ".ans-job-icon"
        const STATUS_FINISHED = "任务点已完成"
        const STATUS_UNFINISHED = "任务点未完成"
        const NEXT_SELECTOR = "#prevNextFocusNext"
        const TITLE_SELECTOR = "#mainid > div.prev_title_pos > div"
        const POPUP_NEXT_SELECTOR = "#mainid > div.maskDiv.jobFinishTip.maskFadeOut > div > div.popBottom > a.nextChapter"
        let fatherFunc = function () {
            console.log("fkcx Loaded!")
            // let title = document.querySelector(TITLE_SELECTOR)
            // if (title.innerHTML.includes("测试") || title.innerHTML.includes("测验")) {
            //     console.log("Skip test!")
            //     setInterval(() => {
            //         let title = document.querySelector(TITLE_SELECTOR)
            //         if (title.innerHTML.includes("测试") || title.innerHTML.includes("测验")) {
            //             let nextElement = document.querySelector(NEXT_SELECTOR)
            //             nextElement.click()
            //             setTimeout(() => {
            //                 let popupNext = document.querySelector(POPUP_NEXT_SELECTOR)
            //                 popupNext.click()
            //             }, TIMEOUT)
            //         }
            //     }, INTERVAL);
            // }
            setInterval(() => {
                let title = document.querySelector(TITLE_SELECTOR)
                if (title.innerHTML.includes("测试") || title.innerHTML.includes("测验")) {
                    console.log("Skip test!")
                    let nextElement = document.querySelector(NEXT_SELECTOR)
                    nextElement.click()
                    setTimeout(() => {
                        let popupNext = document.querySelector(POPUP_NEXT_SELECTOR)
                        popupNext.click()
                    }, TIMEOUT)
                }
                let innerDoc = document.getElementById(IFRAME_ID).contentDocument
                let statusElement = innerDoc.querySelectorAll(STATUS_SELECTOR) || innerDoc.querySelectorAll(STATUS_SELECTOR_SECONDARY)
                statusElement = Array.prototype.map.call(statusElement, e=>e.getAttribute('aria-label'))
                if (!statusElement || !statusElement.includes(STATUS_UNFINISHED)) {
                    console.log("Next chapter!")
                    let nextElement = document.querySelector(NEXT_SELECTOR)
                    nextElement.click()
                } else {
                    // console.debug("Unfinished:", statusElement.getAttribute('aria-label'));
                }
            }, INTERVAL);
        }

        if (document.readyState === "complete") {
            fatherFunc()
        } else {
            window.addEventListener('load', fatherFunc, false)
        }
    } else {
        console.log("Child start!")
        const VIDEO_SELECTOR = "video"
        let childFunc = function () {
            console.log("child fkcx Loaded!")
            setInterval(() => {
                let videoElement = document.querySelector(VIDEO_SELECTOR)
                if (videoElement.paused) {
                    console.log("Play video!")
                    videoElement.muted = true
                    if (videoElement.playbackRate != 2) {
                        videoElement.playbackRate = 2
                    }
                    videoElement.play()
                }
            }, INTERVAL)
        }
        if (document.readyState === "complete") {
            childFunc()
        } else {
            window.addEventListener('load', childFunc, false)
        }
    }
})();