package com.cstd.fileweb.controller;

import com.cstd.fileweb.POJO.Attachment;
import com.cstd.fileweb.POJO.MultipartFileParam;
import com.cstd.fileweb.service.FileMangerService;
import com.cstd.fileweb.utils.JsonUtil;
import org.apache.tomcat.util.http.fileupload.servlet.ServletFileUpload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * @ program: fileweb
 * @ description: 文件上传控制器
 * @ author: yanno
 * @ create: 2019/11/26 17:48
 */

@CrossOrigin(origins="*")   //跨域请求
@RestController
@RequestMapping("/main")
public class FileManagerController {

    @Autowired
    private FileMangerService fileService;

//    @PostMapping("/isUpload")
//    public Map<String, Object> isUpload(@Valid MultipartFileParam form) {
//
//        return fileService.findByFileMd5(form.getId());
//
//    }

    @PostMapping("/save")
    public String saveFileInfo(@Valid Attachment param){
        Map<String, Object> map;
        try {
            map = fileService.saveFileInfo(param);
        } catch(Exception e){
            e.printStackTrace();
            e.printStackTrace();
            map = new HashMap<>();
            map.put("success", false);
            map.put("msg","文件保存出错，请重试！");
            return JsonUtil.toJson(map);
        }
        return JsonUtil.toJson(map);
    }


    @PostMapping("/upload")
    public String upload(HttpServletRequest request, @Valid MultipartFileParam params, @RequestParam(value = "file", required = false) MultipartFile multipartFile) {
        Map<String, Object> map;
        try {
            boolean isMultipart = ServletFileUpload.isMultipartContent(request);
            if(!isMultipart){
                map = new HashMap<>();
                map.put("success", false);
                map.put("msg","文件请求头有误！请检查后再试！");
                return JsonUtil.toJson(map);
            }
            map = fileService.uploadFile(params, multipartFile);
        } catch (Exception e) {
            e.printStackTrace();
            map = new HashMap<>();
            map.put("success", false);
            map.put("msg","文件上传出错，请重试！");
            return JsonUtil.toJson(map);
        }
        return JsonUtil.toJson(map);
    }

    @RequestMapping("/download")
    public String downloadFile(HttpServletResponse response, @RequestParam(value = "guid")String guid){
        Map<String, Object> map;
        try {
            map = fileService.downloadFile(response, guid);
        } catch (Exception e) {
            map = new HashMap<>();
            map.put("success",false);
            map.put("msg","数据下载失败！");
        }
        return JsonUtil.toJson(map);
    }

    @RequestMapping("/getFile")
    public String getFileWithId(){
        //String result = fileService.getFile();
        return "";
    }

    @RequestMapping("/getFiles")
    public String getFilesList(@RequestBody String params){
        Map<String, Object> map;
        try {
            Map param = JsonUtil.fromJson(params,Map.class);
            String dbName = (String) param.get("dbName");
            String className = (String) param.get("className");
            String oid = (String) param.get("oid");
            map = fileService.getFileList(dbName, className, oid);
        } catch (Exception e) {
            e.printStackTrace();
            map = new HashMap<>();
            map.put("success",false);
            map.put("msg","数据获取失败！");
        }
        return JsonUtil.toJson(map);
    }

    @RequestMapping("/deleteFile")
    public String deleteFileById(@RequestParam(value = "guid")String id){
        Map<String, Object> map;
        try {
            map = fileService.deleteFileById(id);
        } catch (Exception e) {
            map = new HashMap<>();
            map.put("success",false);
            map.put("msg","删除数据失败！");
        }
        return JsonUtil.toJson(map);
    }


    @RequestMapping("/test")
    public String getFile(@Valid Attachment param){
        try {
            fileService.getFile();
        } catch (Exception e){
            e.printStackTrace();
        }
        return "";
    }

}
