package com.cstd.fileweb.POJO;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

/**
 * @program: fileweb
 * @description: 附件实体类
 * @author: yanno
 * @create: 2019/11/30 13:46
 */
@Entity
@Table(name = "Attachment")
public class Attachment implements Serializable {
    /* uuid */
    @Id
    private String guid;

    /* 文件名字 */
    @Column(nullable = false)
    private String fileName;

    /* 文件路径 */
    @Column(nullable = false)
    private String filePath;

    /* 文件大小 */
    @Column
    private String fileSize;

    /* 文件后缀 */
    @Column(nullable = false)
    private String ext;

    @Column
    private Date createTime;

    @Column
    private String createUser;

    @Column
    private String oid;

    @Column
    private String dbName;

    @Column
    private String className;

    public Attachment(){

    }
    public Attachment(String guid, String fileName, String filePath, String fileSize, String ext,Date createTime, String createUser, String oid,String dbName, String className){
        this.guid = guid;
        this.fileName= fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.ext = ext;
        this.createTime = createTime;
        this.createUser = createUser;
        this.oid = oid;
        this.dbName = dbName;
        this.className = className;
    }

    public void setOid(String oid) {
        this.oid = oid;
    }

    public String getOid() {

        return oid;
    }

    public String getGuid() {
        return guid;
    }

    public String getFilePath() {
        return filePath;
    }

    public String getFileSize() {
        return fileSize;
    }

    public String getExt() {
        return ext;
    }

    public String getFileName() {
        return fileName;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public String getCreateUser() {
        return createUser;
    }

    public String getDbName() {
        return dbName;
    }

    public String getClassName() {
        return className;
    }

    public void setGuid(String guid) {

        this.guid = guid;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public void setExt(String ext) {
        this.ext = ext;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public void setCreateUser(String createUser) {
        this.createUser = createUser;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    public void setClassName(String className) {
        this.className = className;
    }
}
