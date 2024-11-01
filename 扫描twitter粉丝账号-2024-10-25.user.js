// ==UserScript==
// @name         扫描twitter粉丝账号
// @namespace    https://x.com/intent/follow?screen_name=wowgogoing
// @version      2024-10-25
// @description  扫描follow页和评论页面的twitter账号，自动生成列表，并支持下载为csv。【免责声明】此脚本仅用于学习交流，请勿将其用于任何的违法用途。由此产生的争端及法律责任由使用者自行承担。
// @author       wowgogoing
// @match        http://x.com/*
// @match        http://www.x.com/*
// @match        https://x.com/*
// @match        https://www.x.com/*
// @icon         https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png
// @grant        unsafeWindow
// @homepage     https://github.com/keepchen/scan-twitter-followers
// ==/UserScript==

const isTwitterUrl = () => {
    let hostname = window.location.hostname
    return ['x.com', 'www.x.com'].includes(hostname)
}

const checkFollowersUrl = () => {
    let url = window.location.href
    return isTwitterUrl() && (url.endsWith('/followers') || url.endsWith('/verified_followers'))
}

const checkCommentUrl = () => {
    let url = window.location.href, paths = url.replace('https://', '').split('/')
    if (!isTwitterUrl() || paths.length !== 4) {
        return false
    }
    let commentId = paths.pop(), statusPath = paths.pop()
    if (!/^\d{15,20}$/.test(commentId) || statusPath !== 'status') {
        return false
    }
    return true
}

const checkEngagmentUrl = () => {
    let url = window.location.href, paths = url.replace('https://', '').split('/')
    if (!isTwitterUrl() || paths.length !== 5) {
        return false
    }
    let pathname = paths.pop(), commentId = paths.pop()
    if (!/^\d{15,20}$/.test(commentId) || !['quotes', 'retweets', 'likes'].includes(pathname)) {
        return false
    }
    return true
}

const renderEngagementOptButton = () => {
  let button = document.createElement('button')
    button.setAttribute('id', 'achieve-engagement-btn')
    button.setAttribute('type', 'button')
    button.style.cssText = 'position: fixed;top: 60%;right:10px;z-index:99999999;width: 200px;height:50px;color:#fff;background-color:#03c068;font-size:16px;border-radius:6px;border:none;cursor:pointer;text-align: center;'
    button.innerText = '提取engagement名单'
    button.onclick = function() {
        console.log('点击了提取')
        if (!checkEngagmentUrl()) {
            alert('提示：你当前没有在用户的engagement列表页面，操作取消')
            return
        }
        queryDom()
    }
    if (!isTwitterUrl()) {
        return false
    }
    document.body.appendChild(button)
}

const renderCommentOptButton = () => {
  let button = document.createElement('button')
    button.setAttribute('id', 'achieve-comments-btn')
    button.setAttribute('type', 'button')
    button.style.cssText = 'position: fixed;top: 50%;right:10px;z-index:99999999;width: 200px;height:50px;color:#fff;background-color:#1d9bf0;font-size:16px;border-radius:6px;border:none;cursor:pointer;text-align: center;'
    button.innerText = '提取评论名单'
    button.onclick = function() {
        console.log('点击了提取')
        if (!checkCommentUrl()) {
            alert('提示：你当前没有在用户的评论列表页面，操作取消')
            return
        }
        queryDom()
    }
    if (!isTwitterUrl()) {
        return false
    }
    document.body.appendChild(button)
}

const renderFollowerOptButton = () => {
  let button = document.createElement('button')
    button.setAttribute('id', 'achieve-followers-btn')
    button.setAttribute('type', 'button')
    button.style.cssText = 'position: fixed;top: 40%;right:10px;z-index:99999999;width: 200px;height:50px;color:#fff;background-color:#056b00;font-size:16px;border-radius:6px;border:none;cursor:pointer;text-align: center;'
    button.innerText = '提取粉丝名单'
    button.onclick = function() {
        console.log('点击了提取')
        if (!checkFollowersUrl()) {
            alert('提示：你当前没有在用户的粉丝列表页面，操作取消')
            return
        }
        queryDom()
    }
    if (!isTwitterUrl()) {
        return false
    }
    document.body.appendChild(button)
}

(function() {
    'use strict';
     console.log("【扫描twitter粉丝账号脚本注册成功】\n%c【免责声明】此脚本仅用于学习交流，请勿将其用于任何的违法用途。由此产生的争端及法律责任由使用者自行承担。", 'background-color: #000;color:#ff0000;font-size:18px;')
    // Your code here...
    renderCommentOptButton()
    renderFollowerOptButton()
    renderEngagementOptButton()
})();

const reportMyselfTwitterAccount = () => {
    if (window.location.href.endsWith('/verified_followers')) {
        return window.location.href.replace('https://x.com/', '').replace('/verified_followers', '')
    }
    return window.location.href.replace('https://x.com/', '').replace('/followers', '')
}

const queryDom = () => {
    let classname = prompt('请输入查询的类名称字符串，留空则使用默认类名称'), myselfAccount = reportMyselfTwitterAccount()
    if (classname === null) {
        console.log('用户取消了操作')
        return
    }
    if (classname.length === 0) {
        console.log('用户没有输入查询类名字符串，使用默认字符串: %ccss-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3', 'color:#ff0000')
        classname = 'css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3'
    } else {
        console.log(`使用用户输入的查询类名字符串: %c${classname}`, 'color:#ff0000')
    }
    renderTableBox(classname, myselfAccount)
}

let searchInterval = null

const renderTableBox = (classname, myselfAccount) => {
    let oldBox = document.getElementById('achieve-result-__box')
    if (oldBox) {
        document.body.removeChild(oldBox)
        if (searchInterval) clearInterval(searchInterval)
    }
    let followers = [], content = [], uniqueAccountList = []
    let box = document.createElement('div'), spanDom = document.createElement('span'), preDom = document.createElement('pre'), closeButton = document.createElement('button'), downloadButton = document.createElement('button')
    spanDom.style.cssText = 'width:100%;height:40px;background-color:#056b00;color:#fff;font-size:14px;text-align:center;display:inline-block;line-height:40px;'
    spanDom.innerText = '正在读取，你随时可以点击【下载csv】按钮进行下载保存'
    preDom.style.cssText = 'width: 96%;height: 540px;text-align: left;resize: none;overflow-y: scroll;background-color:#fff; padding: 8px;margin:0;border:none;'
    //preDom.innerHTML = content.join("<br/>")
    closeButton.setAttribute('id', 'achieve-followers-btn')
    closeButton.setAttribute('type', 'button')
    closeButton.style.cssText = 'width: 80px;height:40px;margin-top:4px;color:#fff;background-color:#056b00;font-size:16px;border-radius:6px;border:none;cursor:pointer;text-align: center;'
    closeButton.innerText = '关闭'
    closeButton.onclick = function() {
        clearInterval(searchInterval)
        this.parentElement.remove()
    }
    downloadButton.setAttribute('id', 'download-followers-btn')
    downloadButton.setAttribute('type', 'button')
    downloadButton.style.cssText = 'margin-left: 6px;width: 80px;height:40px;margin-top:4px;color:#fff;background-color:#056b00;font-size:16px;border-radius:6px;border:none;cursor:pointer;text-align: center;'
    downloadButton.innerText = '下载csv'
    downloadButton.onclick = function() {
        const BOM = "\uFEFF"
        const csvData = content.join("\n")
        const blobData = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8;' })
        const downloadUrl = URL.createObjectURL(blobData)
        const link = document.createElement('a')
        link.setAttribute('href', downloadUrl)
        const paths = window.location.href.replace('https://x.com/', '').split('/')
        const commentPath = checkCommentUrl() ? '_comments' : ''
        link.setAttribute('download', `${paths[0]}${commentPath}_${new Date().toLocaleString().replaceAll('/', '_').replace(' ', '_')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(downloadUrl)
    }
    box.appendChild(spanDom)
    box.appendChild(preDom)
    box.appendChild(closeButton)
    box.appendChild(downloadButton)
    box.setAttribute('id', 'achieve-result-__box')
    box.style.cssText = 'position:fixed;top:10px;left:10px;width: 400px;height: 650px;background-color:#ececec;text-align: center'
    document.body.appendChild(box)
    searchInterval = setInterval(() => {
        let eles = document.querySelectorAll(`span[class="${classname}"]`)
        for (let i=0;i<eles.length;i++) {
            let text = eles[i].innerText, followerAccount = text.replace('@', '')
            if (!text.startsWith('@') || followerAccount === myselfAccount) {
                continue
            }
            if (uniqueAccountList.includes(followerAccount)) {
                //账号重复了，去重
                continue
            }
            followers.push({account: followerAccount, profile: `https://x.com/${text.replace('@', '')}`})
        }
        console.log(`找到 ${myselfAccount} 的粉丝数：${followers.length}个，以下是粉丝名单`)
        //console.table(followers)

        for (let i=0;i<followers.length;i++) {
            if (uniqueAccountList.includes(followers[i].account)) {
                //账号重复了，去重
                continue
            }
            uniqueAccountList.push(followers[i].account)
            content.push(`${followers[i].account},${followers[i].profile}`)
        }
        preDom.innerHTML = content.join("<br/>")
    }, 800)
}
