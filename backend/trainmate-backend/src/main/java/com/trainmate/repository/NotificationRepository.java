package com.trainmate.repository;

import com.trainmate.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverUserIdOrderByCreatedDateDesc(Long receiverUserId);
    long countByReceiverUserId(Long receiverUserId);
    List<Notification> findByCohort(com.trainmate.entity.Cohort cohort);
    void deleteByCohort(com.trainmate.entity.Cohort cohort);
    
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.receiverUser.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.receiverUser.id = :userId")
    void deleteByReceiverUserId(@Param("userId") Long userId);
    
    List<Notification> findByReceiverUserIdAndIsReadFalse(Long receiverUserId);
    long countByReceiverUserIdAndIsReadFalse(Long receiverUserId);
}
