//
//  ZBESPHTTPManager.swift
//  ZBESPLibrary
//
//  Created by zhaobing on 2018/6/15.
//  Copyright © 2018年 zhaobing. All rights reserved.
//

import UIKit

class ZBESPHTTPManager: NSObject {
    private static var _instance: ZBESPHTTPManager! = nil
    static var instance: ZBESPHTTPManager! {
        get {
            if _instance == nil {
                
                _instance = ZBESPHTTPManager()
            }
            return _instance
        }
        set {
            _instance = newValue
        }
    }
    
    func sendData(mac:String,param:[String:String],callBack:((AnyObject)->Void)) {
        //通过mac找到对应的host和port
        //然后发送请求，返回值回掉
        
    }
    
}
