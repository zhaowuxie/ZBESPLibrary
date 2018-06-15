//
//  MainWebViewController.swift
//  ZBESPLibrary
//
//  Created by zhaobing on 2018/6/15.
//  Copyright © 2018年 zhaobing. All rights reserved.
//

import UIKit

class MainWebViewController: UIViewController,UIWebViewDelegate {
    
    var bridge:WebViewJavascriptBridge!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor=UIColor.red
        // Do any additional setup after loading the view.
        let webView = UIWebView.init(frame: self.view.bounds)
        self.view.addSubview(webView)
        WebViewJavascriptBridge.enableLogging()
       
        bridge = WebViewJavascriptBridge.init(forWebView: webView)
        bridge.setWebViewDelegate(self)
 
        bridge.registerHandler("testObjcCallback") { (data, responseCallback) in
            print("testObjcCallback called: \(String(describing: data))")
            responseCallback!("Response from testObjcCallback")
        }
        bridge.callHandler("testJavascriptHandler", data: ["foo":"before ready"])
        
        //self.renderButtons(webView)
        self.loadExamplePage(webView: webView)
    }
    func loadExamplePage(webView:UIWebView) {
        let htmlpath=Bundle.main.path(forResource: "app", ofType: "html")
        let url=URL.init(fileURLWithPath: htmlpath!)
        let data = try? Data.init(contentsOf: url)
        
        
        webView.load(data!, mimeType: "text/html", textEncodingName: "UTF-8", baseURL: url)
        
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    /*
     // MARK: - Navigation
     
     // In a storyboard-based application, you will often want to do a little preparation before navigation
     override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
     // Get the new view controller using segue.destinationViewController.
     // Pass the selected object to the new view controller.
     }
     */
    
    func webViewDidStartLoad(_ webView: UIWebView) {
        print("star")
    }
    func webViewDidFinishLoad(_ webView: UIWebView) {
        print("finish")
    }
    
    func disableSafetyTimeout() {
        self.bridge.disableJavscriptAlertBoxSafetyTimeout()
    }
    
    func callHandler(sender:AnyObject) {
    let data = ["greetingFromObjC":"Hi there, JS!"]
        bridge.callHandler("testJavascriptHandler", data: data) { (response) in
            print("testJavascriptHandler responded:\(String(describing: response))")
        }
    }

}

