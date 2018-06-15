//
//  EspJsonUtils.m
//  Esp32Mesh
//
//  Created by AE on 2018/3/14.
//  Copyright © 2018年 AE. All rights reserved.
//

#import "EspJsonUtils.h"
#import "EspCommonUtils.h"

@implementation EspJsonUtils

+ (NSData *)getDataWithDictionary:(NSDictionary *)dictionary {
    NSError *error;
    NSData *data = [NSJSONSerialization dataWithJSONObject:dictionary options:NSJSONWritingPrettyPrinted error:&error];
    if (error) {
        NSLog(@"%@", error);
        return nil;
    } else {
        return data;
    }
}

+ (NSString *)getStringWithDictionary:(NSDictionary *)dictionary {
    NSData *data = [EspJsonUtils getDataWithDictionary:dictionary];
    if (!data) {
        return nil;
    } else {
        return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    }
}

@end
