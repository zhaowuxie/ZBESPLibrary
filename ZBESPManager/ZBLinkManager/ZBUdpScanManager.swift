//
//  ZBLinkManager.swift
//  ZBESPLibrary
//
//  Created by zhaobing on 2018/6/12.
//  Copyright © 2018年 zhaobing. All rights reserved.
//

import UIKit

struct DeviceInfo {
    var mac = ""
    var host = ""
    var port = ""
    var httpType = "http" //默认http ，还有https的
    var name = "ESP32 Mesh"
}
class ZBLinkManager: NSObject,GCDAsyncUdpSocketDelegate {
    private static var _instance: ZBLinkManager! = nil
    static var instance: ZBLinkManager! {
        get {
            if _instance == nil {
                
                _instance = ZBLinkManager()
            }
            return _instance
        }
        set {
            _instance = newValue
        }
    }
    var deviceArr = [String:DeviceInfo]()
    let Port = UInt16(1025)
    var udpClient: GCDAsyncUdpSocket?
    required  override init() {//单
        super.init()
        udpInit()
    }


    var timerReconnect:Timer?
    @objc private func udpInit(){
        udpClient = GCDAsyncUdpSocket(delegate: self, delegateQueue: DispatchQueue.global())
        do {
            try udpClient?.enableBroadcast(true)
            try udpClient?.bind(toPort: Port)
            try udpClient?.beginReceiving()
        } catch let err as NSError {
            print(">>> Error while initializing socket: \(err.localizedDescription)")
            timerReconnect?.invalidate()
            timerReconnect=nil
            timerReconnect=Timer.init(timeInterval: 5, target: self, selector: #selector(udpInit), userInfo: nil, repeats: false)
            RunLoop.current.add(timerReconnect!, forMode: RunLoopMode.defaultRunLoopMode)
            udpClient?.close()
            udpClient=nil
        }
    }
    
    var timerScan:Timer?
    //private var rootInfos = [String:wifiScanInfo]()//根节点信息组
    
    func starScan() {
        if timerScan==nil {
            timerScan?.invalidate()
            timerScan=nil
            timerScan=Timer.init(timeInterval: 5, target: self, selector: #selector(udpSend), userInfo: nil, repeats: true)
            RunLoop.current.add(timerScan!, forMode: RunLoopMode.defaultRunLoopMode)
        }
    }
    func stopScan() {
        timerReconnect?.invalidate()
        timerReconnect=nil
        timerScan?.invalidate()
        timerScan=nil
        udpClient?.close()
        udpClient=nil
    }
    func udpSocket(_ sock: GCDAsyncUdpSocket, didReceive data: Data, fromAddress address: Data, withFilterContext filterContext: Any?) {
        guard let stringData = String(data: data, encoding: String.Encoding.utf8) else {
            return
        }
        let ip=GCDAsyncUdpSocket.host(fromAddress: address)?.components(separatedBy: ":").last
        if stringData.contains("ESP32 Mesh") {
            var tmpDevice = DeviceInfo.init()
            tmpDevice.host=ip!
            let infoArr = stringData.components(separatedBy: " ")
            tmpDevice.mac = infoArr[2]
            tmpDevice.httpType = infoArr[3]
            tmpDevice.port = infoArr[4]
            deviceArr[tmpDevice.mac]=tmpDevice
        }
    }
    @objc private func udpSend()  {
        udpClient?.send("Are You Espressif IOT Smart Device?".data(using: String.Encoding.utf8)!, toHost: "255.255.255.255", port: Port, withTimeout: -1, tag: 0)
    }

    //获取根节点下其它设备信息
    func getAllDeviceFromRoot(rootURL:String) {
        
    }
}
