using System.Collections.Generic;
using System;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using HmNetCOM;


namespace HmFetchTextServer;

public interface IHmFetchTextServer
{
    int Start();
    int Close();

    void OnReleaseObject(int reason);

}

[Guid("1FF92CE3-87CD-4034-9FEE-9DC49F012AD1")]
public class HmFetchTextServer
{
    CancellationTokenSource cts;
    bool isRunning = false;

    HttpListener listener;

    int port = 0;


    public int Start(int portBGN, int portEND)
    {
        try
        {
            port = HmUsedPortChecker.GetAvailablePort(portBGN, portEND);
            if (port == 0)
            {
                Hm.OutputPane.Output("${portBGN}～${portEND}の間に、使用可能なポートが見つかりませんでした。\r\n");
                return 0;
            }

            cts = new CancellationTokenSource();
            _ = Task.Run(() => StartTask(cts.Token), cts.Token);
        }
        catch (Exception e)
        {
            Hm.OutputPane.Output(e.Message + "\r\n");
        }

        return port;
    }

    string text = "";
    private string GetTotalText()
    {
        try
        {
            lock (text)
            {
                text = Hm.Edit.TotalText ?? "";
            }
        }
        catch (Exception e)
        {
        }
        return text;
    }

    private Task StartTask(CancellationToken cts)
    {

        try
        {

            // HTTPリスナー作成
            listener = new HttpListener();

            // リスナー設定
            listener.Prefixes.Clear();
            listener.Prefixes.Add($"http://localhost:{port}/");

            // リスナー開始
            listener.Start();

            isRunning = true;

            while (isRunning)
            {
                try
                {
                    if (cts.IsCancellationRequested)
                    {
                        break;
                    }


                    // リクエスト取得
                    HttpListenerContext context = listener.GetContext();
                    context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                    HttpListenerRequest request = context.Request;


                    // レスポンス取得
                    HttpListenerResponse response = context.Response;

                    // HTMLを表示する
                    if (request != null)
                    {
                        string hmtext = GetTotalText();
                        byte[] text = Encoding.UTF8.GetBytes(hmtext);
                        response.ContentType = "text/html; charset=utf-8";
                        response.ContentEncoding = Encoding.UTF8;
                        response.OutputStream.Write(text, 0, text.Length);
                    }
                    else
                    {
                        response.StatusCode = 404;
                    }
                    response.Close();
                }
                catch (System.Net.HttpListenerException e)
                {
                    if (e.ErrorCode == 995)
                    {
                        // キャンセルなので順当
                    }
                    else
                    {
                        Hm.OutputPane.Output(e.Message + "\r\n");
                    }
                }
                catch (Exception e)
                {
                    Hm.OutputPane.Output(e.Message + "\r\n");
                }
            }

        }
        catch (Exception e)
        {
            Hm.OutputPane.Output(e.Message + "\r\n");
        }

        return Task.CompletedTask;
    }

    public int Close()
    {
        try
        {

            _ = Task.Run(() => CloseTask());
        }
        catch (Exception e)
        {
            Hm.OutputPane.Output(e.Message + "\r\n");
        }
        return 1;
    }

    public void OnReleaseObject(int reason = 0)
    {
        Close();
    }

    private void CloseTask()
    {
        if (listener != null)
        {
            isRunning = false;
            cts.Cancel();
            listener.Stop();
            listener.Close();
        }
    }
}