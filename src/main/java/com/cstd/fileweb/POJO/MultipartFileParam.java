package com.cstd.fileweb.POJO;

/**
 * Create by tianci
 * 2019/1/10 16:33
 */
public class MultipartFileParam {

    private String guid;

    private String id;

    private String type;

    private String lastModifiedDate;

    private String size;

    private String name;    // 分块名

    public void setGuid(String guid) {
        this.guid = guid;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setLastModifiedDate(String lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setExt(String ext) {
        this.ext = ext;
    }

    public void setStatusText(String statusText) {
        this.statusText = statusText;
    }

    public String getGuid() {

        return guid;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getLastModifiedDate() {
        return lastModifiedDate;
    }

    public String getSize() {
        return size;
    }

    public String getFileName() {
        return fileName;
    }

    public String getExt() {
        return ext;
    }

    public String getStatusText() {
        return statusText;
    }

    private String chunk;   // 分块下标记

    private String chunks;  // 所有分块数

    private String fileName; // 上传的文件的名称

    private String ext; //文件扩展名，通过文件名获取，例如test.png的扩展名为png

    private String statusText;  // 状态文字说明。在不同的status语境下有不同的用途

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setChunk(String chunk) {
        this.chunk = chunk;
    }

    public void setChunks(String chunks) {
        this.chunks = chunks;
    }

    public String getChunk() {
        return chunk;
    }

    public String getChunks() {
        return chunks;
    }
}
