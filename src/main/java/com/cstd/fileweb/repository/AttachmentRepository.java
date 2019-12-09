package com.cstd.fileweb.repository;

import com.cstd.fileweb.POJO.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @program: fileweb
 * @description:
 * @author: yanno
 * @create: 2019/12/02 15:59
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, String> {

    @Override
    Optional<Attachment> findById(String s);

    @Query("select u from Attachment u where u.dbName = :dbName and u.className = :className and u.oid= :oid")
    List<Attachment> findByParams(@Param("dbName") String dbName,
                                               @Param("className") String className,
                                               @Param("oid") String oid);
    @Override
    Attachment save(Attachment attr);

    @Override
    void deleteById(String s);

}
