package com.cstd.fileweb.utils;

import java.util.regex.Pattern;

/**
 * @program: fileweb
 * @description: 正则校验工具类
 * @author: yanno
 * @create: 2019/11/29 16:46
 */
public class RegexUtil {

    /**
     * 判断一个路径是不是文件夹路径
     * @param path
     * @return
     */
    public static boolean isDir(String path){

        String regularExpression = "([A-ZA-Z])?(\\\\ [A-ZA-Z0-9 _.-] +)+ \\\\";
        return Pattern.matches(regularExpression,path);
    }
}
