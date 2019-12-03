package com.cstd.fileweb.utils;

import com.google.gson.Gson;

import java.util.Map;

/**
 * @program: fileweb
 * @description: json转化类
 * @author: yanno
 * @create: 2019/11/29 14:52
 */
public class JsonUtil {

    private static Gson gson = new Gson();

    public static <T> String toJson(Map<String, T> map){
        return gson.toJson(map);
    }

    public static <T> T fromJson(String jsonStr, Class<T> classOfT){
        return gson.fromJson(jsonStr, classOfT);
    }

}
