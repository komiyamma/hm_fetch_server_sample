

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

    try {

        // (他の)マクロ実行中は安全のため横槍にならないように何もしない。
        if (hidemaru.isMacroExecuting()) {
            return;
        }

	    // この操作対象中は、javascriptによる更新しない。何が起こるかわからん
	    if (isNotDetectedOperation()) {
	        return;
	    }

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
    } catch (e) {
    }
}

function isNotDetectedOperation() {
    /*
    ○ 0x00000002 ウィンドウ移動/サイズ変更中
    × 0x00000004 メニュー操作中
    × 0x00000008 システムメニュー操作中
    × 0x00000010 ポップアップメニュー操作中
    ○ 0x00000100 IME入力中
    × 0x00000200 何らかのダイアログ表示中
    × 0x00000400 ウィンドウがDisable状態
    × 0x00000800 非アクティブなタブまたは非表示のウィンドウ
    × 0x00001000 検索ダイアログの疑似モードレス状態
    ○ 0x00002000 なめらかスクロール中
    ○ 0x00004000 中ボタンによるオートスクロール中
    ○ 0x00008000 キーやマウスの操作直後
    ○ 0x00010000 何かマウスのボタンを押している
    ○ 0x00020000 マウスキャプチャ状態(ドラッグ状態)
    ○ 0x00040000 Hidemaru_CheckQueueStatus相当
    */
    let istatus = hidemaru.getInputStates();
    let during_window_move_resize = istatus & 0x00000002;
    if (during_window_move_resize) {
        // console.log("during_window_move_resize" + "\r\n");
    }
    let during_menu_operation = istatus & 0x00000004;
    if (during_menu_operation) {
        // console.log("during_menu_operation" + "\r\n");
        return true;
    }
    let during_system_menu_operation = istatus & 0x00000008;
    if (during_system_menu_operation) {
        // console.log("during_system_menu_operation" + "\r\n");
        return true;
    }
    let during_popup_menu_operation = istatus & 0x00000010;
    if (during_popup_menu_operation) {
        // console.log("during_popup_menu_operation" + "\r\n");
        return true;
    }
    let during_ime_input = istatus & 0x00000100;
    if (during_ime_input) {
        // console.log("during_ime_input" + "\r\n");
    }
    let during_dialog_display = istatus & 0x00000200;
    if (during_dialog_display) {
        // console.log("during_dialog_display" + "\r\n");
        return true;
    }
    let during_disable_window = istatus & 0x00000400;
    if (during_disable_window) {
        // console.log("during_disable_window" + "\r\n");
        return true;
    }
    let during_non_active_window = istatus & 0x00000800;
    if (during_non_active_window) {
        // console.log("during_non_active_window" + "\r\n");
        return true;
    }
    let during_smooth_scroll = istatus & 0x00002000;
    if (during_smooth_scroll) {
        // console.log("during_smooth_scroll" + "\r\n");
    }
    let during_middle_button_scroll = istatus & 0x00004000;
    if (during_middle_button_scroll) {
        // console.log("during_middle_button_scroll" + "\r\n");
    }
    let during_key_mouse_operation = istatus & 0x00008000;
    if (during_key_mouse_operation) {
        // console.log("during_key_mouse_operation" + "\r\n");
    }
    let during_mouse_button_press = istatus & 0x00010000;
    if (during_mouse_button_press) {
        // console.log("during_mouse_button_press" + "\r\n");
    }
    let during_mouse_drag = istatus & 0x00020000;
    if (during_mouse_drag) {
        // console.log("during_mouse_drag" + "\r\n");
        return true;
    }
    let during_hidemaru_queue = istatus & 0x00040000;
    if (during_hidemaru_queue) {
        // console.log("during_hidemaru_queue" + "\r\n");
    }
    return false;
}


let preUpdateCount = 0;
let preTotalText = 0;
function isTotalTextChange() {
    try {
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
    catch(e) {
    }
    return false;
}


if (typeof (timerHandle) === "undefined") {
    var timerHandle = 0;
}
hidemaru.clearInterval(timerHandle);
timerHandle = hidemaru.setInterval(tickMethod, 1000);
