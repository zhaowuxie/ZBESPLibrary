//
//  ZBESPManager.swift
//  ZBESPLibrary
//
//  Created by zhaobing on 2018/6/11.
//  Copyright © 2018年 zhaobing. All rights reserved.
//

import UIKit
//对外暴露的唯一操作单例
//udp 3232监听数据、状态变化
protocol ZBESPManagerDelegate {
    func deviceseniorChange(senior:[String:[String:String]])//传感器数据变化
    func devicestatusChange(status:[String:String])//连接状态变化
    
    
    func deviceChange(device:[String:DeviceInfo])//设备信息变化
    func phoneStatusChange(code:Int)//手机状态变化
}

class ZBESPManager: NSObject {
    ////对外暴露类单例
    private static var _instance: ZBESPManager! = nil
    static var instance: ZBESPManager! {
        get {
            if _instance == nil {
                
                _instance = ZBESPManager()
            }
            return _instance
        }
        set {
            _instance = newValue
        }
    }
    
    ////初始化配置信息
    private var delegate:ZBESPManagerDelegate!//数据回掉代理
    private var owner:String!//后续本地用，设置本地数据库用户信息
    func setConfig(Delegate:ZBESPManagerDelegate!,Owner:String!) {
        delegate=Delegate
        owner=Owner
    }
    ////蓝牙配网 发送Wi-Fi名密码
    func starBlePair(wifiName:String,passWord:String,callBack:((String)->Void)) {
        
    }
    func cancleBlePair() {//取消蓝牙配网
        
    }
    ////设备信息:增、删、改、查
    //
    //
    
    ////数据：传感器、状态
    //订阅消息
    //取消订阅
    //数据回传
    //发送控制指令
    
    
    ////设备环境变化：根节点，设备数量等
    
    ////手机环境变化：Wi-Fi状态，蓝牙状态，进入后台，进入前台，socket、http连接等等
    
    ////其它方法
    //获取当前连接wifi名
    var currentWifiName: String?{
        get {
            return ""//EspNetUtils.getCurrentWiFiSsid()
        }
    }
    //获取当前手机ip地址
    var currentPhoneIP: String?{
        get {
            let ip = ""//EspNetUtils.getIPAddress(true)
            print("当前手机IP："+ip)
            return ip
        }
    }
}
