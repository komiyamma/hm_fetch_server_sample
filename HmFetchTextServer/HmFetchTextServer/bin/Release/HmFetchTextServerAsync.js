

let port = getVar("#PORT");
let target_html_file = currentmacrodirectory() + "\\HmFetchTextServer.html";

browserpanecommand(
    {
        target: "_each",
        url: target_html_file,
        show: 1
    }
);

debuginfo(2);
let port_send = false;
function tickMethod() {
    // テキストが変更になっている時だけ
    if (isTotalTextChange()) {
        browserpanecommand(
            {
                target: "_each",
                url: `javascript:updateFetch(${port})`,
                show: 1
            }
        );
    }
}


let preUpdateCount = 0;
let preTotalText = 0;
function isTotalTextChange() {
    // updateCountで判定することで、テキスト内容の更新頻度を下げる。
    // getTotalTextを分割したりコネコネするのは、行数が多くなってくるとやや負荷になりやすいので
    // テキスト更新してないなら、前回の結果を返す。
    let updateCount = hidemaru.getUpdateCount();
    // 前回から何も変化していないなら、前回の結果を返す。
    if (preUpdateCount == updateCount) {
        return false;
    }
    let totalText = hidemaru.getTotalText();
    if (preTotalText == totalText) {
        return false;
    }

    return true;
}


if (typeof (timerHandle) === "undefined") {
    var timerHandle = 0;
}
hidemaru.clearInterval(timerHandle);
timerHandle = hidemaru.setInterval(tickMethod, 1000);
