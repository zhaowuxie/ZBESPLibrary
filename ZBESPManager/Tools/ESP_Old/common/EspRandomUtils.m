//
//  EspRandomUtils.m
//  Esp32Mesh
//
//  Created by AE on 2018/3/7.
//  Copyright © 2018年 AE. All rights reserved.
//

#import "EspRandomUtils.h"

static NSString const * STRING_RANGE = @"0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";

@implementation EspRandomUtils

+ (NSString *)randomString:(int)length {
    NSMutableString *ms = [NSMutableString string];
    NSUInteger range = [STRING_RANGE length];
    for (int i = 0; i < length; i++) {
        NSUInteger index = arc4random() % range;
        unichar c = [STRING_RANGE characterAtIndex:index];
        [ms appendString:[NSString stringWithFormat:@"%c", c]];
    }
    
    return ms;
}

@end
