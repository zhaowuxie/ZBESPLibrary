//
//  EspJsonUtils.h
//  Esp32Mesh
//
//  Created by AE on 2018/3/14.
//  Copyright © 2018年 AE. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "EspHttpResponse.h"

@interface EspJsonUtils : NSObject

+ (NSData *)getDataWithDictionary:(NSDictionary *)dictionary;
+ (NSString *)getStringWithDictionary:(NSDictionary *)dictionary;

@end
