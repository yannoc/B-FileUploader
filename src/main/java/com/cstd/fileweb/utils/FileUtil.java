package com.cstd.fileweb.utils;

import java.io.*;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;

/**
 * @program: fileweb
 * @description: 文件操作流
 * @author: yanno
 * @create: 2019/11/29 15:43
 */
public class FileUtil {

    /**
     * 获取文件的MD5
     * @param file
     * @return
     */
    public static String getFileMD5(File file) {
        if (!file.exists() || !file.isFile()) {
            return null;
        }
        MessageDigest digest = null;
        FileInputStream in = null;
        byte buffer[] = new byte[1024];
        int len;
        try {
            digest = MessageDigest.getInstance("MD5");
            in = new FileInputStream(file);
            while ((len = in.read(buffer, 0, 1024)) != -1) {
                digest.update(buffer, 0, len);
            }
            in.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        BigInteger bigInt = new BigInteger(1, digest.digest());
        return bigInt.toString(16);
    }

    /**
     * 取得一个随机的文件名，默认以data_开头
     * @param Suffix
     * @return
     */
    public static String getRandomName(String Suffix){
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        sb.append(fmt.format(new Date()));
        sb.append((int) (random.nextDouble() * (99999 - 10000 + 1)) + 10000);
        sb.append(".").append(Suffix);
        return sb.toString();
    }

    /**
     * 创建目录
     * @param dir
     * @throws Exception
     */
    public static void createPath(String dir)throws Exception{
        File fdir=new File(dir);
        if(fdir.exists()){
            return;
        }
        fdir.mkdir();
    }

    /**
     * 新建文件
     * @param file
     * @throws Exception
     */
    public static boolean createFile(File file)throws Exception{
        if(file == null){
            return false;
        }
        File pfile = file.getParentFile();
        if(file.exists()){
            return false;
        }
        if(pfile.exists()){
            return file.createNewFile();
        }
        if(!pfile.mkdirs()){
            return false;
        }
        return file.createNewFile();
    }

    /**
     * 新建文件
     * @param filePath
     * @throws Exception
     */
    public static void createFile(String filePath)throws Exception{
        File file = new File(filePath);
        createFile(file);
    }
}
