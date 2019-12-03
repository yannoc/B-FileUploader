package com.cstd.fileweb.service;

import com.cstd.fileweb.POJO.Attachment;
import com.cstd.fileweb.POJO.MultipartFileParam;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.util.Map;

public interface FileMangerService {

    /**
     * 通过md5值查找文件对象
     * @param md5
     * @return
     */
    Map<String, Object> findByFileMd5(String md5);

    /**
     * 上传文件
     * @param param 文件表单信息
     * @param multipartFile 文件
     * @return
     */
    Map<String, Object> realUpload(MultipartFileParam param, MultipartFile multipartFile) throws Exception;

    Map<String, Object> uploadFile(MultipartFileParam param, MultipartFile multipartFile) throws Exception;

    Map<String, Object> saveFileInfo(Attachment param) throws Exception;

    Map<String, Object> downloadFile(HttpServletResponse response, String guid) throws Exception;

    Map<String, Object> getFile() throws Exception;

    Map<String, Object> getFileList(String dbName, String className, String oid) throws Exception;

    Map<String, Object> deleteFileById(String id) throws Exception;

}
