// ==UserScript==
// @name         Frick Superstar
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  解放双手
// @author       NIMAMA
// @match        *://mooc1-gray.chaoxing.com/mooc-ans/mycourse/studentstudy*
// @match        *://mooc1-gray.chaoxing.com/ananas/modules/video/index.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chaoxing.com
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const INTERVAL = 2000 + Math.random() * 3000
    const TIMEOUT = 1500
    if (window.location.href.includes("studentstudy")) {
        const ID_INNER_IFRAME = 'iframe'
        const SELECTOR_VIDEO_IFRAME = "iframe"
        const SELECTOR_STATUS = ".ans-job-icon"
        const CLASS_FINISHED = "ans-job-finished"
        const SELECTOR_NEXT = ".tabtags > div:nth-child(2)"
        const SELECTOR_TITLE = "#mainid > h1"
        const SELECTOR_POPUP_NEXT = ".prebutton"
        const REGEX_SKIP = /测试|测验|案例/
        const REGEX_VIDEO_CHILD_URL = /video/

        let urlCount = {}
        let emergencyStop = false
        let wait = 0

        console.log("parent: start!")

        let parentFunc = function () {
            console.log("parent: fkcx Loaded!")

            let mainFunc = function () {
                console.log("parent: run main loop!")

                if (emergencyStop) {
                    console.error("parent: ERROR: emergency stop!")
                    return
                }

                // if stay on the same page after switch for too many times
                if (urlCount[window.location.href] > 10) {
                    console.error("parent: ERROR: too many times on the same page!")
                    emergencyStop = true
                    return
                }

                let popupNextList = document.querySelectorAll(SELECTOR_POPUP_NEXT)
                console.log("parent: popupNextList is", popupNextList)
                let popupNext = popupNextList[0]
                if (popupNextList.length > 1) {
                    for (let i = 0; i < popupNextList.length; i++) {
                        if (popupNextList[i].style.display !== "none") {
                            popupNext = popupNextList[i]
                            break
                        }
                    }
                }

                console.log("parent: popup is", popupNext)

                if (!popupNext) {
                    console.error("parent: ERROR: popup not found! Might be detected!")
                    location.reload();
                }
                console.log("parent: popup display is", window.getComputedStyle(popupNext).display)

                if (window.getComputedStyle(popupNext).display !== "none") {
                    console.log("parent: popup is visible!")
                    setTimeout(() => {
                        let popupNext = document.querySelector(SELECTOR_POPUP_NEXT)
                        popupNext.click()
                        wait = 0
                    }, TIMEOUT)
                    return
                }

                if (wait-- > 0) {
                    return
                } else {
                    wait = 0
                }

                let title = document.querySelector(SELECTOR_TITLE)
                console.log("parent: title is", title)
                if (REGEX_SKIP.test(title.innerHTML)) {
                    urlCount[window.location.href] = urlCount[window.location.href] ? urlCount[window.location.href] + 1 : 1
                    console.log("parent: skip test!")
                    let nextElement = document.querySelector(SELECTOR_NEXT)
                    nextElement.click()
                    wait = 10
                    return
                }

                let innerDoc = document.getElementById(ID_INNER_IFRAME).contentDocument
                console.log("parent: innerDoc is", innerDoc)

                let videoIframes = innerDoc.querySelectorAll(SELECTOR_VIDEO_IFRAME)
                videoIframes = Array.prototype.map.call(videoIframes, e => e.contentWindow)
                console.log("parent: videoIframes is", videoIframes)

                let statusElements = innerDoc.querySelectorAll(SELECTOR_STATUS)
                console.log("parent: statusElements is", statusElements)

                console.assert(videoIframes.length == statusElements.length, "videoIframes.length != statusElements.length, got %o", [videoIframes.length, statusElements.length])
                statusElements = Array.prototype.map.call(statusElements, e => e.parentElement.classList.contains(CLASS_FINISHED))

                // do some filtering first
                let filtered = false
                for (let i = 0; i < videoIframes.length; i++) {
                    let videoIframeURL = videoIframes[i].document.location.href
                    if (!REGEX_VIDEO_CHILD_URL.test(videoIframeURL)) {
                        filtered = true
                        console.log("parent: filter out videoIframe", videoIframeURL)
                        videoIframes.splice(i, 1)
                        statusElements.splice(i, 1)
                        i--
                    }
                }
                console.log("parent: videoIframes after filtering is", videoIframes)
                console.log("parent: statusElements after filtering is", statusElements)

                let length = videoIframes.length
                console.log("parent: length is", length)

                if (!statusElements || !statusElements.includes(false)) {
                    urlCount[window.location.href] = urlCount[window.location.href] ? urlCount[window.location.href] + 1 : 1
                    console.log("parent: next chapter!")
                    let nextElement = document.querySelector(SELECTOR_NEXT)
                    console.log("parent: nextElement is", nextElement)
                    nextElement.click()
                    if (filtered) {
                        wait = 10
                        return
                    }
                } else {
                    if (length > 1) {
                        // play one at a time due to constraint
                        let isPlayed = false
                        // Assumes that the element is returned in the same order as the iframes
                        for (let i = 0; i < length; i++) {
                            if (!isPlayed && !statusElements[i]) {
                                isPlayed = true
                                videoIframes[i].postMessage("start")

                                // console.log(`Parent started video ${i}`)
                            } else {
                                videoIframes[i].postMessage("stop")

                                // console.log(`Parent stoped video ${i}`)
                            }
                        }
                    } else {
                        for (const innerWindow of videoIframes) {
                            innerWindow.postMessage("start")
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
            parentFunc()
        } else {
            window.addEventListener('load', parentFunc, false)
        }
    } else {
        const SELECTOR_VIDEO = "video"
        let urlChild = window.location.href

        console.log("child: start! URL is", urlChild)

        let childFunc = function () {
            console.log("child: fkcx Loaded!")

            let videoMoniterFunc = function () {
                let videoElement = document.querySelector(SELECTOR_VIDEO)
                urlChild = videoElement.src
                if (videoElement.paused) {
                    console.log("child: play video!")
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
                    console.log("child:", urlChild, "video playing stop!")
                    if (handle != -1) {
                        clearInterval(handle)
                    }
                } else if (data === 'keep-alive') {
                    window.top.postMessage('ok')
                } else if (data === 'start') {
                    console.log("child:", urlChild, " video playing start!")
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
