package com.cstd.fileweb.service.impl;

import com.cstd.fileweb.POJO.Attachment;
import com.cstd.fileweb.POJO.MultipartFileParam;
import com.cstd.fileweb.repository.AttachmentRepository;
import com.cstd.fileweb.service.FileMangerService;
import com.cstd.fileweb.utils.FileUtil;
import com.cstd.fileweb.utils.KeyUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Attr;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Date;

/**
 * @program: fileweb
 * @description: 文件服务管理实现类
 * @author: yanno
 * @create: 2019/11/26 17:55
 */

@Service
public class FileManagerServiceImpl implements FileMangerService {

    private static final String PATH = "E:/CSTD/TDM/data";

    private static final String PROPS_PATH = "E:/CSTD/TDM/properties";

    private static final String TEMP_PATH = "E:/CSTD/TDM/temp";

    private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMdd");

    @Autowired
    private AttachmentRepository attaRepository;

    @Override
    public Map<String, Object> findByFileMd5(String md5) {
        Attachment uploadFile = null;

        Map<String, Object> map = null;
        if (uploadFile == null) {
            //没有上传过文件
            map = new HashMap<>();
            map.put("flag", 0);
            map.put("fileId", KeyUtil.genUniqueKey());
            map.put("date", simpleDateFormat.format(new Date()));
        }
//        else {
            //上传过文件，判断文件现在还存在不存在
            // File file = new File(uploadFile.getFilePath());

            //if (file.exists()) {
//                if (uploadFile.getFileStatus() == 1) {
//                    //文件只上传了一部分
//                    map = new HashMap<>();
//                    map.put("flag", 1);
//                    map.put("fileId", uploadFile.getFileId());
//                    map.put("date", simpleDateFormat.format(new Date()));
//                } else if (uploadFile.getFileStatus() == 2) {
//                    //文件早已上传完整
//                    map = new HashMap<>();
//                    map.put("flag" , 2);
//                }
//            } else {
//
//                map = new HashMap<>();
//                map.put("flag", 0);
//                map.put("fileId", uploadFile.getFileId());
//                map.put("date", simpleDateFormat.format(new Date()));
//            }
//        }
        return map;
    }

    public Map<String, Object> realUpload(MultipartFileParam form, MultipartFile multipartFile) throws Exception {
        Map<String, Object> map = null;
        /* String action = form.getAction();
        String fileId = form.getGuid();
        Integer index = Integer.valueOf(form.getIndex());
        String partMd5 = form.getPartMd5();
        String md5 = form.getMd5();
        Integer total = Integer.valueOf(form.getTotal());
        String fileName = form.getName();
        String size = form.getSize();
        String suffix = NameUtil.getExtensionName(fileName);

        String saveDirectory = PATH + File.separator + fileId;
        String filePath = saveDirectory + File.separator + fileId + "." + suffix;
        //验证路径是否存在，不存在则创建目录
        File path = new File(saveDirectory);
        if (!path.exists()) {
            path.mkdirs();
        }
        //文件分片位置
        File file = new File(saveDirectory, fileId + "_" + index);

        //根据action不同执行不同操作. check:校验分片是否上传过; upload:直接上传分片

        if ("check".equals(action)) {
            String md5Str = FileUtil.getFileMD5(file);
            if (md5Str != null && md5Str.length() == 31) {
                System.out.println("check length =" + partMd5.length() + " md5Str length" + md5Str.length() + "   " + partMd5 + " " + md5Str);
                md5Str = "0" + md5Str;
            }
            if (md5Str != null && md5Str.equals(partMd5)) {
                //分片已上传过
                map = new HashMap<String, Object>();
                map.put("flag", "1");
                map.put("fileId", fileId);
                if(index != total)
                    return map;
            } else {
                //分片未上传
                map = new HashMap<>();
                map.put("flag", "0");
                map.put("fileId", fileId);
                return map;
            }
        } else if("upload".equals(action)) {
            //分片上传过程中出错,有残余时需删除分块后,重新上传
            if (file.exists()) {
                file.delete();
            }
            multipartFile.transferTo(new File(saveDirectory, fileId + "_" + index));
            map = new HashMap<>();
            map.put("flag", "1");
            map.put("fileId", fileId);
            if(index != total)
                return map;
        }

        if (path.isDirectory()) {
            File[] fileArray = path.listFiles();
            if (fileArray != null) {
                if (fileArray.length == total) {
                    //分块全部上传完毕,合并

                    File newFile = new File(saveDirectory, fileId + "." + suffix);
                    FileOutputStream outputStream = new FileOutputStream(newFile, true);//文件追加写入
                    byte[] byt = new byte[10 * 1024 * 1024];
                    int len;
                    FileInputStream temp = null;//分片文件
                    for (int i = 0; i < total; i++) {
                        int j = i + 1;
                        temp = new FileInputStream(new File(saveDirectory, fileId + "_" + j));
                        while ((len = temp.read(byt)) != -1) {
                            outputStream.write(byt, 0, len);
                        }
                    }
                    //关闭流
                    temp.close();
                    outputStream.close();
                    //修改FileRes记录为上传成功
                    UploadFile uploadFile = new UploadFile();
                    uploadFile.setFileId(fileId);
                    uploadFile.setFileStatus(2);
                    uploadFile.setFileName(fileName);
                    uploadFile.setFileMd5(md5);
                    uploadFile.setFileSuffix(suffix);
                    uploadFile.setFilePath(filePath);
                    uploadFile.setFileSize(size);

                    //uploadFileRepository.save(uploadFile);

                    map=new HashMap<String, Object>();
                    map.put("fileId", fileId);
                    map.put("flag", "2");

                    return map;
                } else if(index == 1) {
                    //文件第一个分片上传时记录到数据库
                    UploadFile uploadFile = new UploadFile();
                    uploadFile.setFileMd5(md5);
                    String name = NameUtil.getFileNameNoEx(fileName);
                    if (name.length() > 32) {
                        name = name.substring(0, 32);
                    }
                    uploadFile.setFileName(name);
                    uploadFile.setFileSuffix(suffix);
                    uploadFile.setFileId(fileId);
                    uploadFile.setFilePath(filePath);
                    uploadFile.setFileSize(size);
                    uploadFile.setFileStatus(1);

                    //uploadFileRepository.save(uploadFile);
                }
            }
        }*/
        return map;
    }

    public Map<String, Object> saveFileInfo(Attachment param) throws Exception{
        Map<String, Object> result = new HashMap<>();
        String savePath = mergeFiles(param.getGuid(), param.getExt());
        if(null == savePath || "".equals(savePath)){
           // 合并文件失败
            result.put("success",false);
            result.put("msg", "文件保存出错！");
        }
        // 保存文件信息
        param.setCreateTime(new Date());
        param.setFilePath(savePath);
        Attachment atta = attaRepository.save(param);
        result.put("success",true);
        result.put("msg", "文件保存成功！");
        result.put("data",atta);
        return result;
    }

    public Map<String, Object> uploadFile(MultipartFileParam params, MultipartFile file) throws Exception  {
        Map<String, Object> result = new HashMap<>();
        String guid = params.getGuid();
        String chunk = params.getChunk();
        String tempFileDir = TEMP_PATH+File.separator+guid;
        File parentFileDir = new File(tempFileDir);
        // 分片处理时，前台会多次调用上传接口，每次都会上传文件的一部分到后台
        File tempPartFile = new File(parentFileDir, guid + "_" + chunk + ".cstd");
        FileUtils.copyInputStreamToFile(file.getInputStream(), tempPartFile);
        result.put("success",true);
        result.put("msg",guid+"_"+chunk+"片段保存成功");
        return result;
    }


    public Map<String, Object> downloadFile(HttpServletResponse response, String guid) throws Exception {
        Map<String,Object> result = new HashMap<>();
        Attachment attr = attaRepository.getOne(guid);
        if(null == attr){
            result.put("success", false);
            result.put("msg","没有该附件信息！");
            return result;
        }
        File file = new File(attr.getFilePath());//下载目录加文件名拼接成realpath
        if(!file.exists()){
            result.put("success", false);
            result.put("msg","服务器上找不到文件！");
            return result;
        }
        response.setHeader("Content-Disposition", "attachment;fileName=" + attr.getFileName());
        byte[] buffer = new byte[1024];
        FileInputStream fis = null; //文件输入流
        BufferedInputStream bis = null;
        OutputStream os = null; //输出流
        try {
            os = response.getOutputStream();
            fis = new FileInputStream(file);
            bis = new BufferedInputStream(fis);
            int i = bis.read(buffer);
            while(i != -1){
                os.write(buffer);
                i = bis.read(buffer);
            }
        }finally {
            bis.close();
            fis.close();
        }
        result.put("success", true);
        result.put("msg","文件下载成功！");
        return result;
    }

    public Map<String, Object> getFile() {

        return null;
    }

    /**
     * 合并文件
     * @throws Exception
     */
    private String mergeFiles(String guid, String fileName) throws Exception {
        String folder = TEMP_PATH+File.separator+guid;
        String targetPath = PATH + File.separator+ "data_"+FileUtil.getRandomName(fileName);
        File file = new File(folder);
        if(!file.isDirectory()){
            throw new Exception("找不到分片目录，合成失败！");
        }
        File[] partFiles = file.listFiles();
        if(partFiles == null || partFiles.length < 1){
            throw new Exception("文件分片不存在，合成失败！");
        }
        File resultFile = new File(targetPath);
        boolean cfs = FileUtil.createFile(resultFile);
        if(!cfs){
            throw new Exception("目标文件已存在或目标文件创建失败！");
        }
        if (partFiles.length == 1) {
            if(partFiles[0].renameTo(resultFile)){
                // 删除临时目录中的分片文件
                FileUtils.deleteDirectory(file);
            }
        }

        FileChannel resultFileChannel = new FileOutputStream(resultFile, true).getChannel();
        for (File partFile : partFiles) {
            FileChannel blk = new FileInputStream(partFile).getChannel();
            resultFileChannel.transferFrom(blk, resultFileChannel.size(), blk.size());
            blk.close();
        }
        resultFileChannel.close();

        // 删除临时目录中的分片文件
        FileUtils.deleteDirectory(file);
        return targetPath;
    }

    public Map<String, Object> getFileList(String dbName, String className, String oid) {
        Map<String, Object> result = new HashMap<>();
        List<Attachment> attachments = attaRepository.findByParams(dbName, className, oid);
        result.put("success",true);
        result.put("msg","附件信息获取成功");
        result.put("data",attachments);
        return result;
    }

    public Map<String, Object> deleteFileById(String id) {
        Map<String, Object> result = new HashMap<>();
        attaRepository.deleteById(id);
        result.put("success",true);
        result.put("msg","删除数据成功！");
        return result;
    }


}
