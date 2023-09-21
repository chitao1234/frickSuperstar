// ==UserScript==
// @name         Frick Superstar
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  刷课!
// @author       NIMAMA
// @match        *://mooc1.chaoxing.com/mycourse/studentstudy*
// @match        *://mooc1.chaoxing.com/ananas/modules/video/index.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chaoxing.com
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const INTERVAL = 2000 + Math.random() * 3000
    const TIMEOUT = 1500
    if (window.location.href.includes("studentstudy")) {
        const INNER_IFRAME_ID = 'iframe'
        // const VIDEO_IFRAME_SELECTOR = "#ext-gen1050 > iframe"
        const VIDEO_IFRAME_SELECTOR = "iframe"
        const STATUS_SELECTOR = "#ext-gen1051"
        const STATUS_SELECTOR_SECONDARY = ".ans-job-icon"
        // const STATUS_FINISHED = "任务点已完成"
        const CLASS_FINISHED = "ans-job-finished"
        //const STATUS_UNFINISHED = "任务点未完成"
        const NEXT_SELECTOR = "#prevNextFocusNext"
        const TITLE_SELECTOR = "#mainid > div.prev_title_pos > div"
        const POPUP_NEXT_SELECTOR = "#mainid > div.maskDiv.jobFinishTip.maskFadeOut > div > div.popBottom > a.nextChapter"
        const REGEX_SKIP = /测试|测验|案例/

        console.log("Father start!")

        let fatherFunc = function () {
            console.log("Father fkcx Loaded!")

            let mainFunc = function () {
                let title = document.querySelector(TITLE_SELECTOR)
                if (REGEX_SKIP.test(title.innerHTML)) {
                    console.log("Skip test!")
                    let nextElement = document.querySelector(NEXT_SELECTOR)
                    nextElement.click()
                    setTimeout(() => {
                        let popupNext = document.querySelector(POPUP_NEXT_SELECTOR)
                        popupNext.click()
                    }, TIMEOUT)
                }

                let innerDoc = document.getElementById(INNER_IFRAME_ID).contentDocument

                let videoIframes = innerDoc.querySelectorAll(VIDEO_IFRAME_SELECTOR)
                videoIframes = Array.prototype.map.call(videoIframes, e => e.contentWindow)
                let length = videoIframes.length
                if (length == 1) {
                    for (const innerWindow of videoIframes) {
                        innerWindow.postMessage("start")
                    }
                } // 2 or more iframes situation is processed is the next part

                let statusElements = innerDoc.querySelectorAll(STATUS_SELECTOR)
                if (!statusElements.length) {
                    statusElements = innerDoc.querySelectorAll(STATUS_SELECTOR_SECONDARY)
                }
                console.assert(length == statusElements.length, "length != statusElements.length, got %o", [length, statusElements.length])
                statusElements = Array.prototype.map.call(statusElements, e => e.parentElement.classList.contains(CLASS_FINISHED))

                if (!statusElements || !statusElements.includes(false)) {
                    console.log("Next chapter!")
                    let nextElement = document.querySelector(NEXT_SELECTOR)
                    nextElement.click()
                } else {
                    if (length > 1) {
                        let isPlayed = false
                        // Assumes that the element is returned in the same order as the iframes
                        for (let i = 0; i < length; i++) {
                            if (!isPlayed && !statusElements[i]) {
                                isPlayed = true
                                videoIframes[i].postMessage("start")

                                // console.log(`Father started video ${i}`)
                            } else {
                                videoIframes[i].postMessage("stop")

                                // console.log(`Father stoped video ${i}`)
                            }
                        }
                    }
                }
            }
            setInterval(mainFunc, INTERVAL)

            window.addEventListener('message', e => {
                let data = e.data
                if (data === 'ok') {
                    // TODO: finish keep-alive mechanism
                }
            })
        }

        if (document.readyState === "complete") {
            fatherFunc()
        } else {
            window.addEventListener('load', fatherFunc, false)
        }
    } else {
        const VIDEO_SELECTOR = "video"

        console.log("Child start!")

        let childFunc = function () {
            console.log("Child fkcx Loaded!")

            let videoMoniterFunc = function () {
                let videoElement = document.querySelector(VIDEO_SELECTOR)
                if (videoElement.paused) {
                    console.log("Play video!")
                    videoElement.muted = true
                    if (videoElement.playbackRate != 2) {
                        videoElement.playbackRate = 2
                    }
                    videoElement.play()
                }
            }

            let handle = -1

            window.addEventListener('message', e => {
                let data = e.data
                if (data === 'stop') {
                    console.log("Video playing stop!")
                    if (handle != -1) {
                        clearInterval(handle)
                    }
                } else if (data === 'keep-alive') {
                    window.top.postMessage('ok')
                } else if (data === 'start') {
                    console.log("Video playing start!")
                    handle = setInterval(videoMoniterFunc, INTERVAL)
                }
            })
        }
        if (document.readyState === "complete") {
            childFunc()
        } else {
            window.addEventListener('load', childFunc, false)
        }
    }
})();