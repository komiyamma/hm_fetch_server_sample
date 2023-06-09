﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;

namespace HmFetchTextServer;

internal class HmUsedPortChecker
{
    static List<int> portsInUse;
    public static int GetAvailablePort(int beginPort, int endPort)
    {
        var ipGP = IPGlobalProperties.GetIPGlobalProperties();
        var tcpEPs = ipGP.GetActiveTcpListeners();
        var udpEPs = ipGP.GetActiveUdpListeners();
        portsInUse = tcpEPs.Concat(udpEPs).Select(p => p.Port).ToList();

        for (int port = beginPort; port <= endPort; ++port)
        {
            if (!portsInUse.Contains(port))
            {
                return port;
            }
        }

        return 0; // 空きポートが見つからない場合
    }
}

