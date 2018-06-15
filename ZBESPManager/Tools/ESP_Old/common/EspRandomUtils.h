//
//  EspRandomUtils.h
//  Esp32Mesh
//
//  Created by AE on 2018/3/7.
//  Copyright © 2018年 AE. All rights reserved.
//

#import "EspActionDevice.h"

@interface EspRandomUtils : EspActionDevice

+ (NSString *)randomString:(int)length;

@end
